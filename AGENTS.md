# AI Agent Guide – Bookshoes

Quick reference for AI agents working with this codebase.

## Project Overview

**Bookshoes** is a book club app: React + Vite frontend, Supabase backend.

| Item | Value |
|------|-------|
| Stack | React 18, Vite 6, TypeScript, Supabase, Zustand, MUI |
| Package manager | **pnpm** (required; use `pnpm install`, not npm/yarn) |
| Node | 22+ |
| Deploy | GitHub Pages (basename routing via `BASE_URL`) |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Vite dev server |
| `pnpm run build` | Production build (output in `build/`) |
| `pnpm run preview` | Preview production build |
| `pnpm test` | Run Vitest |
| `pnpm run lint` | Run ESLint |
| `pnpm run deploy` | Build and deploy to GitHub Pages |

## Path Aliases

Use these imports; do not use `../` or `@/`:

| Alias | Path |
|-------|------|
| `@components`, `@components/*` | `./src/components` |
| `@pages`, `@pages/*` | `./src/pages` |
| `@utils` | `./src/utils` |
| `@hooks` | `./src/hooks` |
| `@types` | `./src/types.ts` |
| `@lib/supabase` | `./src/supabase.ts` |

## Environment

Create `.env.local` with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_BOOKS_API=your-google-books-api-key
```

- Run migrations in `supabase/migrations/` in order (via Supabase SQL Editor)
- Enable Google Auth in Supabase Authentication > Providers

## Data Layer: Supabase + Legacy Naming

Types use **Firestore-style names** (`FirestoreBook`, `FirestoreMeeting`, etc.) from a prior migration. Backend is Supabase/Postgres.

- **DB columns:** snake_case (`google_id`, `read_status`, `scheduled_meetings`, `club_id`)
- **Frontend:** camelCase (`googleId`, `readStatus`, `scheduledMeetings`)

Key utilities in `src/utils/supabaseUtils.ts`:

- `parseCollectionPath(path)` – maps Firestore-style paths (`clubs/{id}/books`) to table + `club_id`
- `updateDocument(path, body, docId)` – updates via Firestore-style paths; use this for updates
- Row mappers (`mapBookRow`, `mapMeetingRow`) – convert DB rows to `Firestore*` types

When adding Supabase calls: use snake_case for columns, go through mappers where applicable, and prefer `updateDocument` for updates.

## Schema Overview

- **clubs** – top-level; users have `memberships` (club IDs) and `active_club_id`
- **club_members** – junction table; `role` in (standard, admin, moderator)
- **books** – club-scoped; `scheduled_meetings` UUID[]; `ratings`, `progress_reports` JSONB
- **meetings** – club-scoped; `comments` JSONB
- **Realtime:** `books`, `meetings`, `club_members`, `users`, `user_presence`

Schema in `supabase/migrations/`; run in order. Do not change schema in ways that break RLS or realtime.

## State Management

- **Zustand:** `useBookStore`, `useMeetingStore`, `useCurrentUserStore` (from `@hooks`)
- **Realtime:** `App.tsx` subscribes to `postgres_changes` when `activeClub` is set; refetches books, meetings, members
- **Auth:** `supabase.auth.onAuthStateChange` drives `currentUser`; user row from `users` table
- **Data loading:** Club-scoped data loaded in `App.tsx` when `activeClub` changes; components read from stores

Do not add ad-hoc `useEffect` fetches for club data. Use the existing subscription pattern or extend the stores.

## Conventions

| Area | Pattern |
|------|---------|
| Components | Functional, MUI, path aliases |
| Supabase | Single client from `@lib/supabase`; do not create new clients |
| Updates | Use `updateDocument` from `@utils` with Firestore-style paths |
| Types | Use `Firestore*` types from `@types`; do not rename without a broader refactor |
| Styling | `styles/styles.scss`, `Styled*` components |
