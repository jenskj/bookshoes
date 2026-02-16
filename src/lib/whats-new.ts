/**
 * What's New entries for the login/landing page.
 * Add new features, fixes, and improvements here; newest first.
 */
export type WhatsNewType = 'feature' | 'fix' | 'improvement';

export interface WhatsNewEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  type: WhatsNewType;
}

export const WHATS_NEW: WhatsNewEntry[] = [
  {
    id: 'supabase-backend',
    date: '2025-02',
    title: 'Supabase backend',
    description: 'Bookmates now runs on Supabase: faster, reliable database and realtime updates across all your clubs and devices.',
    type: 'feature',
  },
  {
    id: 'realtime-sync',
    date: '2025-02',
    title: 'Realtime sync',
    description: 'Books, meetings, and club members stay in sync for everyone. Changes appear instantly without refreshing.',
    type: 'feature',
  },
  {
    id: 'google-sign-in',
    date: '2025-02',
    title: 'Sign in with Google',
    description: 'One-click sign-in with your Google account. No separate password to remember.',
    type: 'feature',
  },
  {
    id: 'session-persistence',
    date: '2025-02',
    title: 'Session handling fix',
    description: 'Fixed sign-out on refresh. Your session now persists correctly when you reload the page.',
    type: 'fix',
  },
  {
    id: 'typed-api',
    date: '2025-02',
    title: 'Typed data API',
    description: 'Cleaner, type-safe APIs for books, meetings, and members. Fewer bugs and better editor support.',
    type: 'improvement',
  },
  {
    id: 'rls-security',
    date: '2025-02',
    title: 'Row-level security',
    description: 'Database access is now enforced per club and per user, so your data stays private and secure.',
    type: 'improvement',
  },
];
