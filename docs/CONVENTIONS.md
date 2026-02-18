# Bookshoes Conventions

This document defines the working foundations for how Bookshoes is built and extended.

## 1. Architecture and Runtime Boundaries

### App shell

- `src/App.tsx` owns routing, auth gating, and global club-scoped data hooks.
- Keep core bootstrap hooks mounted in `App.tsx`:
  - `useAuthBootstrap()`
  - `useClubBooks(activeClubId)`
  - `useClubMeetings(activeClubId)`
  - `useClubMembers(activeClubId)`
  - `useAutoMarkReadBooks()`
  - `usePresenceHeartbeat()`

### Auth bootstrap

- `src/hooks/useAuthBootstrap.ts` is the source of truth for auth/session hydration.
- It is responsible for:
  - session lookup + auth change handling
  - initial user row creation when missing
  - settings sanitization via `sanitizeUserSettings`
  - memberships and active club resolution
- Do not add separate page-level auth bootstrap logic.

## 2. Data Shape and Mapping

### Naming boundary

- Database: snake_case (`active_club_id`, `scheduled_meetings`, `progress_reports`).
- Frontend domain models: camelCase (`activeClub`, `scheduledMeetings`, `progressReports`).

### Mapping boundary

- All row-to-domain mapping should go through `src/lib/mappers.ts`.
- Use and extend:
  - `mapBookRow`
  - `mapMeetingRow`
  - `mapMemberRow`
  - `mapClubRow`
- Keep conversion logic centralized; do not duplicate ad hoc mapping in components.

## 3. State Management

### Stores

- Zustand stores are canonical:
  - `useBookStore`
  - `useMeetingStore`
  - `useCurrentUserStore`
- Club books/meetings/members are loaded through hooks, then written into stores.

### Club scope

- Use `activeClub?.docId` as the scope key for book/meeting/member queries.
- When no active club is present, hooks should clear scoped store state.

## 4. Mutation Patterns

### Preferred APIs (typed helpers)

Use typed helpers from `@utils` for table-scoped writes:

- `addBook`, `updateBook`, `deleteBook`
- `addMeeting`, `updateMeeting`, `deleteMeeting`
- `deleteMember`, `addNewClubMember`
- `updateUserProfile`, `updateUserSettings`

### Legacy compatibility APIs

- `updateDocument(path, payload, docId)` and `addNewDocument(path, payload)` still exist.
- Keep legacy usage limited to compatibility flows (mainly users/clubs or existing call sites).

### Optimistic UI writes

- Use `runOptimisticMutation` from `src/lib/optimistic.ts` for optimistic state changes.
- Always include rollback behavior and error handling for failed commits.

## 5. User Settings, Privacy, and Behavior

### Settings model

- `UserSettings` lives in `src/types.ts`.
- Defaults and validation live in `src/lib/userSettings.ts`.
- Persist settings to `users.preferences` via `updateUserSettings`.

### Runtime behavior toggles

- Presence updates are gated by `settings.privacy.shareOnlinePresence`.
- Auto read-status updates are gated by `settings.automation.autoMarkReadWhenMeetingsPassed`.
- Minimum scheduled meetings threshold comes from `settings.automation.autoMarkReadMinimumScheduledMeetings`.

## 6. External Catalog Providers

### Provider architecture

- Providers are implemented under `src/lib/bookProviders/`.
- Provider contract: `BookProvider` in `src/lib/bookProviders/types.ts`.
- Current external providers:
  - Google Books
  - Open Library

### Deduping

- Cross-provider dedupe and merge rules are centralized in `searchBooks.ts`.
- Deduping logic should stay provider-agnostic and covered by tests.

## 7. Imports, Types, and Supabase Client Usage

### Path aliases

Use aliases from `tsconfig.paths.json` / `vite.config.js`:

- `@components`, `@components/*`
- `@pages`, `@pages/*`
- `@utils`
- `@hooks`
- `@types`
- `@lib/supabase`
- `@lib`, `@lib/*`
- `@shared/*`
- `@supabase`

Prefer aliases over long relative paths for cross-feature imports.

### Types

- Use canonical types from `@types` (`Book`, `Meeting`, `Club`, `Member`, `User`, `UserSettings`).
- Firestore-prefixed aliases are deprecated compatibility types.

### Supabase client

- Use the single client exported by `@lib/supabase`.
- Do not create additional clients in feature code.

## 8. Operational and Script Conventions

- App runtime env vars:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GOOGLE_BOOKS_API`
- Maintenance/admin scripts use `.env.migration`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Script details and workflow order are in `scripts/README.md`.

## 9. Styling Conventions

- Use component-scoped styling by default (`Styled*` components or component-local SCSS).
- Keep global styles limited to app-wide primitives (reset, typography, tokens, utilities, animations).
- Prefer one styling approach per component. Avoid mixing heavy `sx`, inline styles, and SCSS in the same component.
- Reuse design tokens for color, spacing, radius, and shadow. Avoid hardcoded one-off values.
- Use semantic token names (for example `--color-surface`, `--color-text-muted`) over literal palette names.
- Build mobile-first and use consistent breakpoints aligned with MUI breakpoints.
- Keep selector specificity low and avoid `!important` unless required for third-party overrides.
- Ensure interactive elements have clear `:focus-visible` styles and state coverage (`hover`, `active`, `disabled`, `error`).
- Keep motion purposeful, short, and compatible with `prefers-reduced-motion`.
- For long collections (cards, tiles, repeated content blocks), prefer CSS Grid layouts over ad hoc flex wrapping.

## 10. Contribution Checklist

Before merging changes:

1. Ensure DB-to-domain mapping changes are in `src/lib/mappers.ts`.
2. Ensure writes use typed helpers unless a legacy path is required.
3. Keep club-scoped fetching inside canonical hooks, not page-level effects.
4. Respect user settings toggles when adding behavior automation.
5. Add or update tests when changing provider dedupe or shared utility logic.
