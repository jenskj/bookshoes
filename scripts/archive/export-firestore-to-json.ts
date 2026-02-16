#!/usr/bin/env npx tsx
/**
 * Export Firestore data to JSON for migration.
 * Run this first if you want to use --from-json with the migration script.
 *
 * Usage: pnpm exec tsx scripts/export-firestore-to-json.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH in .env.migration
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.migration') });

function toSerializable(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (Array.isArray(val)) return val.map(toSerializable);
  if (typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) out[k] = toSerializable(v);
    return out;
  }
  return val;
}

async function run() {
  const accountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!accountPath || !fs.existsSync(accountPath)) {
    console.error('Set FIREBASE_SERVICE_ACCOUNT_PATH in .env.migration');
    process.exit(1);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(accountPath, 'utf-8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const out: Record<string, unknown> = {
    clubs: [],
    users: [],
    clubMembers: {} as Record<string, unknown[]>,
    meetings: {} as Record<string, unknown[]>,
    books: {} as Record<string, unknown[]>,
  };

  const clubsSnap = await db.collection('clubs').get();
  const clubs = clubsSnap.docs.map((d) => ({ id: d.id, data: toSerializable(d.data()) }));
  (out.clubs as unknown[]) = clubs;

  const usersSnap = await db.collection('users').get();
  (out.users as unknown[]) = usersSnap.docs.map((d) => ({ id: d.id, data: toSerializable(d.data()) }));

  for (const club of clubs) {
    const [membersSnap, meetingsSnap, booksSnap] = await Promise.all([
      db.collection('clubs').doc(club.id).collection('members').get(),
      db.collection('clubs').doc(club.id).collection('meetings').get(),
      db.collection('clubs').doc(club.id).collection('books').get(),
    ]);
    (out.clubMembers as Record<string, unknown[]>)[club.id] = membersSnap.docs.map((d) => ({
      id: d.id,
      data: toSerializable(d.data()),
    }));
    (out.meetings as Record<string, unknown[]>)[club.id] = meetingsSnap.docs.map((d) => ({
      id: d.id,
      data: toSerializable(d.data()),
    }));
    (out.books as Record<string, unknown[]>)[club.id] = booksSnap.docs.map((d) => ({
      id: d.id,
      data: toSerializable(d.data()),
    }));
  }

  const outPath = path.resolve(process.cwd(), 'scripts', 'firestore-export.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`Exported to ${outPath}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
