-- Fix Supabase security warnings: pin function search_path so role-level changes
-- cannot influence object resolution inside these trigger functions.

ALTER FUNCTION public.handle_new_user()
SET search_path = public;

ALTER FUNCTION public.update_book_read_status()
SET search_path = public;

ALTER FUNCTION public.on_meeting_updated()
SET search_path = public;

ALTER FUNCTION public.on_meeting_deleted()
SET search_path = public;
