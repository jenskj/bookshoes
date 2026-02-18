#!/usr/bin/env npx tsx
/**
 * Seed realistic reading progress for books scheduled in meetings.
 *
 * Usage: pnpm run seed:dev-progress
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.migration.
 * Run after:
 *   1) supabase/seed.sql
 *   2) pnpm run seed:dev-users
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.migration') });

type ClubRow = {
  id: string;
  name: string;
  created_at: string | null;
};

type MeetingRow = {
  id: string;
  date: string | null;
};

type BookRow = {
  id: string;
  title: string | null;
  page_count: number | null;
  scheduled_meetings: string[] | null;
};

type MemberRow = {
  club_id: string;
  user_id: string;
};

type UserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  memberships: string[] | null;
};

type ProgressReport = {
  user: {
    uid: string;
    email?: string;
    photoURL: string;
    displayName: string;
    activeClub: string;
    memberships: string[];
  };
  currentPage: number;
};

const TARGET_CLUB_NAMES = [
  'The Spine Breakers',
  'Marginalia Collective',
  'Late Night Library',
  'Shelf Indulgence',
  'The Dog-Eared Society',
  'Prose and Cons',
];

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededFraction(seed: string) {
  return (hashString(seed) % 10_000) / 10_000;
}

function defaultPageCount(bookId: string) {
  return 220 + (hashString(bookId) % 380);
}

function pickAnchorMeetingId(meetings: MeetingRow[]) {
  const now = Date.now();
  const withDate = meetings
    .filter((m) => Boolean(m.date))
    .map((m) => ({ ...m, ts: new Date(m.date as string).getTime() }))
    .filter((m) => !Number.isNaN(m.ts));

  const upcoming = withDate
    .filter((m) => m.ts >= now)
    .sort((a, b) => a.ts - b.ts);
  if (upcoming.length > 0) return upcoming[0].id;

  const recentPast = withDate
    .filter((m) => m.ts < now)
    .sort((a, b) => b.ts - a.ts);
  return recentPast[0]?.id;
}

function displayNameFromRow(user: UserRow) {
  if (user.display_name) return user.display_name;
  if (user.email) return user.email.split('@')[0];
  return 'Bookshoes Reader';
}

function buildReports(clubId: string, users: UserRow[], pageCount: number, seedBase: string) {
  const sorted = [...users].sort((a, b) =>
    displayNameFromRow(a).localeCompare(displayNameFromRow(b))
  );

  return sorted.map((user, index): ProgressReport => {
    const base = seededFraction(`${seedBase}:${user.id}`);
    let ratio = 0.1 + base * 0.82;

    if (index === 0) ratio = 0.98;
    if (index % 7 === 0) ratio = 0;
    if (index % 5 === 0 && index !== 0) ratio = ratio * 0.45;

    const currentPage = Math.max(
      0,
      Math.min(pageCount, Math.round(pageCount * ratio))
    );

    return {
      user: {
        uid: user.id,
        email: user.email ?? undefined,
        photoURL: user.photo_url ?? '',
        displayName: displayNameFromRow(user),
        activeClub: clubId,
        memberships: user.memberships ?? [clubId],
      },
      currentPage,
    };
  });
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

  const { data: clubs, error: clubsError } = await supabase
    .from('clubs')
    .select('id, name, created_at')
    .order('created_at', { ascending: true });

  if (clubsError) {
    console.error('Failed to fetch clubs:', clubsError.message);
    process.exit(1);
  }

  if (!clubs?.length) {
    console.error('No clubs found. Run supabase/seed.sql first.');
    process.exit(1);
  }

  const { data: allMeetings } = await supabase.from('meetings').select('club_id');
  const { data: allBooks } = await supabase.from('books').select('club_id');
  const { data: allMembers, error: allMembersError } = await supabase
    .from('club_members')
    .select('club_id, user_id');

  if (allMembersError) {
    console.error('Failed to fetch club members:', allMembersError.message);
    process.exit(1);
  }

  const meetingCounts = new Map<string, number>();
  for (const row of allMeetings ?? []) {
    meetingCounts.set(row.club_id, (meetingCounts.get(row.club_id) ?? 0) + 1);
  }

  const bookCounts = new Map<string, number>();
  for (const row of allBooks ?? []) {
    bookCounts.set(row.club_id, (bookCounts.get(row.club_id) ?? 0) + 1);
  }

  const memberUserIdsByClub = new Map<string, string[]>();
  for (const row of (allMembers as MemberRow[] | null) ?? []) {
    const list = memberUserIdsByClub.get(row.club_id) ?? [];
    if (!list.includes(row.user_id)) list.push(row.user_id);
    memberUserIdsByClub.set(row.club_id, list);
  }

  const allClubRows = clubs as ClubRow[];
  const clubsToSeed: ClubRow[] = [];
  for (const clubName of TARGET_CLUB_NAMES) {
    const candidates = allClubRows.filter((club) => club.name === clubName);
    if (!candidates.length) continue;

    candidates.sort((a, b) => {
      const byMeetings = (meetingCounts.get(b.id) ?? 0) - (meetingCounts.get(a.id) ?? 0);
      if (byMeetings !== 0) return byMeetings;

      const byMembers =
        (memberUserIdsByClub.get(b.id)?.length ?? 0) -
        (memberUserIdsByClub.get(a.id)?.length ?? 0);
      if (byMembers !== 0) return byMembers;

      const byBooks = (bookCounts.get(b.id) ?? 0) - (bookCounts.get(a.id) ?? 0);
      if (byBooks !== 0) return byBooks;

      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    });

    clubsToSeed.push(candidates[0]);
    if (candidates.length > 1) {
      console.log(
        `Resolved duplicate club name "${clubName}" -> ${candidates[0].id} (members=${memberUserIdsByClub.get(candidates[0].id)?.length ?? 0})`
      );
    }
  }

  let updatedBooks = 0;

  for (const club of clubsToSeed) {
    const memberUserIds = memberUserIdsByClub.get(club.id) ?? [];
    if (!memberUserIds.length) {
      console.log(`Skipping ${club.name}: no members.`);
      continue;
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, display_name, photo_url, memberships')
      .in('id', memberUserIds);

    if (usersError) {
      console.error(`Skipping ${club.name}: failed to read user profiles (${usersError.message})`);
      continue;
    }

    const clubUsers = (users as UserRow[] | null) ?? [];
    if (!clubUsers.length) {
      console.log(`Skipping ${club.name}: no user profiles resolved.`);
      continue;
    }

    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('id, date')
      .eq('club_id', club.id)
      .order('date', { ascending: true });

    if (meetingsError) {
      console.error(`Skipping ${club.name}: failed to read meetings (${meetingsError.message})`);
      continue;
    }

    const anchorMeetingId = pickAnchorMeetingId((meetings as MeetingRow[] | null) ?? []);
    if (!anchorMeetingId) {
      console.log(`Skipping ${club.name}: no meetings found.`);
      continue;
    }

    const { data: scheduledBooks, error: scheduledBooksError } = await supabase
      .from('books')
      .select('id, title, page_count, scheduled_meetings')
      .eq('club_id', club.id)
      .contains('scheduled_meetings', [anchorMeetingId]);

    if (scheduledBooksError) {
      console.error(`Skipping ${club.name}: failed to read books (${scheduledBooksError.message})`);
      continue;
    }

    let booksToSeed = (scheduledBooks as BookRow[] | null) ?? [];

    if (!booksToSeed.length) {
      const { data: fallbackBooks, error: fallbackError } = await supabase
        .from('books')
        .select('id, title, page_count, scheduled_meetings')
        .eq('club_id', club.id)
        .order('added_at', { ascending: false })
        .limit(1);

      if (fallbackError) {
        console.error(`Skipping ${club.name}: failed to load fallback book (${fallbackError.message})`);
        continue;
      }

      const fallback = (fallbackBooks as BookRow[] | null)?.[0];
      if (!fallback) {
        console.log(`Skipping ${club.name}: no books found.`);
        continue;
      }

      const nextScheduled = Array.from(
        new Set([...(fallback.scheduled_meetings ?? []), anchorMeetingId])
      );
      await supabase
        .from('books')
        .update({ scheduled_meetings: nextScheduled, modified_at: new Date().toISOString() })
        .eq('id', fallback.id);

      booksToSeed = [{ ...fallback, scheduled_meetings: nextScheduled }];
    }

    for (const book of booksToSeed) {
      const pageCount = book.page_count && book.page_count > 0
        ? book.page_count
        : defaultPageCount(book.id);
      const reports = buildReports(club.id, clubUsers, pageCount, `${club.id}:${book.id}`);

      const { error: updateBookError } = await supabase
        .from('books')
        .update({
          page_count: pageCount,
          progress_reports: reports,
          modified_at: new Date().toISOString(),
        })
        .eq('id', book.id);

      if (updateBookError) {
        console.error(
          `Failed to seed progress for "${book.title ?? book.id}" (${club.name}): ${updateBookError.message}`
        );
        continue;
      }

      updatedBooks += 1;
      console.log(`Seeded progress: ${club.name} -> ${book.title ?? book.id}`);
    }
  }

  console.log(`Done. Updated ${updatedBooks} book(s) with progress reports.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
