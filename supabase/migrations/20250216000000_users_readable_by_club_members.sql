-- Allow users to read display_name/photo_url of other club members
-- Fixes empty members on home page (RLS was blocking reads of other users)

DROP POLICY IF EXISTS "Users can read own" ON public.users;

CREATE POLICY "Users can read own" ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users readable by club members" ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.club_members cm1
    JOIN public.club_members cm2 ON cm1.club_id = cm2.club_id
    WHERE cm1.user_id = auth.uid() AND cm2.user_id = public.users.id
  )
);
