# Supabase Scripts

Admin and maintenance scripts for the Bookshoes Supabase backend. All require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in **`.env.migration`** in the **project root** (copy from root `.env.migration.example`).

## Dev data (seed)

1. **Clubs, books, meetings**  
   Run **`supabase/seed.sql`** in the Supabase SQL Editor (dev project → SQL Editor). Creates 6 clubs (The Spine Breakers, Marginalia Collective, Late Night Library, Shelf Indulgence, The Dog-Eared Society, Prose and Cons), ~24 books with mixed read statuses, and multiple meetings per club. Run once per empty dev database.

2. **Members (20 users + club_members)**  
   After the SQL seed, run:
   ```bash
   pnpm run seed:dev-users
   ```
   Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.migration` in the project root (use your **dev** project; get both from Supabase → Settings → API, use the **service_role** key). Creates 20 auth users and assigns them to clubs (some in one club, some in several). Meetings don’t have a separate members table—members are the club’s members, so each club will show its list.    To sign in as a seeded user, enable the Email provider in Supabase Auth and use the printed email and password.

3. **Seed reading progress for meeting details (recommended)**  
   After the user seed, run:
   ```bash
   pnpm run seed:dev-progress
   ```
   Populates `books.progress_reports` for meeting-linked books and fills missing `page_count` values so the meeting details “Reading progress” section behaves like production.

4. **Add your own user (e.g. Google) to a club**  
   If you sign in with Google you won't be in any club. After running the SQL seed, run:
   ```bash
   pnpm run add-user-to-club -- your@gmail.com
   ```
   Optionally pass a club name as second argument. Then refresh the app to see clubs and meetings.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm run link:migration-users` | Link duplicate users by email (merge migration + sign-in accounts) |
| `pnpm run link:migration-users -- --dry-run` | Preview user linking |
| `pnpm run link:migration-users -- --list` | List all users with IDs |
| `pnpm run link:migration-users -- --map scripts/user-mapping.json` | Link using manual ID mapping |
| `pnpm run sync:user-memberships` | Rebuild users.memberships and active_club_id from club_members |
| `pnpm run sync:user-memberships -- --dry-run` | Preview sync |
| `pnpm run fix:club-member-ids` | Fix orphaned IDs in club_members, books, meetings |
| `pnpm run fix:club-member-ids -- --dry-run` | Preview fixes |
| `pnpm run sync:user-profiles` | Sync display_name/photo_url from auth to public.users |
| `pnpm run diagnose:members` | Diagnose club members and user resolution |
| `pnpm run seed:dev-users` | (after seed.sql) Create 20 dev users and assign to clubs |
| `pnpm run seed:dev-progress` | (after seed:dev-users) Seed reading progress for meeting-linked books |
| `pnpm run seed:dev-all` | Run `seed:dev-users` + `seed:dev-progress` |
| `pnpm run add-user-to-club -- <email> [club-name]` | Add an existing user (e.g. Google) to a club |

## When to use

- **link:migration-users** – After a migration, if users signed in with Google and got duplicate accounts. Merges by email or via manual mapping.
- **sync:user-memberships** – When `users.memberships` or `active_club_id` are out of sync with `club_members`.
- **fix:club-member-ids** – When members show as empty or IDs are inconsistent.
- **sync:user-profiles** – When users have empty display_name/photo_url (copies from auth).
- **diagnose:members** – To inspect club members and how they resolve to users.

## Archive

`scripts/archive/` contains the one-time Firestore migration scripts (kept for reference). They require `firebase-admin` and are no longer used.
