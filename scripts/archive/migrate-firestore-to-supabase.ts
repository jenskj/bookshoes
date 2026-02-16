#!/usr/bin/env npx tsx
/**
 * Firestore to Supabase migration script
 *
 * Migrates clubs, users, members, meetings, and books from Firestore to Supabase.
 * Requires Firebase service account and Supabase service role key.
 *
 * Usage:
 *   pnpm run migrate:firestore
 *   pnpm run migrate:firestore -- --from-json  # Use scripts/firestore-export.json instead of live Firestore
 *
 * Prerequisites:
 *   1. Copy .env.migration.example to .env.migration and fill in credentials
 *   2. For live Firestore: set FIREBASE_SERVICE_ACCOUNT_PATH to your service account JSON path
 *   3. For JSON import: run export first, save to scripts/firestore-export.json
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load .env.migration from project root
config({ path: path.resolve(process.cwd(), '.env.migration') });

const FROM_JSON = process.argv.includes('--from-json');
const DRY_RUN = process.argv.includes('--dry-run');

// Types for Firestore document shapes (camelCase from Firestore)
interface FirestoreClub {
  name: string;
  isPrivate?: boolean;
  tagline?: string;
  description?: string;
}

interface FirestoreUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  activeClub?: string;
  memberships?: string[];
}

interface FirestoreMember {
  uid: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
}

interface FirestoreBook {
  id?: string;
  googleId?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string };
    description?: string;
    pageCount?: number;
    averageRating?: number;
    ratingsCount?: number;
    publishedDate?: string;
    publisher?: string;
  };
  readStatus?: string;
  addedDate?: string;
  inactive?: boolean;
  scheduledMeetings?: string[];
  ratings?: Array<{ memberId: string; rating: number; dateAdded?: string; dateModified?: string }>;
  progressReports?: Array<{ user: { uid: string; displayName?: string; photoURL?: string }; currentPage: number }>;
}

interface FirestoreMeeting {
  date?: string;
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
    remoteInfo?: { link?: string; password?: string };
  };
  comments?: Array<{
    user: { uid: string; displayName?: string; photoURL?: string };
    title?: string;
    text: string;
    dateAdded?: string;
    dateModified?: string;
    taggedUsers?: string[];
    taggedBooks?: string[];
    type?: string;
  }>;
}

// ID maps: Firestore ID -> Supabase UUID
const clubMap = new Map<string, string>();
const userMap = new Map<string, string>();
const memberMap = new Map<string, string>(); // key: `${clubId}:${firebaseUid}`
const meetingMap = new Map<string, string>();

function memberKey(clubId: string, uid: string): string {
  return `${clubId}:${uid}`;
}

/** Parse date strings (DD/MM/YYYY, MM/DD/YYYY) and Firestore Timestamps to ISO format for PostgreSQL */
function toIso(val: unknown): string | null {
  if (!val) return null;
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val;
    const m = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (m) {
      const a = parseInt(m[1], 10);
      const b = parseInt(m[2], 10);
      let y = parseInt(m[3], 10);
      if (y < 100) y += 2000;
      const [day, month] = a > 12 ? [a, b] : b > 12 ? [b, a] : [a, b];
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00.000Z`;
    }
    return val;
  }
  return null;
}

async function loadFromFirestore(db: admin.firestore.Firestore) {
  const data: {
    clubs: Array<{ id: string; data: FirestoreClub }>;
    users: Array<{ id: string; data: FirestoreUser }>;
    clubMembers: Record<string, Array<{ id: string; data: FirestoreMember }>>;
    meetings: Record<string, Array<{ id: string; data: FirestoreMeeting }>>;
    books: Record<string, Array<{ id: string; data: FirestoreBook }>>;
  } = {
    clubs: [],
    users: [],
    clubMembers: {},
    meetings: {},
    books: {},
  };

  const clubsSnap = await db.collection('clubs').get();
  clubsSnap.docs.forEach((doc) => {
    data.clubs.push({ id: doc.id, data: doc.data() as FirestoreClub });
  });

  const usersSnap = await db.collection('users').get();
  usersSnap.docs.forEach((doc) => {
    const d = doc.data();
    data.users.push({
      id: doc.id,
      data: {
        uid: d.uid ?? doc.id,
        email: d.email,
        displayName: d.displayName,
        photoURL: d.photoURL,
        activeClub: d.activeClub,
        memberships: d.memberships ?? [],
      } as FirestoreUser,
    });
  });

  for (const club of data.clubs) {
    const membersSnap = await db.collection('clubs').doc(club.id).collection('members').get();
    data.clubMembers[club.id] = membersSnap.docs.map((doc) => ({
      id: doc.id,
      data: doc.data() as FirestoreMember,
    }));

    const meetingsSnap = await db.collection('clubs').doc(club.id).collection('meetings').get();
    data.meetings[club.id] = meetingsSnap.docs.map((doc) => ({
      id: doc.id,
      data: doc.data() as FirestoreMeeting,
    }));

    const booksSnap = await db.collection('clubs').doc(club.id).collection('books').get();
    data.books[club.id] = booksSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        data: {
          ...d,
          addedDate: toIso(d.addedDate) ?? d.addedDate,
        } as FirestoreBook,
      };
    });
  }

  return data;
}

async function loadFromJson(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as {
    clubs?: Array<{ id: string; data: FirestoreClub }>;
    users?: Array<{ id: string; data: FirestoreUser }>;
    clubMembers?: Record<string, Array<{ id: string; data: FirestoreMember }>>;
    meetings?: Record<string, Array<{ id: string; data: FirestoreMeeting }>>;
    books?: Record<string, Array<{ id: string; data: FirestoreBook }>>;
  };
  return {
    clubs: parsed.clubs ?? [],
    users: parsed.users ?? [],
    clubMembers: parsed.clubMembers ?? {},
    meetings: parsed.meetings ?? {},
    books: parsed.books ?? {},
  };
}

async function run() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const firebaseAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.migration.example to .env.migration.');
    process.exit(1);
  }

  let data: Awaited<ReturnType<typeof loadFromFirestore>>;

  if (FROM_JSON) {
    const jsonPath = path.resolve(process.cwd(), 'scripts', 'firestore-export.json');
    if (!fs.existsSync(jsonPath)) {
      console.error(`JSON export not found at ${jsonPath}. Run export first or use live Firestore.`);
      process.exit(1);
    }
    console.log('Loading from JSON export...');
    data = await loadFromJson(jsonPath);
  } else {
    if (!firebaseAccountPath || !fs.existsSync(firebaseAccountPath)) {
      console.error('Missing FIREBASE_SERVICE_ACCOUNT_PATH or file not found. Set it in .env.migration.');
      process.exit(1);
    }
    const serviceAccount = JSON.parse(fs.readFileSync(firebaseAccountPath, 'utf-8'));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    const db = admin.firestore();
    console.log('Loading from Firestore...');
    data = await loadFromFirestore(db);
  }

  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stats = { clubs: 0, users: 0, members: 0, meetings: 0, books: 0, errors: 0 };

  if (DRY_RUN) {
    console.log('\n--- DRY RUN ---\n');
  }

  // Phase 1: Clubs
  console.log('\nPhase 1: Migrating clubs...');
  for (const { id: firestoreId, data: club } of data.clubs) {
    if (DRY_RUN) {
      clubMap.set(firestoreId, `dry-run-uuid-${firestoreId}`);
      stats.clubs++;
      continue;
    }
    const { data: inserted, error } = await supabase
      .from('clubs')
      .insert({
        name: club.name,
        is_private: club.isPrivate ?? false,
        tagline: club.tagline ?? null,
        description: club.description ?? null,
      })
      .select('id')
      .single();
    if (error) {
      console.error(`Club ${firestoreId}:`, error.message);
      stats.errors++;
      continue;
    }
    clubMap.set(firestoreId, inserted.id);
    stats.clubs++;
  }
  console.log(`  Inserted ${stats.clubs} clubs`);

  // Phase 2: Users (create in auth + public.users)
  console.log('\nPhase 2: Migrating users...');
  for (const { id: firestoreId, data: user } of data.users) {
    const firebaseUid = user.uid ?? firestoreId;
    if (DRY_RUN) {
      userMap.set(firebaseUid, `dry-run-uuid-${firebaseUid}`);
      stats.users++;
      continue;
    }
    const email = user.email ?? `migrated-${firebaseUid}@placeholder.local`;
    try {
      const { data: authUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: user.displayName ?? '',
          avatar_url: user.photoURL ?? '',
        },
      });
      if (error) {
        if (error.message.includes('already been registered')) {
          const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
          if (existing) {
            userMap.set(firebaseUid, existing.id);
            stats.users++;
            continue;
          }
        }
        console.error(`User ${firebaseUid}:`, error.message);
        stats.errors++;
        continue;
      }
      const supabaseUid = authUser.user.id;
      userMap.set(firebaseUid, supabaseUid);

      const memberships = (user.memberships ?? [])
        .map((cid) => clubMap.get(cid))
        .filter((id): id is string => !!id);
      const activeClubId = user.activeClub ? clubMap.get(user.activeClub) ?? null : null;

      await supabase
        .from('users')
        .update({
          display_name: user.displayName ?? '',
          photo_url: user.photoURL ?? null,
          active_club_id: activeClubId,
          memberships,
          modified_at: new Date().toISOString(),
        })
        .eq('id', supabaseUid);
      stats.users++;
    } catch (err) {
      console.error(`User ${firebaseUid}:`, err);
      stats.errors++;
    }
  }
  console.log(`  Migrated ${stats.users} users`);

  // Phase 3: Club members
  console.log('\nPhase 3: Migrating club members...');
  for (const club of data.clubs) {
    const supabaseClubId = clubMap.get(club.id);
    if (!supabaseClubId) continue;
    const members = data.clubMembers[club.id] ?? [];
    for (const { id: memberDocId, data: member } of members) {
      const firebaseUid = member.uid ?? memberDocId;
      const supabaseUserId = userMap.get(firebaseUid);
      if (!supabaseUserId) {
        console.warn(`  Skipping member ${memberDocId} in club ${club.id}: user ${firebaseUid} not in userMap`);
        continue;
      }
      if (DRY_RUN) {
        memberMap.set(memberKey(club.id, firebaseUid), `dry-run-member-${memberDocId}`);
        stats.members++;
        continue;
      }
      const { data: inserted, error } = await supabase
        .from('club_members')
        .insert({
          club_id: supabaseClubId,
          user_id: supabaseUserId,
          role: (member.role as 'standard' | 'admin' | 'moderator') ?? 'standard',
        })
        .select('id')
        .single();
      if (error) {
        if (error.code === '23505') {
          const { data: existing } = await supabase
            .from('club_members')
            .select('id')
            .eq('club_id', supabaseClubId)
            .eq('user_id', supabaseUserId)
            .single();
          if (existing) memberMap.set(memberKey(club.id, firebaseUid), existing.id);
        } else {
          console.error(`  Member ${memberDocId}:`, error.message);
          stats.errors++;
        }
        continue;
      }
      memberMap.set(memberKey(club.id, firebaseUid), inserted.id);
      stats.members++;
    }
  }
  console.log(`  Inserted ${stats.members} club members`);

  // Phase 4: Meetings
  console.log('\nPhase 4: Migrating meetings...');
  for (const club of data.clubs) {
    const supabaseClubId = clubMap.get(club.id);
    if (!supabaseClubId) continue;
    const meetings = data.meetings[club.id] ?? [];
    for (const { id: meetingFirestoreId, data: meeting } of meetings) {
      if (DRY_RUN) {
        meetingMap.set(meetingFirestoreId, `dry-run-meeting-${meetingFirestoreId}`);
        stats.meetings++;
        continue;
      }
      const loc = meeting.location ?? {};
      const remote = loc.remoteInfo ?? {};
      const comments = (meeting.comments ?? []).map((c) => {
        const supabaseUid = userMap.get(c.user?.uid ?? '');
        return {
          ...c,
          user: supabaseUid
            ? { uid: supabaseUid, displayName: c.user?.displayName, photoURL: c.user?.photoURL }
            : c.user,
        };
      });
      const { data: inserted, error } = await supabase
        .from('meetings')
        .insert({
          club_id: supabaseClubId,
          date: toIso(meeting.date) ?? null,
          location_address: loc.address ?? null,
          location_lat: loc.lat ?? null,
          location_lng: loc.lng ?? null,
          remote_link: remote.link ?? null,
          remote_password: remote.password ?? null,
          comments,
        })
        .select('id')
        .single();
      if (error) {
        console.error(`  Meeting ${meetingFirestoreId}:`, error.message);
        stats.errors++;
        continue;
      }
      meetingMap.set(meetingFirestoreId, inserted.id);
      stats.meetings++;
    }
  }
  console.log(`  Inserted ${stats.meetings} meetings`);

  // Phase 5: Books
  console.log('\nPhase 5: Migrating books...');
  for (const club of data.clubs) {
    const supabaseClubId = clubMap.get(club.id);
    if (!supabaseClubId) continue;
    const books = data.books[club.id] ?? [];
    for (const { id: bookFirestoreId, data: book } of books) {
      if (DRY_RUN) {
        stats.books++;
        continue;
      }
      const vol = book.volumeInfo ?? {};
      const scheduledMeetings = (book.scheduledMeetings ?? [])
        .map((mid) => meetingMap.get(mid))
        .filter((id): id is string => !!id);
      const ratings = (book.ratings ?? []).map((r) => {
        const supabaseUserId = userMap.get(r.memberId);
        return supabaseUserId ? { ...r, memberId: supabaseUserId } : null;
      }).filter((r): r is NonNullable<typeof r> => r !== null);
      const progressReports = (book.progressReports ?? []).map((pr) => {
        const supabaseUid = userMap.get(pr.user?.uid ?? '');
        return supabaseUid
          ? { user: { uid: supabaseUid, displayName: pr.user?.displayName, photoURL: pr.user?.photoURL }, currentPage: pr.currentPage }
          : null;
      }).filter((pr): pr is NonNullable<typeof pr> => pr !== null);

      const googleId = book.googleId ?? book.id ?? null;
      const addedAt = toIso(book.addedDate) ?? new Date().toISOString();

      const { data: existing } = await supabase
        .from('books')
        .select('id')
        .eq('club_id', supabaseClubId)
        .eq('google_id', googleId)
        .maybeSingle();
      if (existing) {
        stats.books++;
        continue;
      }

      const { error } = await supabase.from('books').insert({
        club_id: supabaseClubId,
        google_id: googleId,
        title: vol.title ?? '',
        authors: vol.authors ?? [],
        image_thumbnail: vol.imageLinks?.thumbnail ?? null,
        description: vol.description ?? null,
        page_count: vol.pageCount ?? 0,
        average_rating: vol.averageRating ?? null,
        ratings_count: vol.ratingsCount ?? null,
        published_date: vol.publishedDate ?? null,
        publisher: vol.publisher ?? null,
        read_status: book.readStatus ?? 'candidate',
        inactive: book.inactive ?? false,
        scheduled_meetings: scheduledMeetings,
        ratings,
        progress_reports: progressReports,
        added_at: addedAt,
      });
      if (error) {
        console.error(`  Book ${bookFirestoreId}:`, error.message);
        stats.errors++;
        continue;
      }
      stats.books++;
    }
  }
  console.log(`  Inserted ${stats.books} books`);

  console.log('\n--- Summary ---');
  console.log(`Clubs: ${stats.clubs}, Users: ${stats.users}, Members: ${stats.members}, Meetings: ${stats.meetings}, Books: ${stats.books}`);
  if (stats.errors > 0) console.log(`Errors: ${stats.errors}`);
  if (DRY_RUN) console.log('(Dry run - no data was written)');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
