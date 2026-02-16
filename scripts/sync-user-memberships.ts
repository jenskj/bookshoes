#!/usr/bin/env npx tsx
/**
 * Sync users.memberships and users.active_club_id from club_members.
 *
 * The memberships array and active_club_id should mirror club_members. If they're
 * out of sync (e.g. after migration or link), this script rebuilds them.
 *
 * Usage: pnpm run sync:user-memberships
 *        pnpm run sync:user-memberships -- --dry-run
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

  console.log('Syncing users.memberships and active_club_id from club_members...\n');
  if (DRY_RUN) console.log('--- DRY RUN ---\n');

  const { data: members, error: membersError } = await supabase
    .from('club_members')
    .select('user_id, club_id')
    .order('club_id');

  if (membersError) {
    console.error('Failed to fetch club_members:', membersError.message);
    process.exit(1);
  }

  const byUser = new Map<string, string[]>();
  for (const m of members ?? []) {
    const list = byUser.get(m.user_id) ?? [];
    if (!list.includes(m.club_id)) list.push(m.club_id);
    byUser.set(m.user_id, list);
  }

  const { data: users } = await supabase.from('users').select('id, email, display_name, memberships, active_club_id');

  let updated = 0;
  for (const user of users ?? []) {
    const memberships = byUser.get(user.id) ?? [];
    const currentMemberships = (user.memberships ?? []) as string[];
    const currentActive = user.active_club_id;

    const membershipsMatch =
      memberships.length === currentMemberships.length &&
      memberships.every((c) => currentMemberships.includes(c));
    const activeOk = !memberships.length || (currentActive && memberships.includes(currentActive));

    if (membershipsMatch && activeOk) continue;

    const newActive =
      currentActive && memberships.includes(currentActive)
        ? currentActive
        : memberships[0] ?? null;

    if (DRY_RUN) {
      console.log(`${user.email ?? user.id}:`);
      console.log(`  memberships: [${currentMemberships.length}] -> [${memberships.length}]`);
      console.log(`  active_club_id: ${currentActive ?? 'null'} -> ${newActive ?? 'null'}`);
      updated++;
      continue;
    }

    const { error } = await supabase
      .from('users')
      .update({
        memberships,
        active_club_id: newActive,
        modified_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error(`  ${user.email ?? user.id}:`, error.message);
      continue;
    }
    console.log(`  ${user.email ?? user.display_name ?? user.id}: ${memberships.length} club(s)`);
    updated++;
  }

  console.log(`\nUpdated ${updated} user(s).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
