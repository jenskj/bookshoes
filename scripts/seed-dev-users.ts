#!/usr/bin/env npx tsx
/**
 * Create 20 dev users and assign them to clubs (club_members + users.memberships).
 * Run after supabase/seed.sql so clubs exist.
 *
 * Usage: pnpm run seed:dev-users
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.migration (use your DEV project).
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.migration') });

const DEV_PASSWORD = 'dev-seed-password-ChangeMe';

type ClubRow = {
  id: string;
  name: string;
  created_at: string | null;
};

const USERS: { email: string; full_name: string }[] = [
  { email: 'river.page@bookshoes-dev.local', full_name: 'River Page' },
  { email: 'sage.booker@bookshoes-dev.local', full_name: 'Sage Booker' },
  { email: 'quinn.spine@bookshoes-dev.local', full_name: 'Quinn Spine' },
  { email: 'morgan.leaf@bookshoes-dev.local', full_name: 'Morgan Leaf' },
  { email: 'reese.chapter@bookshoes-dev.local', full_name: 'Reese Chapter' },
  { email: 'blair.novel@bookshoes-dev.local', full_name: 'Blair Novel' },
  { email: 'jordan.ink@bookshoes-dev.local', full_name: 'Jordan Ink' },
  { email: 'casey.bind@bookshoes-dev.local', full_name: 'Casey Bind' },
  { email: 'avery.folio@bookshoes-dev.local', full_name: 'Avery Folio' },
  { email: 'hayden.shelf@bookshoes-dev.local', full_name: 'Hayden Shelf' },
  { email: 'parker.dewey@bookshoes-dev.local', full_name: 'Parker Dewey' },
  { email: 'skyler.margin@bookshoes-dev.local', full_name: 'Skyler Margin' },
  { email: 'remy.paperback@bookshoes-dev.local', full_name: 'Remy Paperback' },
  { email: 'jules.bookmark@bookshoes-dev.local', full_name: 'Jules Bookmark' },
  { email: 'frankie.dewey@bookshoes-dev.local', full_name: 'Frankie Dewey' },
  { email: 'lou.lit@bookshoes-dev.local', full_name: 'Lou Lit' },
  { email: 'sam.volume@bookshoes-dev.local', full_name: 'Sam Volume' },
  { email: 'alex.prose@bookshoes-dev.local', full_name: 'Alex Prose' },
  { email: 'charlie.verse@bookshoes-dev.local', full_name: 'Charlie Verse' },
  { email: 'robin.bind@bookshoes-dev.local', full_name: 'Robin Bind' },
];

// Club names must match supabase/seed.sql. Each row = one user (by index 0..19); value = list of club names.
const CLUB_NAMES = [
  'The Spine Breakers',
  'Marginalia Collective',
  'Late Night Library',
  'Shelf Indulgence',
  'The Dog-Eared Society',
  'Prose and Cons',
];

const USER_CLUBS: string[][] = [
  ['The Spine Breakers'],
  ['The Spine Breakers', 'Marginalia Collective'],
  ['The Spine Breakers', 'Marginalia Collective', 'Late Night Library'],
  ['Marginalia Collective', 'Late Night Library'],
  ['Late Night Library'],
  ['Late Night Library', 'Shelf Indulgence'],
  ['Shelf Indulgence'],
  ['Shelf Indulgence', 'The Dog-Eared Society'],
  ['The Dog-Eared Society'],
  ['The Dog-Eared Society', 'Prose and Cons'],
  ['Prose and Cons'],
  ['Prose and Cons', 'The Spine Breakers'],
  ['The Spine Breakers', 'Shelf Indulgence'],
  ['Marginalia Collective', 'Prose and Cons'],
  ['Late Night Library', 'The Dog-Eared Society'],
  ['The Spine Breakers', 'Marginalia Collective', 'Shelf Indulgence'],
  ['Marginalia Collective', 'Late Night Library', 'Prose and Cons'],
  ['The Dog-Eared Society', 'Prose and Cons', 'The Spine Breakers'],
  ['Shelf Indulgence', 'The Dog-Eared Society', 'Marginalia Collective'],
  ['The Spine Breakers', 'Late Night Library', 'Shelf Indulgence', 'Prose and Cons'],
];

async function run() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.migration');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('Using Supabase project:', supabaseUrl.replace(/^https:\/\//, '').split('.')[0]);
  console.log('Fetching clubs...');
  const { data: clubs, error: clubsErr } = await supabase
    .from('clubs')
    .select('id, name, created_at');
  if (clubsErr) {
    console.error('Clubs query error:', clubsErr.message);
    process.exit(1);
  }
  if (!clubs?.length) {
    console.error('No clubs found. Run supabase/seed.sql in the SQL Editor for this project first.');
    console.error('Check that .env.migration points to the same project where you ran the seed.');
    process.exit(1);
  }

  const { data: meetings } = await supabase.from('meetings').select('club_id');
  const { data: books } = await supabase.from('books').select('club_id');

  const meetingCounts = new Map<string, number>();
  for (const m of meetings ?? []) {
    meetingCounts.set(m.club_id, (meetingCounts.get(m.club_id) ?? 0) + 1);
  }

  const bookCounts = new Map<string, number>();
  for (const b of books ?? []) {
    bookCounts.set(b.club_id, (bookCounts.get(b.club_id) ?? 0) + 1);
  }

  const clubRows = clubs as ClubRow[];
  const clubByName = new Map<string, string>();
  for (const clubName of CLUB_NAMES) {
    const candidates = clubRows.filter((c) => c.name === clubName);
    if (!candidates.length) continue;
    candidates.sort((a, b) => {
      const byMeetings = (meetingCounts.get(b.id) ?? 0) - (meetingCounts.get(a.id) ?? 0);
      if (byMeetings !== 0) return byMeetings;

      const byBooks = (bookCounts.get(b.id) ?? 0) - (bookCounts.get(a.id) ?? 0);
      if (byBooks !== 0) return byBooks;

      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });

    clubByName.set(clubName, candidates[0].id);
    if (candidates.length > 1) {
      console.log(
        `Resolved duplicate club name "${clubName}" -> ${candidates[0].id} (meetings=${meetingCounts.get(candidates[0].id) ?? 0})`
      );
    }
  }

  const userIds: string[] = [];

  console.log('Creating users...');
  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });
    if (error) {
      if (error.message.includes('already been registered')) {
        const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).single();
        if (existing) userIds.push(existing.id);
        continue;
      }
      console.error(`Failed to create ${u.email}:`, error.message);
      continue;
    }
    if (authUser?.user?.id) userIds.push(authUser.user.id);
  }

  if (userIds.length === 0) {
    console.error('No users created or found.');
    process.exit(1);
  }

  console.log(`Adding club members (${userIds.length} users)...`);
  for (let i = 0; i < userIds.length && i < USER_CLUBS.length; i++) {
    const userId = userIds[i];
    const names = USER_CLUBS[i] ?? [];
    for (const clubName of names) {
      const clubId = clubByName.get(clubName);
      if (!clubId) continue;
      await supabase.from('club_members').upsert(
        { club_id: clubId, user_id: userId, role: i % 10 === 0 ? 'admin' : 'standard' },
        { onConflict: 'club_id,user_id' }
      );
    }
  }

  console.log('Syncing users.memberships and active_club_id...');
  const { data: members } = await supabase.from('club_members').select('user_id, club_id');
  const userToClubs = new Map<string, string[]>();
  for (const m of members ?? []) {
    const arr = userToClubs.get(m.user_id) ?? [];
    if (!arr.includes(m.club_id)) arr.push(m.club_id);
    userToClubs.set(m.user_id, arr);
  }
  for (const [userId, clubIds] of userToClubs) {
    await supabase
      .from('users')
      .update({
        memberships: clubIds,
        active_club_id: clubIds[0] ?? null,
        modified_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  console.log('Done. 20 dev users created; memberships assigned.');
  console.log('To sign in as a seeded user: enable Email provider in Supabase Auth, then use');
  console.log('  password: ' + DEV_PASSWORD);
  USERS.slice(0, 5).forEach((u) => console.log('  ', u.email));
  console.log('  ... and 15 more.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
