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
| `@lib`, `@lib/*` | `./src/lib` |

## Environment

- **Dev server** (`pnpm start`): loads `.env.development.local` then `.env.local`. Use a **dev** Supabase project in `.env.development.local` to avoid touching production.
- **Production build** (`pnpm run build`): loads `.env.production.local` then `.env.local`.

Create `.env.local` (or `.env.development.local` / `.env.production.local`) with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_BOOKS_API=your-google-books-api-key
```

- Run migrations in `supabase/migrations/` in order (via Supabase SQL Editor)
- Enable Google Auth in Supabase Authentication > Providers

## Data Layer: Supabase

- **DB columns:** snake_case (`google_id`, `read_status`, `scheduled_meetings`, `club_id`)
- **Frontend:** camelCase (`googleId`, `readStatus`, `scheduledMeetings`)

**Preferred API** (table-based, typed):

- `addBook(clubId, payload)`, `updateBook(clubId, bookId, payload)`, `deleteBook(clubId, bookId)`
- `addMeeting(clubId, payload)`, `updateMeeting(clubId, meetingId, payload)`, `deleteMeeting(clubId, meetingId)`
- `deleteMember(clubId, memberId)`, `addNewClubMember(clubId, role?)`

**Legacy:** `updateDocument(path, body, docId)` and `addNewDocument(path, body)` still exist for users/clubs.

**Mappers:** `src/lib/mappers.ts` – `mapBookRow`, `mapMeetingRow`, `mapMemberRow`, `mapClubRow` convert DB rows to domain types.

**Types:** `Book`, `Meeting`, `Club`, `Member`, `User` (from `@types`). Deprecated aliases: `FirestoreBook`, etc.

## Schema Overview

- **clubs** – top-level; users have `memberships` (club IDs) and `active_club_id`
- **club_members** – junction table; `role` in (standard, admin, moderator)
- **books** – club-scoped; `scheduled_meetings` UUID[]; `ratings`, `progress_reports` JSONB
- **meetings** – club-scoped; `comments` JSONB
- **Realtime:** `books`, `meetings`, `club_members`, `users`, `user_presence`

Schema in `supabase/migrations/`; run in order. Do not change schema in ways that break RLS or realtime.

## State Management

- **Zustand:** `useBookStore`, `useMeetingStore`, `useCurrentUserStore` (from `@hooks`)
- **Data-fetching hooks:** `useClubBooks(clubId)`, `useClubMeetings(clubId)`, `useClubMembers(clubId)` – fetch and subscribe to realtime; used in `App.tsx`
- **Auth:** `supabase.auth.onAuthStateChange` drives `currentUser`; user row from `users` table

Do not add ad-hoc `useEffect` fetches for club data. Use the hooks or extend the stores.

## Conventions

| Area | Pattern |
|------|---------|
| Components | Functional, MUI, path aliases |
| Supabase | Single client from `@lib/supabase`; do not create new clients |
| Updates | Prefer typed helpers (`updateBook`, `updateMeeting`) from `@utils` |
| Types | Use `Book`, `Meeting`, `Club`, `Member`, `User` from `@types` |
| Styling | `styles/styles.scss`, `Styled*` components |
