# Bookshoes

Bookshoes is a club-first reading app built with React + Vite on a Supabase backend.

## Quick Start

### 1) Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) (or `corepack enable`)

### 2) Install

```bash
pnpm install
```

### 3) Configure environment

Copy `.env.example` to one or more of:

- `.env.development.local` for local dev (`pnpm start`)
- `.env.production.local` for production build/deploy (`pnpm run build`, `pnpm run deploy`)
- `.env.local` as a shared fallback for both

Required variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_BOOKS_API=your-google-books-api-key
```

Recommended: use a separate Supabase project for development.

### 4) Supabase setup

1. Create project(s) at [supabase.com](https://supabase.com)
2. Enable Google Auth in Authentication > Providers
3. Run SQL migrations in `supabase/migrations/` in order
4. For seeded dev data, run `supabase/seed.sql`, then:

```bash
pnpm run seed:dev
```

Maintenance and migration-safe scripts are documented in `scripts/README.md`.

### 5) Run app

```bash
pnpm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start the Vite dev server |
| `pnpm run build` | Production build (output in `build/`) |
| `pnpm run preview` | Preview the production build |
| `pnpm test` | Run Vitest |
| `pnpm run lint` | Run ESLint |
| `pnpm run deploy` | Build and deploy to GitHub Pages |
| `pnpm run seed:dev` | Seed dev auth users + reading progress |
| `pnpm run add-user-to-club -- <email> [club-name]` | Add an existing user to a seeded club |

## Architecture Foundations

### Auth and app bootstrap

- `useAuthBootstrap` is the only app-level auth/session bootstrap.
- App routes are gated by `authReady` + `userLoadedFromSession` before rendering authenticated pages.
- User preferences are sanitized during bootstrap and persisted in the current user store.

### Club-scoped realtime data flow

- `App.tsx` wires the core hooks once per active club:
  - `useClubBooks(activeClubId)`
  - `useClubMeetings(activeClubId)`
  - `useClubMembers(activeClubId)`
- Hooks fetch + subscribe to Supabase realtime, then update Zustand stores.
- Avoid page-local ad hoc data-fetch effects for these domains.

### Data contract boundary

- Database rows are snake_case.
- Frontend domain types are camelCase.
- `src/lib/mappers.ts` is the boundary where table rows become `Book`, `Meeting`, `Member`, and `Club`.

### Mutation layer

- Prefer typed table-scoped helpers from `@utils`:
  - `addBook`, `updateBook`, `deleteBook`
  - `addMeeting`, `updateMeeting`, `deleteMeeting`
  - `deleteMember`, `addNewClubMember`
  - `createClubWithAdmin`, `updateClubProfile`
  - `createClubInvite`, `revokeClubInvite`, `acceptClubInvite`
  - `requestClubJoin`, `reviewClubJoinRequest`
  - `updateClubMemberRole`, `removeClubMember`, `leaveClub`
- Legacy path-based helpers (`updateDocument`, `addNewDocument`) remain for user/club flows and compatibility.

### Club governance and invites

- Club roles are `standard`, `moderator`, and `admin`.
- Private clubs require either invite acceptance or approved join requests.
- Governance-sensitive mutations are enforced server-side via Supabase RPC functions and RLS policies.
- Club setup/configuration defaults are stored in `clubs.settings` (JSONB) and edited in the admin route (`/clubs/:id/admin`).

### User settings and privacy defaults

- Settings schema lives in `src/types.ts` (`UserSettings`) and defaults/sanitization in `src/lib/userSettings.ts`.
- Settings are auto-saved from Settings page to `users.preferences`.
- Presence heartbeat is controlled by `settings.privacy.shareOnlinePresence`.
- Auto-mark-read behavior is controlled by `settings.automation.*`.

### Book discovery foundation

- External catalog search runs through `src/lib/bookProviders/`.
- Current providers: Google Books + Open Library.
- Results are deduplicated by ISBN/title-author matching in `searchBooks.ts`.

## Documentation Map

- Core engineering conventions: `docs/CONVENTIONS.md`
- Agent operating guide: `AGENTS.md`
- Supabase maintenance scripts: `scripts/README.md`
- Historical migration plan/reference: `docs/SUPABASE_MIGRATION_PLAN.md`, `docs/archive/`
