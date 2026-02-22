-- Remove runtime dependency on uuid-ossp for invite flows.
-- Use pgcrypto/gen_random_uuid() where invite/join-request inserts require defaults.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.club_invites ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.club_join_requests ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE OR REPLACE FUNCTION public.create_club_invite(
  p_club_id UUID,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_max_uses INT DEFAULT NULL
)
RETURNS public.club_invites
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.club_invites;
  v_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_club_moderator_or_admin(p_club_id) THEN
    RAISE EXCEPTION 'Only moderators or admins can create invite links';
  END IF;

  LOOP
    v_code := upper(substring(replace(gen_random_uuid()::TEXT, '-', '') FOR 12));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.club_invites ci WHERE ci.invite_code = v_code
    );
  END LOOP;

  INSERT INTO public.club_invites (
    club_id,
    invite_code,
    created_by,
    max_uses,
    expires_at
  )
  VALUES (
    p_club_id,
    v_code,
    auth.uid(),
    p_max_uses,
    p_expires_at
  )
  RETURNING * INTO v_invite;

  RETURN v_invite;
END;
$$;
