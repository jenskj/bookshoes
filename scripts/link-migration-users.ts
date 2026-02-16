#!/usr/bin/env npx tsx
/**
 * Link migration users to Google sign-in users.
 *
 * When users sign in with Google after the migration, Supabase may create new
 * auth users instead of linking to the migration-created ones. This script
 * transfers all data (memberships, club members, ratings, comments, etc.)
 * from the migration user to the sign-in user.
 *
 * Usage:
 *   pnpm run link:migration-users                    # Auto-link by matching email
 *   pnpm run link:migration-users -- --dry-run      # Preview
 *   pnpm run link:migration-users -- --list         # List all users (to build mapping)
 *   pnpm run link:migration-users -- --map FILE     # Manual mapping: old_id -> new_id
 *
 * Mapping file format (scripts/user-mapping.json):
 *   { "migration-user-uuid": "google-signin-user-uuid", ... }
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.migration
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.migration') });

const DRY_RUN = process.argv.includes('--dry-run');
const LIST = process.argv.includes('--list');
const mapIdx = process.argv.indexOf('--map');
const MAP_FILE = mapIdx >= 0 ? process.argv[mapIdx + 1] : null;

interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  memberships: string[];
  active_club_id: string | null;
  created_at: string;
}

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

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, display_name, memberships, active_club_id, created_at');

  if (usersError) {
    console.error('Failed to fetch users:', usersError.message);
    process.exit(1);
  }

  const allUsers = (users ?? []) as UserRow[];

  if (LIST) {
    console.log('Users in public.users (use these IDs for --map):\n');
    for (const u of allUsers.sort((a, b) => a.created_at.localeCompare(b.created_at))) {
      const memberCount = (u.memberships ?? []).length;
      console.log(`  ${u.id}`);
      console.log(`    email: ${u.email ?? '(none)'}`);
      console.log(`    display_name: ${u.display_name ?? '(none)'}`);
      console.log(`    memberships: ${memberCount} club(s)`);
      console.log(`    created_at: ${u.created_at}`);
      console.log('');
    }
    console.log('To create a mapping file, copy scripts/user-mapping.example.json to scripts/user-mapping.json');
    console.log('and fill in: migration-user-id -> google-signin-user-id for each person.');
    return;
  }

  let toMerge: Array<{ oldUsers: UserRow[]; newUser: UserRow }> = [];

  if (MAP_FILE) {
    const mapPath = path.isAbsolute(MAP_FILE) ? MAP_FILE : path.resolve(process.cwd(), MAP_FILE);
    if (!fs.existsSync(mapPath)) {
      console.error(`Mapping file not found: ${mapPath}`);
      process.exit(1);
    }
    const mapping = JSON.parse(fs.readFileSync(mapPath, 'utf-8')) as Record<string, string>;
    const userById = new Map(allUsers.map((u) => [u.id, u]));
    for (const [oldId, newId] of Object.entries(mapping)) {
      const oldUser = userById.get(oldId);
      const newUser = userById.get(newId);
      if (!oldUser) {
        console.warn(`  Skipping ${oldId}: not found in users`);
        continue;
      }
      if (!newUser) {
        console.warn(`  Skipping ${oldId} -> ${newId}: target user not found`);
        continue;
      }
      toMerge.push({ oldUsers: [oldUser], newUser });
    }
    console.log(`Loaded ${toMerge.length} mapping(s) from ${mapPath}\n`);
  } else {
    console.log('Linking migration users to Google sign-in users by email...\n');
    const usersWithEmail = allUsers.filter((u) => u.email?.trim());
    const byEmail = new Map<string, UserRow[]>();
    for (const u of usersWithEmail) {
      const key = u.email!.toLowerCase().trim();
      if (!byEmail.has(key)) byEmail.set(key, []);
      byEmail.get(key)!.push(u);
    }
    for (const [, list] of byEmail) {
      if (list.length < 2) continue;
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      toMerge.push({ oldUsers: list.slice(0, -1), newUser: list[list.length - 1] });
    }
  }

  if (DRY_RUN) console.log('--- DRY RUN ---\n');

  if (toMerge.length === 0) {
    console.log('No users to link.');
    if (!MAP_FILE) {
      console.log('\nIf emails do not match, use --map with a manual mapping file:');
      console.log('  pnpm run link:migration-users -- --list   # List users and IDs');
      console.log('  pnpm run link:migration-users -- --map scripts/user-mapping.json');
    }
    return;
  }

  console.log(`Found ${toMerge.length} email(s) with duplicates to link:\n`);
  for (const { oldUsers, newUser } of toMerge) {
    console.log(`  ${newUser.email}: ${oldUsers.map((u) => u.id).join(', ')} -> ${newUser.id}`);
  }
  console.log('');

  for (const { oldUsers, newUser } of toMerge) {
    const newId = newUser.id;

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would merge ${oldUsers.map((u) => u.id).join(', ')} -> ${newId}`);
      continue;
    }

    console.log(`Merging ${newUser.email} (${oldUsers.map((u) => u.id).join(', ')} -> ${newId})...`);

    const allMemberships = new Set<string>([...(newUser.memberships ?? [])]);
    let newActiveClub = newUser.active_club_id;
    for (const old of oldUsers) {
      (old.memberships ?? []).forEach((m) => allMemberships.add(m));
      if (!newActiveClub && old.active_club_id) newActiveClub = old.active_club_id;
    }

    const displayName = newUser.display_name || oldUsers.find((o) => o.display_name)?.display_name;

    await supabase
      .from('users')
      .update({
        memberships: Array.from(allMemberships),
        active_club_id: newActiveClub,
        display_name: displayName,
        modified_at: new Date().toISOString(),
      })
      .eq('id', newId);

    for (const old of oldUsers) {
      const oldId = old.id;

      const { data: clubMemberRows } = await supabase
        .from('club_members')
        .select('id, club_id')
        .eq('user_id', oldId);

      for (const row of clubMemberRows ?? []) {
        const { data: existing } = await supabase
          .from('club_members')
          .select('id')
          .eq('club_id', row.club_id)
          .eq('user_id', newId)
          .maybeSingle();

        if (existing) {
          await supabase.from('club_members').delete().eq('id', row.id);
        } else {
          await supabase.from('club_members').update({ user_id: newId }).eq('id', row.id);
        }
      }

      const { data: books } = await supabase.from('books').select('id, ratings, progress_reports');
      for (const book of books ?? []) {
        let changed = false;
        const ratings = (book.ratings ?? []) as Array<{ memberId: string; rating: number }>;
        const newRatings = ratings.map((r) => {
          if (r.memberId === oldId) {
            changed = true;
            return { ...r, memberId: newId };
          }
          return r;
        });
        const progressReports = (book.progress_reports ?? []) as Array<{ user: { uid: string }; currentPage: number }>;
        const newProgress = progressReports.map((pr) => {
          if (pr.user?.uid === oldId) {
            changed = true;
            return { ...pr, user: { ...pr.user, uid: newId } };
          }
          return pr;
        });
        if (changed) {
          await supabase
            .from('books')
            .update({ ratings: newRatings, progress_reports: newProgress, modified_at: new Date().toISOString() })
            .eq('id', book.id);
        }
      }

      const { data: meetings } = await supabase.from('meetings').select('id, comments');
      for (const meeting of meetings ?? []) {
        const comments = (meeting.comments ?? []) as Array<{ user?: { uid: string }; text: string }>;
        const changed = comments.some((c) => c.user?.uid === oldId);
        if (!changed) continue;
        const newComments = comments.map((c) =>
          c.user?.uid === oldId ? { ...c, user: { ...c.user!, uid: newId } } : c
        );
        await supabase
          .from('meetings')
          .update({ comments: newComments, modified_at: new Date().toISOString() })
          .eq('id', meeting.id);
      }

      await supabase.from('user_presence').delete().eq('user_id', oldId);

      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(oldId);
      if (deleteAuthError) {
        console.warn(`  Could not delete auth user ${oldId}:`, deleteAuthError.message);
      } else {
        console.log(`  Deleted migration user ${oldId}`);
      }
    }
  }

  console.log('\nDone.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
