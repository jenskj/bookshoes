-- Dev seed: 6 clubs, books (mixed statuses), meetings. Run in Supabase SQL Editor on DEV.
-- Then run: pnpm run seed:dev-users (creates 20 members and assigns them to clubs).

-- ========== CLUBS (6) ==========
INSERT INTO public.clubs (name, is_private, tagline, description) VALUES
  ('The Spine Breakers', false, 'We actually finish books', 'No DNFs here. We read cover to cover and debate the ending.'),
  ('Marginalia Collective', false, 'Notes in the margins', 'We annotate, underline, and share our scribbles. Bring your pencil.'),
  ('Late Night Library', false, 'Past midnight', 'For night owls who read when the world is quiet.'),
  ('Shelf Indulgence', false, 'No guilt, just books', 'Romance, thrillers, and whatever we feel like. Judge-free zone.'),
  ('The Dog-Eared Society', false, 'Well-loved pages', 'Secondhand books, battered paperbacks, and stories that look it.'),
  ('Prose and Cons', false, 'Crime and mystery', 'Detectives, heists, and whodunnits. Spoilers are the real crime.');

-- ========== BOOKS – The Spine Breakers ==========
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Count of Monte Cristo', ARRAY['Alexandre Dumas'], 'read', NOW() - INTERVAL '100 days' FROM public.clubs WHERE name = 'The Spine Breakers' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Lonesome Dove', ARRAY['Larry McMurtry'], 'read', NOW() - INTERVAL '70 days' FROM public.clubs WHERE name = 'The Spine Breakers' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Goldfinch', ARRAY['Donna Tartt'], 'reading', NOW() - INTERVAL '25 days' FROM public.clubs WHERE name = 'The Spine Breakers' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Pachinko', ARRAY['Min Jin Lee'], 'candidate', NOW() FROM public.clubs WHERE name = 'The Spine Breakers' LIMIT 1;

-- ========== BOOKS – Marginalia Collective ==========
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'How to Do Nothing', ARRAY['Jenny Odell'], 'read', NOW() - INTERVAL '50 days' FROM public.clubs WHERE name = 'Marginalia Collective' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Anthropocene Reviewed', ARRAY['John Green'], 'reading', NOW() - INTERVAL '12 days' FROM public.clubs WHERE name = 'Marginalia Collective' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Stolen Focus', ARRAY['Johann Hari'], 'candidate', NOW() FROM public.clubs WHERE name = 'Marginalia Collective' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Four Thousand Weeks', ARRAY['Oliver Burkeman'], 'unread', NOW() - INTERVAL '5 days' FROM public.clubs WHERE name = 'Marginalia Collective' LIMIT 1;

-- ========== BOOKS – Late Night Library ==========
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'House of Leaves', ARRAY['Mark Z. Danielewski'], 'read', NOW() - INTERVAL '80 days' FROM public.clubs WHERE name = 'Late Night Library' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Raw Shark Texts', ARRAY['Steven Hall'], 'reading', NOW() - INTERVAL '18 days' FROM public.clubs WHERE name = 'Late Night Library' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Piranesi', ARRAY['Susanna Clarke'], 'candidate', NOW() FROM public.clubs WHERE name = 'Late Night Library' LIMIT 1;

-- ========== BOOKS – Shelf Indulgence ==========
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Book Lovers', ARRAY['Emily Henry'], 'read', NOW() - INTERVAL '40 days' FROM public.clubs WHERE name = 'Shelf Indulgence' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Seven Husbands of Evelyn Hugo', ARRAY['Taylor Jenkins Reid'], 'read', NOW() - INTERVAL '55 days' FROM public.clubs WHERE name = 'Shelf Indulgence' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Happy Place', ARRAY['Emily Henry'], 'reading', NOW() - INTERVAL '8 days' FROM public.clubs WHERE name = 'Shelf Indulgence' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Romantic Comedy', ARRAY['Curtis Sittenfeld'], 'candidate', NOW() FROM public.clubs WHERE name = 'Shelf Indulgence' LIMIT 1;

-- ========== BOOKS – The Dog-Eared Society ==========
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Secret History', ARRAY['Donna Tartt'], 'read', NOW() - INTERVAL '90 days' FROM public.clubs WHERE name = 'The Dog-Eared Society' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Stoner', ARRAY['John Williams'], 'reading', NOW() - INTERVAL '22 days' FROM public.clubs WHERE name = 'The Dog-Eared Society' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'A Gentleman in Moscow', ARRAY['Amor Towles'], 'candidate', NOW() FROM public.clubs WHERE name = 'The Dog-Eared Society' LIMIT 1;

-- ========== BOOKS – Prose and Cons ==========
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Girl with the Dragon Tattoo', ARRAY['Stieg Larsson'], 'read', NOW() - INTERVAL '60 days' FROM public.clubs WHERE name = 'Prose and Cons' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Gone Girl', ARRAY['Gillian Flynn'], 'read', NOW() - INTERVAL '45 days' FROM public.clubs WHERE name = 'Prose and Cons' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'The Silent Patient', ARRAY['Alex Michaelides'], 'reading', NOW() - INTERVAL '10 days' FROM public.clubs WHERE name = 'Prose and Cons' LIMIT 1;
INSERT INTO public.books (club_id, title, authors, read_status, added_at)
SELECT id, 'Sharp Objects', ARRAY['Gillian Flynn'], 'unread', NOW() - INTERVAL '3 days' FROM public.clubs WHERE name = 'Prose and Cons' LIMIT 1;

-- ========== MEETINGS – The Spine Breakers ==========
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '95 days', 'Main Library, Room 3' FROM public.clubs WHERE name = 'The Spine Breakers' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '65 days', 'Zoom' FROM public.clubs WHERE name = 'The Spine Breakers' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() + INTERVAL '10 days', 'Bookshop café' FROM public.clubs WHERE name = 'The Spine Breakers' LIMIT 1;

-- ========== MEETINGS – Marginalia Collective ==========
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '45 days', 'Co-working space' FROM public.clubs WHERE name = 'Marginalia Collective' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() + INTERVAL '18 days', 'TBD' FROM public.clubs WHERE name = 'Marginalia Collective' LIMIT 1;

-- ========== MEETINGS – Late Night Library ==========
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '75 days', 'Discord' FROM public.clubs WHERE name = 'Late Night Library' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '30 days', 'Discord' FROM public.clubs WHERE name = 'Late Night Library' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() + INTERVAL '5 days', 'Discord (midnight)' FROM public.clubs WHERE name = 'Late Night Library' LIMIT 1;

-- ========== MEETINGS – Shelf Indulgence ==========
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '35 days', 'Wine bar' FROM public.clubs WHERE name = 'Shelf Indulgence' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() + INTERVAL '12 days', 'Same wine bar' FROM public.clubs WHERE name = 'Shelf Indulgence' LIMIT 1;

-- ========== MEETINGS – The Dog-Eared Society ==========
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '85 days', 'Charity shop back room' FROM public.clubs WHERE name = 'The Dog-Eared Society' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() + INTERVAL '21 days', 'Flea market + coffee' FROM public.clubs WHERE name = 'The Dog-Eared Society' LIMIT 1;

-- ========== MEETINGS – Prose and Cons ==========
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '55 days', 'Mystery bookstore' FROM public.clubs WHERE name = 'Prose and Cons' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() - INTERVAL '20 days', 'Online' FROM public.clubs WHERE name = 'Prose and Cons' LIMIT 1;
INSERT INTO public.meetings (club_id, date, location_address) SELECT id, NOW() + INTERVAL '7 days', 'Mystery bookstore' FROM public.clubs WHERE name = 'Prose and Cons' LIMIT 1;

-- ========== Link some books to upcoming meetings (triggers set read_status) ==========
UPDATE public.books b SET scheduled_meetings = ARRAY(SELECT m.id FROM public.meetings m JOIN public.clubs c ON c.id = m.club_id WHERE c.name = 'The Spine Breakers' AND m.date > NOW() LIMIT 1)
FROM public.clubs c WHERE b.club_id = c.id AND c.name = 'The Spine Breakers' AND b.title = 'The Goldfinch';

UPDATE public.books b SET scheduled_meetings = ARRAY(SELECT m.id FROM public.meetings m JOIN public.clubs c ON c.id = m.club_id WHERE c.name = 'Marginalia Collective' AND m.date > NOW() LIMIT 1)
FROM public.clubs c WHERE b.club_id = c.id AND c.name = 'Marginalia Collective' AND b.title = 'The Anthropocene Reviewed';

UPDATE public.books b SET scheduled_meetings = ARRAY(SELECT m.id FROM public.meetings m JOIN public.clubs c ON c.id = m.club_id WHERE c.name = 'Late Night Library' AND m.date > NOW() LIMIT 1)
FROM public.clubs c WHERE b.club_id = c.id AND c.name = 'Late Night Library' AND b.title = 'The Raw Shark Texts';

UPDATE public.books b SET scheduled_meetings = ARRAY(SELECT m.id FROM public.meetings m JOIN public.clubs c ON c.id = m.club_id WHERE c.name = 'Shelf Indulgence' AND m.date > NOW() LIMIT 1)
FROM public.clubs c WHERE b.club_id = c.id AND c.name = 'Shelf Indulgence' AND b.title = 'Happy Place';

UPDATE public.books b SET scheduled_meetings = ARRAY(SELECT m.id FROM public.meetings m JOIN public.clubs c ON c.id = m.club_id WHERE c.name = 'The Dog-Eared Society' AND m.date > NOW() LIMIT 1)
FROM public.clubs c WHERE b.club_id = c.id AND c.name = 'The Dog-Eared Society' AND b.title = 'Stoner';

UPDATE public.books b SET scheduled_meetings = ARRAY(SELECT m.id FROM public.meetings m JOIN public.clubs c ON c.id = m.club_id WHERE c.name = 'Prose and Cons' AND m.date > NOW() LIMIT 1)
FROM public.clubs c WHERE b.club_id = c.id AND c.name = 'Prose and Cons' AND b.title = 'The Silent Patient';
