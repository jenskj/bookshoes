-- Row Level Security and Auth trigger

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own row
CREATE POLICY "Users can read own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Clubs: authenticated users can read (for browsing/joining); members can manage
CREATE POLICY "Clubs readable by authenticated" ON public.clubs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Clubs insert by authenticated" ON public.clubs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Clubs update by authenticated" ON public.clubs FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Clubs delete by authenticated" ON public.clubs FOR DELETE USING (auth.uid() IS NOT NULL);

-- Club members: authenticated users can manage
CREATE POLICY "Club members full access" ON public.club_members FOR ALL USING (auth.uid() IS NOT NULL);

-- Books: authenticated users can manage (filtered by club_id in app)
CREATE POLICY "Books full access" ON public.books FOR ALL USING (auth.uid() IS NOT NULL);

-- Meetings: authenticated users can manage
CREATE POLICY "Meetings full access" ON public.meetings FOR ALL USING (auth.uid() IS NOT NULL);

-- Meeting comments: authenticated users can manage
CREATE POLICY "Meeting comments full access" ON public.meeting_comments FOR ALL USING (auth.uid() IS NOT NULL);

-- Book ratings: authenticated users can manage
CREATE POLICY "Book ratings full access" ON public.book_ratings FOR ALL USING (auth.uid() IS NOT NULL);

-- Book progress logs: authenticated users can manage
CREATE POLICY "Book progress full access" ON public.book_progress_logs FOR ALL USING (auth.uid() IS NOT NULL);

-- User presence: users can read any (for online status), update own
CREATE POLICY "Presence readable by authenticated" ON public.user_presence FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Presence upsert own" ON public.user_presence FOR ALL USING (auth.uid() = user_id);

-- Auth trigger: create users row when new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
