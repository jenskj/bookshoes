-- Enforce join-mode semantics and allow moderators to manage invite links.

CREATE OR REPLACE FUNCTION public.resolve_club_join_mode(
  p_is_private BOOLEAN,
  p_settings JSONB
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN COALESCE(p_is_private, FALSE) = FALSE THEN 'public_direct'
    WHEN COALESCE(p_settings -> 'access' ->> 'joinMode', 'invite_or_request') = 'invite_only'
      THEN 'invite_only'
    WHEN COALESCE(p_settings -> 'access' ->> 'joinMode', 'invite_or_request') = 'invite_or_request'
      THEN 'invite_or_request'
    ELSE 'invite_or_request'
  END;
$$;

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
    v_code := upper(substring(replace(uuid_generate_v4()::TEXT, '-', '') FOR 12));
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

CREATE OR REPLACE FUNCTION public.revoke_club_invite(p_invite_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_club_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT ci.club_id INTO v_club_id
  FROM public.club_invites ci
  WHERE ci.id = p_invite_id;

  IF v_club_id IS NULL THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF NOT public.is_club_moderator_or_admin(v_club_id) THEN
    RAISE EXCEPTION 'Only moderators or admins can revoke invite links';
  END IF;

  UPDATE public.club_invites
  SET revoked_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.request_club_membership(
  p_club_id UUID,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_join_mode TEXT;
  v_existing_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = p_club_id AND cm.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Already a member';
  END IF;

  SELECT public.resolve_club_join_mode(c.is_private, c.settings)
    INTO v_join_mode
  FROM public.clubs c
  WHERE c.id = p_club_id;

  IF v_join_mode IS NULL THEN
    RAISE EXCEPTION 'Club not found';
  END IF;

  IF v_join_mode = 'public_direct' THEN
    RAISE EXCEPTION 'This club can be joined directly';
  END IF;

  IF v_join_mode <> 'invite_or_request' THEN
    RAISE EXCEPTION 'This club is invite-only';
  END IF;

  SELECT cjr.id INTO v_existing_id
  FROM public.club_join_requests cjr
  WHERE cjr.club_id = p_club_id
    AND cjr.requester_user_id = v_user_id
    AND cjr.status = 'pending'
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN v_existing_id;
  END IF;

  INSERT INTO public.club_join_requests (
    club_id,
    requester_user_id,
    message,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_club_id,
    v_user_id,
    p_message,
    'pending',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_existing_id;

  RETURN v_existing_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_public_club(p_club_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_join_mode TEXT;
  v_inserted INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT public.resolve_club_join_mode(c.is_private, c.settings)
    INTO v_join_mode
  FROM public.clubs c
  WHERE c.id = p_club_id;

  IF v_join_mode IS NULL THEN
    RAISE EXCEPTION 'Club not found';
  END IF;

  IF v_join_mode <> 'public_direct' THEN
    RAISE EXCEPTION 'This club cannot be joined directly';
  END IF;

  INSERT INTO public.club_members (club_id, user_id, role)
  VALUES (p_club_id, v_user_id, 'standard')
  ON CONFLICT (club_id, user_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    PERFORM public.sync_user_memberships(v_user_id);
  END IF;

  RETURN p_club_id;
END;
$$;

DROP POLICY IF EXISTS "Club members self-join public clubs" ON public.club_members;
CREATE POLICY "Club members self-join public clubs" ON public.club_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND role = 'standard'
  AND EXISTS (
    SELECT 1
    FROM public.clubs c
    WHERE c.id = public.club_members.club_id
      AND public.resolve_club_join_mode(c.is_private, c.settings) = 'public_direct'
  )
);

DROP POLICY IF EXISTS "Invites modifiable by admins" ON public.club_invites;
DROP POLICY IF EXISTS "Invites modifiable by mods/admins" ON public.club_invites;
CREATE POLICY "Invites modifiable by mods/admins" ON public.club_invites
FOR ALL
USING (public.is_club_moderator_or_admin(club_id))
WITH CHECK (public.is_club_moderator_or_admin(club_id));

DROP POLICY IF EXISTS "Join requests create by requester" ON public.club_join_requests;
CREATE POLICY "Join requests create by requester" ON public.club_join_requests
FOR INSERT
WITH CHECK (
  requester_user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.clubs c
    WHERE c.id = public.club_join_requests.club_id
      AND public.resolve_club_join_mode(c.is_private, c.settings) = 'invite_or_request'
  )
);

GRANT EXECUTE ON FUNCTION public.join_public_club(UUID) TO authenticated;
