#!/usr/bin/env npx tsx
/**
 * Fix ID mismatches for club members, books, and meetings.
 *
 * Ensures:
 * 1. club_members.user_id only references existing users (removes orphaned rows)
 * 2. books.ratings and books.progress_reports only reference users who are club members
 * 3. meetings.comments only reference users who are club members
 *
 * Usage: pnpm run fix:club-member-ids
 *        pnpm run fix:club-member-ids -- --dry-run
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.migration
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.migration') });

const DRY_RUN = process.argv.includes('--dry-run');

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

  console.log('Fixing club member ID mismatches...\n');
  if (DRY_RUN) console.log('--- DRY RUN ---\n');

  const { data: users } = await supabase.from('users').select('id');
  const validUserIds = new Set((users ?? []).map((u) => u.id));

  const { data: allMembers } = await supabase.from('club_members').select('id, club_id, user_id');
  const membersByClub = new Map<string, Set<string>>();
  const orphanedMemberIds: string[] = [];

  for (const m of allMembers ?? []) {
    if (!validUserIds.has(m.user_id)) {
      orphanedMemberIds.push(m.id);
      continue;
    }
    const set = membersByClub.get(m.club_id) ?? new Set();
    set.add(m.user_id);
    membersByClub.set(m.club_id, set);
  }

  if (orphanedMemberIds.length > 0) {
    console.log(`Removing ${orphanedMemberIds.length} orphaned club_members (user_id not in users)...`);
    if (!DRY_RUN) {
      for (const id of orphanedMemberIds) {
        await supabase.from('club_members').delete().eq('id', id);
      }
    }
  }

  const { data: books } = await supabase.from('books').select('id, club_id, ratings, progress_reports');
  let booksFixed = 0;

  for (const book of books ?? []) {
    const clubMembers = membersByClub.get(book.club_id) ?? new Set();
    let changed = false;

    const ratings = (book.ratings ?? []) as Array<{ memberId: string; rating: number }>;
    const newRatings = ratings.filter((r) => {
      if (clubMembers.has(r.memberId)) return true;
      changed = true;
      return false;
    });

    const progressReports = (book.progress_reports ?? []) as Array<{ user: { uid: string }; currentPage: number }>;
    const newProgress = progressReports.filter((pr) => {
      if (clubMembers.has(pr.user?.uid ?? '')) return true;
      changed = true;
      return false;
    });

    if (changed && !DRY_RUN) {
      await supabase
        .from('books')
        .update({
          ratings: newRatings,
          progress_reports: newProgress,
          modified_at: new Date().toISOString(),
        })
        .eq('id', book.id);
      booksFixed++;
    } else if (changed) {
      booksFixed++;
    }
  }

  if (booksFixed > 0) {
    console.log(`Fixed ${booksFixed} book(s) (removed orphaned ratings/progress_reports)`);
  }

  const { data: meetings } = await supabase.from('meetings').select('id, club_id, comments');
  let meetingsFixed = 0;

  for (const meeting of meetings ?? []) {
    const clubMembers = membersByClub.get(meeting.club_id) ?? new Set();
    const comments = (meeting.comments ?? []) as Array<{ user?: { uid: string }; text: string }>;
    const newComments = comments.filter((c) => {
      const uid = c.user?.uid;
      if (!uid) return true;
      if (clubMembers.has(uid)) return true;
      return false;
    });
    if (newComments.length < comments.length && !DRY_RUN) {
      await supabase
        .from('meetings')
        .update({
          comments: newComments,
          modified_at: new Date().toISOString(),
        })
        .eq('id', meeting.id);
      meetingsFixed++;
    } else if (newComments.length < comments.length) {
      meetingsFixed++;
    }
  }

  if (meetingsFixed > 0) {
    console.log(`Fixed ${meetingsFixed} meeting(s) (removed orphaned comments)`);
  }

  if (!DRY_RUN && (orphanedMemberIds.length > 0 || booksFixed > 0 || meetingsFixed > 0)) {
    console.log('\nUpdating users.memberships from club_members...');
    const { data: members } = await supabase.from('club_members').select('user_id, club_id');
    const byUser = new Map<string, string[]>();
    for (const m of members ?? []) {
      const list = byUser.get(m.user_id) ?? [];
      if (!list.includes(m.club_id)) list.push(m.club_id);
      byUser.set(m.user_id, list);
    }
    const { data: usersToUpdate } = await supabase.from('users').select('id, active_club_id');
    for (const u of usersToUpdate ?? []) {
      const memberships = byUser.get(u.id) ?? [];
      const activeClubId = u.active_club_id && memberships.includes(u.active_club_id)
        ? u.active_club_id
        : memberships[0] ?? null;
      await supabase
        .from('users')
        .update({
          memberships,
          active_club_id: activeClubId,
          modified_at: new Date().toISOString(),
        })
        .eq('id', u.id);
    }
  }

  if (orphanedMemberIds.length === 0 && booksFixed === 0 && meetingsFixed === 0) {
    console.log('No issues found. All IDs are consistent.');
  }

  console.log('\nDone.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
