#!/usr/bin/env npx tsx
/**
 * Sync display_name and photo_url from auth.users to public.users.
 *
 * If public.users has empty display_name or photo_url, copies from auth metadata
 * (e.g. from Google sign-in). Fixes "empty" members showing on the home page.
 *
 * Usage: pnpm run sync:user-profiles
 *        pnpm run sync:user-profiles -- --dry-run
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

  console.log('Syncing user profiles from auth to public.users...\n');
  if (DRY_RUN) console.log('--- DRY RUN ---\n');

  const { data: publicUsers } = await supabase.from('users').select('id, email, display_name, photo_url');
  const { data: authUsers } = await supabase.auth.admin.listUsers();

  const authByEmail = new Map(
    (authUsers?.users ?? []).map((u) => [u.email?.toLowerCase().trim() ?? '', u])
  );
  const authById = new Map((authUsers?.users ?? []).map((u) => [u.id, u]));

  let updated = 0;
  for (const pu of publicUsers ?? []) {
    const needsDisplay = !pu.display_name?.trim();
    const needsPhoto = !pu.photo_url?.trim();
    if (!needsDisplay && !needsPhoto) continue;

    const authUser = authById.get(pu.id) ?? authByEmail.get(pu.email?.toLowerCase().trim() ?? '');
    if (!authUser) continue;

    const displayName = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? authUser.email ?? '';
    const photoUrl = authUser.user_metadata?.avatar_url ?? authUser.user_metadata?.picture ?? '';

    if (DRY_RUN) {
      console.log(`${pu.email ?? pu.id}:`);
      if (needsDisplay) console.log(`  display_name: '' -> '${displayName}'`);
      if (needsPhoto) console.log(`  photo_url: '' -> '${photoUrl.slice(0, 50)}...'`);
      updated++;
      continue;
    }

    const updates: Record<string, unknown> = { modified_at: new Date().toISOString() };
    if (needsDisplay && displayName) updates.display_name = displayName;
    if (needsPhoto && photoUrl) updates.photo_url = photoUrl;

    if (Object.keys(updates).length <= 1) continue;

    const { error } = await supabase.from('users').update(updates).eq('id', pu.id);
    if (error) {
      console.error(`  ${pu.email ?? pu.id}:`, error.message);
      continue;
    }
    console.log(`  ${pu.email ?? pu.id}: synced display_name, photo_url`);
    updated++;
  }

  if (updated === 0) {
    console.log('No users needed profile sync.');
  } else {
    console.log(`\nUpdated ${updated} user(s).`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
