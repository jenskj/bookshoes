-- Club settings JSONB for multi-step setup and admin configuration.

ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Replace create-club RPC with settings payload support.
DROP FUNCTION IF EXISTS public.create_club_with_admin(TEXT, BOOLEAN, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_club_with_admin(
  p_name TEXT,
  p_is_private BOOLEAN DEFAULT FALSE,
  p_tagline TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_settings JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_club_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.clubs (
    name,
    is_private,
    tagline,
    description,
    settings
  )
  VALUES (
    p_name,
    COALESCE(p_is_private, FALSE),
    p_tagline,
    p_description,
    COALESCE(p_settings, '{}'::jsonb)
  )
  RETURNING id INTO v_club_id;

  INSERT INTO public.club_members (club_id, user_id, role)
  VALUES (v_club_id, v_user_id, 'admin')
  ON CONFLICT (club_id, user_id) DO NOTHING;

  PERFORM public.sync_user_memberships(v_user_id);

  RETURN v_club_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_club_with_admin(TEXT, BOOLEAN, TEXT, TEXT, JSONB) TO authenticated;
