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
   Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.migration` in the project root (use your **dev** project; get both from Supabase → Settings → API, use the **service_role** key). Creates 20 auth users and assigns them to clubs (some in one club, some in several). Meetings don’t have a separate members table—members are the club’s members, so each club will show its list. To sign in as a seeded user, enable the Email provider in Supabase Auth and use the printed email and password.

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

## When to use

- **link:migration-users** – After a migration, if users signed in with Google and got duplicate accounts. Merges by email or via manual mapping.
- **sync:user-memberships** – When `users.memberships` or `active_club_id` are out of sync with `club_members`.
- **fix:club-member-ids** – When members show as empty or IDs are inconsistent.
- **sync:user-profiles** – When users have empty display_name/photo_url (copies from auth).
- **diagnose:members** – To inspect club members and how they resolve to users.

## Archive

`scripts/archive/` contains the one-time Firestore migration scripts (kept for reference). They require `firebase-admin` and are no longer used.
