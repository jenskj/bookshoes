-- Bookshoes initial schema migration
-- Run this in Supabase SQL Editor or via supabase db push

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
  ratings JSONB DEFAULT '[]',
  progress_reports JSONB DEFAULT '[]',
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
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting comments
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

-- Book ratings (member_id = club_members.id; one rating per member per book)
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
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
