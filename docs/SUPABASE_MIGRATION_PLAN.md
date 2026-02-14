# Supabase Migration Plan for Bookshoes

This document outlines the step-by-step plan to migrate the Bookshoes app from Firebase (Auth, Firestore, Realtime Database, Cloud Functions) to Supabase (PostgreSQL, Auth, Realtime, Edge Functions).

---

## Phase 1: Supabase Setup and Schema

### 1.1 Create Supabase Project

- Sign up at [supabase.com](https://supabase.com) and create a new project
- Note the project URL and anon key from Settings > API
- Add to `.env.local`:
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```

### 1.2 Database Schema

Run the following SQL in the Supabase SQL Editor to create the schema. Order matters: `clubs` must exist before `users` (due to `active_club_id` FK).

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clubs (must exist before users due to active_club_id FK)
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  tagline TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (synced from Supabase Auth, extended with app fields)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  active_club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  memberships UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club members (junction table)
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'standard' CHECK (role IN ('standard', 'admin', 'moderator')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Books (club-scoped)
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  google_id TEXT,
  title TEXT,
  authors TEXT[],
  image_thumbnail TEXT,
  description TEXT,
  page_count INT,
  average_rating NUMERIC,
  ratings_count INT,
  published_date TEXT,
  publisher TEXT,
  read_status TEXT DEFAULT 'candidate' CHECK (read_status IN ('unread', 'read', 'reading', 'candidate')),
  inactive BOOLEAN DEFAULT false,
  scheduled_meetings UUID[] DEFAULT '{}',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings (club-scoped)
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  date TIMESTAMPTZ,
  location_address TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  remote_link TEXT,
  remote_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting comments (stored as JSONB for flexibility, or separate table)
CREATE TABLE public.meeting_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  text TEXT NOT NULL,
  type TEXT CHECK (type IN ('reminder', 'comment', 'poll', 'announcement', 'suggestion')),
  tagged_users UUID[],
  tagged_books UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book ratings
CREATE TABLE public.book_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.club_members(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, member_id)
);

-- Book progress logs
CREATE TABLE public.book_progress_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_page INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User presence (replaces Firebase Realtime Database)
CREATE TABLE public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  last_online_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_books_club_id ON public.books(club_id);
CREATE INDEX idx_books_read_status ON public.books(club_id, read_status);
CREATE INDEX idx_meetings_club_id ON public.meetings(club_id);
CREATE INDEX idx_club_members_club_id ON public.club_members(club_id);
CREATE INDEX idx_users_memberships ON public.users USING GIN(memberships);

-- Enable Realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.books;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
```

### 1.3 Row Level Security (RLS)

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own row
CREATE POLICY "Users can read own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs: members can read; for now allow authenticated users to create (refine as needed)
CREATE POLICY "Clubs readable by members" ON public.clubs FOR SELECT USING (
  id = ANY(SELECT unnest(memberships) FROM public.users WHERE id = auth.uid())
  OR id IN (SELECT club_id FROM public.club_members WHERE user_id = auth.uid())
);
CREATE POLICY "Clubs insert" ON public.clubs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add more policies for club_members, books, meetings based on club membership
-- (Simplified for initial migration; refine after testing)
```

### 1.4 Auth Trigger for User Creation

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Phase 2: readStatus Logic (Replace Cloud Functions)

### 2.1 Database Triggers

Create triggers to replicate the three Firebase Cloud Functions:

**Trigger 1: On book insert/update (scheduledMeetings change)**

```sql
CREATE OR REPLACE FUNCTION update_book_read_status()
RETURNS TRIGGER AS $$
DECLARE
  new_status TEXT;
  meeting_date TIMESTAMPTZ;
BEGIN
  -- New book: default to candidate
  IF TG_OP = 'INSERT' AND NEW.read_status IS NULL THEN
    NEW.read_status := 'candidate';
    RETURN NEW;
  END IF;

  -- No scheduled meetings: candidate
  IF NEW.scheduled_meetings IS NULL OR array_length(NEW.scheduled_meetings, 1) IS NULL THEN
    NEW.read_status := 'candidate';
    RETURN NEW;
  END IF;

  -- Check if any scheduled meeting is in the future
  SELECT m.date INTO meeting_date
  FROM public.meetings m
  WHERE m.id = ANY(NEW.scheduled_meetings)
  ORDER BY m.date DESC
  LIMIT 1;

  IF meeting_date IS NULL THEN
    NEW.read_status := 'candidate';
  ELSIF meeting_date > NOW() THEN
    NEW.read_status := 'reading';
  ELSE
    NEW.read_status := 'read';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_read_status_trigger
  BEFORE INSERT OR UPDATE OF scheduled_meetings ON public.books
  FOR EACH ROW EXECUTE FUNCTION update_book_read_status();
```

**Trigger 2: On meeting update (date change)**

```sql
CREATE OR REPLACE FUNCTION on_meeting_updated()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.date IS NOT DISTINCT FROM NEW.date THEN
    RETURN NEW;
  END IF;

  UPDATE public.books
  SET read_status = CASE
    WHEN NEW.date > NOW() THEN 'reading'
    ELSE 'read'
  END
  WHERE club_id = NEW.club_id
    AND NEW.id = ANY(scheduled_meetings);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meeting_updated_trigger
  AFTER UPDATE OF date ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION on_meeting_updated();
```

**Trigger 3: On meeting delete**

```sql
CREATE OR REPLACE FUNCTION on_meeting_deleted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET scheduled_meetings = array_remove(scheduled_meetings, OLD.id),
      read_status = CASE
        WHEN array_length(array_remove(scheduled_meetings, OLD.id), 1) IS NULL THEN 'candidate'
        ELSE read_status
      END
  WHERE club_id = OLD.club_id AND OLD.id = ANY(scheduled_meetings);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meeting_deleted_trigger
  BEFORE DELETE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION on_meeting_deleted();
```

---

## Phase 3: Frontend Migration

### 3.1 Dependencies

**Remove:**
- `firebase`
- `firebase-admin` (root; keep only in bookshoesfns until removal)
- `firebase-functions` (bookshoesfns)

**Add:**
- `@supabase/supabase-js`

### 3.2 New Supabase Client Module

Create `src/supabase.ts` (replaces `src/firestore.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Update `tsconfig.paths.json`: add `@supabase` pointing to `./src/supabase.ts` (or keep `@firestore` and repoint it).

### 3.3 Type Updates

Update `src/types.ts`:
- Remove `DocumentReference` and `Timestamp` from Firebase imports
- Use `string` for IDs (UUIDs) instead of document references
- Use `Date` or `string` (ISO) for timestamps
- Replace `activeClub?: DocumentReference` with `active_club_id?: string`

### 3.4 Auth Migration

**File: `src/components/TopMenu/SignIn.tsx`**

- Replace `signInWithPopup(auth, provider)` with `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Replace `auth.onAuthStateChanged` with `supabase.auth.onAuthStateChange`
- On sign-in: fetch/upsert user from `users` table (Auth trigger may have created it; update photo/displayName if changed)
- Replace `doc(db, 'users', uid)` with `supabase.from('users').select().eq('id', uid).single()`

**File: `src/components/TopMenu/TopMenuButton.tsx`**

- Replace `auth.signOut()` with `supabase.auth.signOut()`
- Replace `auth.currentUser` with `supabase.auth.getUser()` or session from `onAuthStateChange`
- Replace `updateDocument('users', { activeClub: doc(db, 'clubs', id) })` with `supabase.from('users').update({ active_club_id: id })`
- Replace `deleteField()` for clearing active club with `{ active_club_id: null }`

### 3.5 Data Access Layer

**Create `src/utils/supabaseUtils.ts`** (replaces `firestoreUtils.ts`):

- `addNewDocument` → `supabase.from(table).insert(body).select().single()`
- `updateDocument` → `supabase.from(table).update({ ...body, modified_at: new Date().toISOString() }).eq('id', id)`
- `deleteDocument` → `supabase.from(table).delete().eq('id', id)`
- `addNewClubMember` → insert into `club_members`, update `users.memberships` and `users.active_club_id`
- `updateBookScheduledMeetings` → `supabase.from('books').update({ scheduled_meetings: ... }).eq('id', bookId)`
- `getIdFromDocumentReference` → remove (no longer needed; use IDs directly)

**Path handling:** Firestore used paths like `clubs/{id}/books`. Supabase uses `books` table with `club_id` column. All queries filter by `club_id`.

### 3.6 Realtime Subscriptions

**File: `src/App.tsx`**

Replace Firestore `onSnapshot` with Supabase Realtime:

```typescript
// Books
const channel = supabase
  .channel('books')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'books',
    filter: `club_id=eq.${activeClub?.docId}`,
  }, (payload) => { /* update books state */ })
  .subscribe();

// Similar for meetings, club_members, users
```

Return `channel.unsubscribe()` in useEffect cleanup.

### 3.7 User Presence

**Option A: Supabase Realtime Presence**

Use `supabase.channel('presence').track({ user_id })` and `channel.on('presence', { event: 'sync' }, ...)` to detect online users. Requires mapping presence to `user_id` for display.

**Option B: Heartbeat Table**

- In `App.tsx`, replace Realtime DB logic with: periodically `supabase.from('user_presence').upsert({ user_id, last_online_at: new Date() })`
- In `Member.tsx`, replace `onValue(myConnectionsRef)` with a query or Realtime subscription to `user_presence` filtered by `user_id`

### 3.8 Files to Modify (Checklist)

| File | Changes |
|------|---------|
| `src/firestore.ts` | Delete; replace with `src/supabase.ts` |
| `src/supabase.ts` | Create (new client) |
| `tsconfig.paths.json` | Update `@firestore` → `@supabase` or add alias |
| `src/types.ts` | Remove Firebase types; use plain TS types |
| `src/utils/firestoreUtils.ts` | Replace with `supabaseUtils.ts` |
| `src/utils/index.ts` | Export from supabaseUtils |
| `src/utils/formatDate.ts` | Remove Timestamp import; use Date/string |
| `src/App.tsx` | Auth, Realtime, presence, remove Firebase imports |
| `src/components/TopMenu/SignIn.tsx` | Supabase Auth |
| `src/components/TopMenu/TopMenuButton.tsx` | Supabase Auth, update user |
| `src/components/Members/Member.tsx` | Presence via Supabase |
| `src/pages/Clubs/Clubs.tsx` | Supabase queries + Realtime |
| `src/pages/Clubs/ClubDetails.tsx` | Supabase queries |
| `src/pages/Books/BookDetails.tsx` | Supabase queries, remove deleteField |
| `src/pages/Meetings/MeetingDetails.tsx` | Supabase queries |
| `src/components/Club/ClubForm.tsx` | Supabase queries |
| `src/components/Club/Club.tsx` | Supabase Realtime |
| `src/components/Meeting/MeetingForm.tsx` | Supabase queries, Date handling |
| `src/components/Book/BookForm.tsx` | Supabase, Date handling |
| `src/components/Comments/CommentList.tsx` | Remove arrayRemove; use Supabase |
| `src/components/Comments/CommentForm.tsx` | arrayUnion → Supabase update |
| `src/components/Ratings/RatingList.tsx` | Supabase, remove arrayUnion |
| `src/components/Progress/ProgressBarList.tsx` | Supabase |
| `package.json` | Remove firebase; add @supabase/supabase-js |

### 3.9 Remove Firebase Backend

- Delete `bookshoesfns/` directory
- Remove `firebase.json` functions config (or delete `firebase.json` entirely if not using Firebase Hosting)
- Remove Firebase-related env vars from docs

---

## Phase 4: Data Migration (Optional)

If you have existing Firebase data to migrate:

1. Export Firestore data (e.g. `gcloud firestore export`)
2. Write a one-off script (Node/ts) that:
   - Reads exported JSON
   - Maps Firestore documents to PostgreSQL rows
   - Inserts via Supabase client or direct SQL
3. User accounts: Firebase Auth users must re-register with Supabase (or use a migration script if Supabase supports importing users)

---

## Phase 5: Testing and Cleanup

1. Run app locally with Supabase (no emulators; use Supabase project)
2. Test: sign-in, create club, add books, schedule meetings, verify readStatus updates
3. Test: presence (online/offline)
4. Test: real-time updates when data changes in another tab
5. Remove all Firebase imports and dependencies
6. Update README with Supabase setup instructions

---

## Environment Variables Summary

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_GOOGLE_BOOKS_API` | Keep (unchanged) |

Remove: `VITE_FIRESTORE_API` (or any Firebase config).

---

## Suggested Order of Execution

1. **Phase 1** – Supabase project, schema, RLS, auth trigger
2. **Phase 2** – readStatus triggers
3. **Phase 3.1–3.2** – Install Supabase, create client
4. **Phase 3.3** – Update types
5. **Phase 3.4** – Auth migration (SignIn, TopMenuButton)
6. **Phase 3.5** – Data utils (supabaseUtils)
7. **Phase 3.6** – Realtime in App.tsx and Clubs/Club
8. **Phase 3.7** – Presence
9. **Phase 3.8** – Remaining component updates
10. **Phase 3.9** – Remove Firebase
11. **Phase 4** – Data migration (if needed)
12. **Phase 5** – Testing and docs
