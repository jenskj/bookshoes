#!/usr/bin/env npx tsx
/**
 * Add an existing user to a club.
 *
 * Usage:
 *   pnpm run add-user-to-club -- you@example.com
 *   pnpm run add-user-to-club -- you@example.com "The Spine Breakers"
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.migration.
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.migration') });

type UserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  memberships: string[] | null;
  active_club_id: string | null;
};

type ClubRow = {
  id: string;
  name: string;
  created_at?: string | null;
};

function normalizeArgs() {
  return process.argv.slice(2).filter((arg) => arg !== '--');
}

async function run() {
  const [emailArg, clubNameArg] = normalizeArgs();

  if (!emailArg) {
    console.error('Usage: pnpm run add-user-to-club -- <email> [club-name]');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.migration');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userRows, error: userError } = await supabase
    .from('users')
    .select('id, email, display_name, memberships, active_club_id')
    .ilike('email', emailArg)
    .limit(1);

  if (userError) {
    console.error('Failed to find user:', userError.message);
    process.exit(1);
  }

  const user = (userRows?.[0] ?? null) as UserRow | null;
  if (!user) {
    console.error(
      `No user found for "${emailArg}". Sign in once with that account first so a row exists in public.users.`
    );
    process.exit(1);
  }

  const scoreClub = async (club: ClubRow) => {
    const { count: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id);

    const { count: memberCount } = await supabase
      .from('club_members')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id);

    const { count: bookCount } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', club.id);

    return {
      ...club,
      score:
        (meetingCount ?? 0) * 1_000 +
        (memberCount ?? 0) * 10 +
        (bookCount ?? 0),
    };
  };

  const pickBestClub = async (candidates: ClubRow[]) => {
    if (!candidates.length) return null;
    const scored = await Promise.all(candidates.map((club) => scoreClub(club)));
    scored.sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );
    return scored[0];
  };

  let selectedClub: (ClubRow & { score?: number }) | null = null;

  if (clubNameArg) {
    const { data: clubRows, error: clubError } = await supabase
      .from('clubs')
      .select('id, name, created_at')
      .ilike('name', clubNameArg)
      .limit(20);

    if (clubError) {
      console.error('Failed to look up club:', clubError.message);
      process.exit(1);
    }

    selectedClub = await pickBestClub((clubRows as ClubRow[] | null) ?? []);
    if (!selectedClub) {
      console.error(`No club found matching "${clubNameArg}".`);
      process.exit(1);
    }
  } else {
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name, created_at')
      .order('created_at', { ascending: true })
      .limit(50);

    if (clubsError) {
      console.error('Failed to load clubs:', clubsError.message);
      process.exit(1);
    }

    selectedClub = await pickBestClub((clubs as ClubRow[] | null) ?? []);
    if (!selectedClub) {
      console.error('No clubs found. Run supabase/seed.sql first.');
      process.exit(1);
    }
  }

  const { error: memberError } = await supabase
    .from('club_members')
    .upsert(
      { club_id: selectedClub.id, user_id: user.id, role: 'standard' },
      { onConflict: 'club_id,user_id' }
    );

  if (memberError) {
    console.error('Failed to upsert club member row:', memberError.message);
    process.exit(1);
  }

  const memberships = Array.from(
    new Set([...(user.memberships ?? []), selectedClub.id])
  );
  const nextActiveClubId = user.active_club_id ?? selectedClub.id;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      memberships,
      active_club_id: nextActiveClubId,
      modified_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to update user memberships:', updateError.message);
    process.exit(1);
  }

  console.log(`Added ${user.email ?? user.id} to "${selectedClub.name}".`);
  console.log(`Active club: ${nextActiveClubId}`);
  console.log(`Membership count: ${memberships.length}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
