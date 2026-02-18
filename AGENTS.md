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

## Primary Docs

- `README.md` – onboarding and runtime overview
- `docs/CONVENTIONS.md` – detailed engineering conventions
- `scripts/README.md` – maintenance/admin scripts

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Vite dev server |
| `pnpm run build` | Production build (output in `build/`) |
| `pnpm run preview` | Preview production build |
| `pnpm test` | Run Vitest |
| `pnpm run lint` | Run ESLint |
| `pnpm run deploy` | Build and deploy to GitHub Pages |
| `pnpm run seed:dev` | Seed dev users + reading progress |
| `pnpm run add-user-to-club -- <email> [club-name]` | Add existing user to seeded clubs |

## Path Aliases

Use these imports (prefer aliases over deep relative imports):

| Alias | Path |
|-------|------|
| `@components`, `@components/*` | `./src/components` |
| `@pages`, `@pages/*` | `./src/pages` |
| `@utils` | `./src/utils` |
| `@hooks` | `./src/hooks` |
| `@types` | `./src/types.ts` |
| `@supabase` | `./src/supabase.ts` |
| `@lib/supabase` | `./src/supabase.ts` |
| `@lib`, `@lib/*` | `./src/lib` |
| `@shared/*` | `./src/shared/*` |

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

Admin scripts use `.env.migration` with:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Data Layer: Supabase

- **DB columns:** snake_case (`google_id`, `read_status`, `scheduled_meetings`, `club_id`)
- **Frontend:** camelCase (`googleId`, `readStatus`, `scheduledMeetings`)

**Preferred API** (table-based, typed):

- `addBook(clubId, payload)`, `updateBook(clubId, bookId, payload)`, `deleteBook(clubId, bookId)`
- `addMeeting(clubId, payload)`, `updateMeeting(clubId, meetingId, payload)`, `deleteMeeting(clubId, meetingId)`
- `deleteMember(clubId, memberId)`, `addNewClubMember(clubId, role?)`
- `updateUserProfile(userId, payload)`, `updateUserSettings(userId, settings)`

**Legacy:** `updateDocument(path, body, docId)` and `addNewDocument(path, body)` still exist for users/clubs.

**Mappers:** `src/lib/mappers.ts` – `mapBookRow`, `mapMeetingRow`, `mapMemberRow`, `mapClubRow` convert DB rows to domain types.

**Types:** `Book`, `Meeting`, `Club`, `Member`, `User`, `UserSettings` (from `@types`). Deprecated aliases: `FirestoreBook`, etc.

## Schema Overview

- **clubs** – top-level; users have `memberships` (club IDs) and `active_club_id`
- **club_members** – junction table; `role` in (standard, admin, moderator)
- **books** – club-scoped; `scheduled_meetings` UUID[]; `ratings`, `progress_reports` JSONB
- **meetings** – club-scoped; `comments` JSONB
- **Realtime:** `books`, `meetings`, `club_members`, `users`, `user_presence`

Schema in `supabase/migrations/`; run in order. Do not change schema in ways that break RLS or realtime.

## App Foundations

- **Auth bootstrap:** `useAuthBootstrap` is the canonical entrypoint for session hydration, membership resolution, and settings sanitization.
- **Global club hooks in `App.tsx`:** `useClubBooks`, `useClubMeetings`, `useClubMembers`, `useAutoMarkReadBooks`, `usePresenceHeartbeat`.
- **Store model:** `useBookStore`, `useMeetingStore`, `useCurrentUserStore` are canonical state containers.
- **Route defaulting:** default landing route is derived from `settings.navigation.defaultLandingTab`.

Do not add ad-hoc `useEffect` fetches for club data. Use the hooks or extend the stores.

## Settings and Privacy

- Settings defaults + sanitizer: `src/lib/userSettings.ts`
- Persisted shape: `users.preferences`
- Privacy gates:
  - `settings.privacy.shareOnlinePresence` controls presence heartbeat writes
  - `settings.privacy.shareReadingProgress` can trigger progress cleanup in settings flow
- Automation gate:
  - `settings.automation.autoMarkReadWhenMeetingsPassed`

## Book Search Providers

- Provider abstraction in `src/lib/bookProviders/types.ts` (`BookProvider`).
- Current providers: Google Books + Open Library.
- Aggregation and dedupe live in `src/lib/bookProviders/searchBooks.ts`.
- Add provider-specific parsing in provider files, keep merge logic centralized.

## Mutation and Optimistic UI

- Prefer typed helpers from `@utils` over direct table calls in components.
- For optimistic interactions (for example active club switching), use `runOptimisticMutation` with rollback.
- Keep error surface explicit with toast feedback or equivalent UX.

## Agent Do/Don't

- Do use the single Supabase client from `@lib/supabase`.
- Do route DB shape conversions through `src/lib/mappers.ts`.
- Do preserve snake_case in DB writes and camelCase in domain state.
- Do update docs when adding new cross-cutting foundations.
- Do not create parallel auth bootstrap logic outside `useAuthBootstrap`.
- Do not add new page-level data loaders for club books/meetings/members.
- Do not bypass settings privacy toggles when adding background behavior.
