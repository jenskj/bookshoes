-- Fix recursive RLS evaluation on public.club_members.
-- Previous policy queried public.club_members directly, which can recurse when
-- another policy/subquery references club_members.

DROP POLICY IF EXISTS "Club members readable by related users" ON public.club_members;

CREATE POLICY "Club members readable by related users" ON public.club_members
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR public.current_user_role_in_club(club_id) IS NOT NULL
    OR EXISTS (
      SELECT 1
      FROM public.clubs c
      WHERE c.id = club_id
        AND c.is_private = FALSE
    )
  )
);
