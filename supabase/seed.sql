-- Dev seed: clubs, books, and meetings (run in Supabase SQL Editor on your DEV project)
-- Users are created when you sign in with Google; then join clubs via the app.

-- Clubs
INSERT INTO public.clubs (name, is_private, tagline, description) VALUES
  ('Bookworms', false, 'We read stuff', 'A cozy club for casual readers. We pick a book each month and meet to chat.'),
  ('Sci-Fi Squad', false, 'Space and time', 'Science fiction and fantasy fans. From classics to new releases.');

-- Books for Bookworms (use club id by name)
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Hitchhiker''s Guide to the Galaxy', ARRAY['Douglas Adams'], 'read', NOW() - INTERVAL '60 days'
FROM public.clubs WHERE name = 'Bookworms' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Project Hail Mary', ARRAY['Andy Weir'], 'reading', NOW() - INTERVAL '20 days'
FROM public.clubs WHERE name = 'Bookworms' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Klara and the Sun', ARRAY['Kazuo Ishiguro'], 'candidate', NOW()
FROM public.clubs WHERE name = 'Bookworms' LIMIT 1;

-- Books for Sci-Fi Squad
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Dune', ARRAY['Frank Herbert'], 'read', NOW() - INTERVAL '90 days'
FROM public.clubs WHERE name = 'Sci-Fi Squad' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Left Hand of Darkness', ARRAY['Ursula K. Le Guin'], 'reading', NOW() - INTERVAL '14 days'
FROM public.clubs WHERE name = 'Sci-Fi Squad' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'A Memory Called Empire', ARRAY['Arkady Martine'], 'candidate', NOW()
FROM public.clubs WHERE name = 'Sci-Fi Squad' LIMIT 1;

-- Meetings for Bookworms (one past, one upcoming)
INSERT INTO public.meetings (club_id, date, location_address)
SELECT id, NOW() - INTERVAL '30 days', 'Central Library, Room B'
FROM public.clubs WHERE name = 'Bookworms' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address)
SELECT id, NOW() + INTERVAL '14 days', 'TBD – maybe the park'
FROM public.clubs WHERE name = 'Bookworms' LIMIT 1;

-- Meetings for Sci-Fi Squad
INSERT INTO public.meetings (club_id, date, location_address)
SELECT id, NOW() - INTERVAL '45 days', 'Online'
FROM public.clubs WHERE name = 'Sci-Fi Squad' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address)
SELECT id, NOW() + INTERVAL '7 days', 'Café Nebula'
FROM public.clubs WHERE name = 'Sci-Fi Squad' LIMIT 1;

-- Link some books to upcoming meetings (so they show as "reading")
UPDATE public.books b
SET scheduled_meetings = (
  SELECT ARRAY_AGG(m.id)
  FROM public.meetings m
  WHERE m.club_id = b.club_id AND m.date > NOW()
  LIMIT 1
)
FROM public.clubs c
WHERE b.club_id = c.id AND c.name = 'Bookworms' AND b.title = 'Project Hail Mary';

UPDATE public.books b
SET scheduled_meetings = (
  SELECT ARRAY_AGG(m.id)
  FROM public.meetings m
  WHERE m.club_id = b.club_id AND m.date > NOW()
  LIMIT 1
)
FROM public.clubs c
WHERE b.club_id = c.id AND c.name = 'Sci-Fi Squad' AND b.title = 'The Left Hand of Darkness';
