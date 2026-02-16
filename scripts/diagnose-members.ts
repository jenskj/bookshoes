#!/usr/bin/env npx tsx
/**
 * Diagnose club members and user resolution.
 * Shows which club_members exist, whether their user_id resolves, and user profile data.
 *
 * Usage: pnpm run diagnose:members
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.migration') });

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

  const { data: clubs } = await supabase.from('clubs').select('id, name');
  const { data: members } = await supabase.from('club_members').select('id, club_id, user_id, role');
  const { data: users } = await supabase.from('users').select('id, email, display_name, photo_url, memberships');

  const usersMap = new Map((users ?? []).map((u) => [u.id, u]));
  const clubsMap = new Map((clubs ?? []).map((c) => [c.id, c]));

  console.log('Club members and user resolution:\n');

  for (const club of clubs ?? []) {
    const clubMembers = (members ?? []).filter((m) => m.club_id === club.id);
    if (clubMembers.length === 0) continue;

    console.log(`Club: ${club.name} (${club.id})`);
    for (const m of clubMembers) {
      const u = usersMap.get(m.user_id);
      const resolved = u
        ? `display_name="${u.display_name ?? '(empty)'}", photo_url=${u.photo_url ? 'yes' : 'no'}`
        : 'ORPHANED (user_id not in users)';
      console.log(`  - user_id=${m.user_id} -> ${resolved}`);
    }
    console.log('');
  }

  console.log('Users in public.users:');
  for (const u of users ?? []) {
    const memberCount = (members ?? []).filter((m) => m.user_id === u.id).length;
    console.log(`  ${u.id}: email=${u.email ?? '(none)'}, display_name="${u.display_name ?? '(empty)'}", clubs=${memberCount}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
