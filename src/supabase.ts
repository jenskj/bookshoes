import { createClient } from '@supabase/supabase-js';
import type { Database } from '@lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    '[Bookshoes] Supabase is not configured, so no API requests will be sent. ' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.development.local (for pnpm start) or .env.production.local (for build), then restart.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'bookshoes-auth',
  },
});
