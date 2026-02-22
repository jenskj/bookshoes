-- Club governance, invitation flows, and RLS hardening.

-- New governance tables
CREATE TABLE IF NOT EXISTS public.club_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  max_uses INT,
  uses_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT club_invites_max_uses_non_negative CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT club_invites_uses_count_non_negative CHECK (uses_count >= 0)
);

CREATE TABLE IF NOT EXISTS public.club_join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_club_join_requests_unique_pending
  ON public.club_join_requests (club_id, requester_user_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_club_invites_club_id ON public.club_invites(club_id);
CREATE INDEX IF NOT EXISTS idx_club_invites_invite_code ON public.club_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_club_join_requests_club_id ON public.club_join_requests(club_id);
CREATE INDEX IF NOT EXISTS idx_club_join_requests_requester ON public.club_join_requests(requester_user_id);

ALTER TABLE public.club_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_join_requests ENABLE ROW LEVEL SECURITY;

-- Shared helper functions
CREATE OR REPLACE FUNCTION public.current_user_role_in_club(p_club_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cm.role
  FROM public.club_members cm
  WHERE cm.club_id = p_club_id AND cm.user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_club_admin(p_club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = p_club_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_club_moderator_or_admin(p_club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = p_club_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('admin', 'moderator')
  );
$$;

CREATE OR REPLACE FUNCTION public.sync_user_memberships(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_memberships UUID[];
  current_active UUID;
BEGIN
  SELECT COALESCE(array_agg(cm.club_id), ARRAY[]::UUID[])
  INTO next_memberships
  FROM public.club_members cm
  WHERE cm.user_id = p_user_id;

  SELECT u.active_club_id
  INTO current_active
  FROM public.users u
  WHERE u.id = p_user_id;

  UPDATE public.users
  SET
    memberships = next_memberships,
    active_club_id = CASE
      WHEN current_active IS NOT NULL AND current_active = ANY(next_memberships) THEN current_active
      WHEN array_length(next_memberships, 1) IS NULL THEN NULL
      ELSE next_memberships[1]
    END,
    modified_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- RPC: create club + first admin member
CREATE OR REPLACE FUNCTION public.create_club_with_admin(
  p_name TEXT,
  p_is_private BOOLEAN DEFAULT FALSE,
  p_tagline TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
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

  INSERT INTO public.clubs (name, is_private, tagline, description)
  VALUES (p_name, COALESCE(p_is_private, FALSE), p_tagline, p_description)
  RETURNING id INTO v_club_id;

  INSERT INTO public.club_members (club_id, user_id, role)
  VALUES (v_club_id, v_user_id, 'admin')
  ON CONFLICT (club_id, user_id) DO NOTHING;

  PERFORM public.sync_user_memberships(v_user_id);

  RETURN v_club_id;
END;
$$;

-- RPC: create invite
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

  IF NOT public.is_club_admin(p_club_id) THEN
    RAISE EXCEPTION 'Only admins can create invite links';
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

-- RPC: revoke invite
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

  IF NOT public.is_club_admin(v_club_id) THEN
    RAISE EXCEPTION 'Only admins can revoke invite links';
  END IF;

  UPDATE public.club_invites
  SET revoked_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

-- RPC: accept invite
CREATE OR REPLACE FUNCTION public.accept_club_invite(p_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_invite public.club_invites;
  v_inserted INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_invite
  FROM public.club_invites ci
  WHERE ci.invite_code = p_invite_code;

  IF v_invite.id IS NULL THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF v_invite.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite link has been revoked';
  END IF;

  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invite link has expired';
  END IF;

  IF v_invite.max_uses IS NOT NULL AND v_invite.uses_count >= v_invite.max_uses THEN
    RAISE EXCEPTION 'Invite link has reached max uses';
  END IF;

  INSERT INTO public.club_members (club_id, user_id, role)
  VALUES (v_invite.club_id, v_user_id, 'standard')
  ON CONFLICT (club_id, user_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    UPDATE public.club_invites
    SET uses_count = uses_count + 1
    WHERE id = v_invite.id;
  END IF;

  PERFORM public.sync_user_memberships(v_user_id);

  RETURN v_invite.club_id;
END;
$$;

-- RPC: request membership (private clubs)
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
  v_is_private BOOLEAN;
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

  SELECT c.is_private INTO v_is_private
  FROM public.clubs c
  WHERE c.id = p_club_id;

  IF v_is_private IS NULL THEN
    RAISE EXCEPTION 'Club not found';
  END IF;

  IF v_is_private = FALSE THEN
    RAISE EXCEPTION 'Public clubs do not require a join request';
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

-- RPC: approve/deny join request
CREATE OR REPLACE FUNCTION public.review_club_join_request(
  p_request_id UUID,
  p_decision TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.club_join_requests;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_decision NOT IN ('approved', 'denied') THEN
    RAISE EXCEPTION 'Invalid decision';
  END IF;

  SELECT * INTO v_request
  FROM public.club_join_requests cjr
  WHERE cjr.id = p_request_id;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Request has already been reviewed';
  END IF;

  IF NOT public.is_club_moderator_or_admin(v_request.club_id) THEN
    RAISE EXCEPTION 'Only moderators or admins can review requests';
  END IF;

  UPDATE public.club_join_requests
  SET
    status = p_decision,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  IF p_decision = 'approved' THEN
    INSERT INTO public.club_members (club_id, user_id, role)
    VALUES (v_request.club_id, v_request.requester_user_id, 'standard')
    ON CONFLICT (club_id, user_id) DO NOTHING;

    PERFORM public.sync_user_memberships(v_request.requester_user_id);
  END IF;
END;
$$;

-- RPC: update member role (admin only)
CREATE OR REPLACE FUNCTION public.update_club_member_role(
  p_member_id UUID,
  p_new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target public.club_members;
  v_admin_count INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_new_role NOT IN ('standard', 'moderator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  SELECT * INTO v_target
  FROM public.club_members cm
  WHERE cm.id = p_member_id;

  IF v_target.id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF NOT public.is_club_admin(v_target.club_id) THEN
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;

  IF v_target.role = 'admin' AND p_new_role <> 'admin' THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM public.club_members cm
    WHERE cm.club_id = v_target.club_id
      AND cm.role = 'admin';

    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot demote the last admin';
    END IF;
  END IF;

  UPDATE public.club_members
  SET role = p_new_role
  WHERE id = p_member_id;
END;
$$;

-- RPC: remove member
CREATE OR REPLACE FUNCTION public.remove_club_member(p_member_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target public.club_members;
  v_actor_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_target
  FROM public.club_members cm
  WHERE cm.id = p_member_id;

  IF v_target.id IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF v_target.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Use leave_club to remove yourself';
  END IF;

  SELECT public.current_user_role_in_club(v_target.club_id) INTO v_actor_role;

  IF v_actor_role IS NULL THEN
    RAISE EXCEPTION 'Only club members can remove members';
  END IF;

  IF v_actor_role = 'admin' THEN
    IF v_target.role = 'admin' THEN
      RAISE EXCEPTION 'Admins cannot remove other admins';
    END IF;
  ELSIF v_actor_role = 'moderator' THEN
    IF v_target.role <> 'standard' THEN
      RAISE EXCEPTION 'Moderators can only remove standard members';
    END IF;
  ELSE
    RAISE EXCEPTION 'Only admins or moderators can remove members';
  END IF;

  DELETE FROM public.club_members
  WHERE id = p_member_id;

  PERFORM public.sync_user_memberships(v_target.user_id);
END;
$$;

-- RPC: leave club with last-admin guard
CREATE OR REPLACE FUNCTION public.leave_club(p_club_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_member public.club_members;
  v_admin_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_member
  FROM public.club_members cm
  WHERE cm.club_id = p_club_id
    AND cm.user_id = v_user_id;

  IF v_member.id IS NULL THEN
    RAISE EXCEPTION 'Not a club member';
  END IF;

  IF v_member.role = 'admin' THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM public.club_members cm
    WHERE cm.club_id = p_club_id
      AND cm.role = 'admin';

    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot leave while you are the last admin';
    END IF;
  END IF;

  DELETE FROM public.club_members
  WHERE id = v_member.id;

  PERFORM public.sync_user_memberships(v_user_id);
END;
$$;

-- RLS hardening for existing tables
DROP POLICY IF EXISTS "Clubs insert by authenticated" ON public.clubs;
DROP POLICY IF EXISTS "Clubs update by authenticated" ON public.clubs;
DROP POLICY IF EXISTS "Clubs delete by authenticated" ON public.clubs;
DROP POLICY IF EXISTS "Club members full access" ON public.club_members;
DROP POLICY IF EXISTS "Books full access" ON public.books;
DROP POLICY IF EXISTS "Meetings full access" ON public.meetings;
DROP POLICY IF EXISTS "Meeting comments full access" ON public.meeting_comments;
DROP POLICY IF EXISTS "Book ratings full access" ON public.book_ratings;
DROP POLICY IF EXISTS "Book progress full access" ON public.book_progress_logs;
DROP POLICY IF EXISTS "Presence readable by authenticated" ON public.user_presence;
DROP POLICY IF EXISTS "Presence upsert own" ON public.user_presence;

CREATE POLICY "Clubs insert via admins only" ON public.clubs
FOR INSERT
WITH CHECK (FALSE);

CREATE POLICY "Clubs update by admins" ON public.clubs
FOR UPDATE
USING (public.is_club_admin(id));

CREATE POLICY "Clubs delete by admins" ON public.clubs
FOR DELETE
USING (public.is_club_admin(id));

CREATE POLICY "Club members readable by related users" ON public.club_members
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.club_members cm
      WHERE cm.club_id = public.club_members.club_id
        AND cm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.clubs c
      WHERE c.id = public.club_members.club_id
        AND c.is_private = FALSE
    )
  )
);

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
      AND c.is_private = FALSE
  )
);

CREATE POLICY "Books scoped to club members" ON public.books
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = public.books.club_id
      AND cm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = public.books.club_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Meetings scoped to club members" ON public.meetings
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = public.meetings.club_id
      AND cm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = public.meetings.club_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Meeting comments scoped to club members" ON public.meeting_comments
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings m
    JOIN public.club_members cm ON cm.club_id = m.club_id
    WHERE m.id = public.meeting_comments.meeting_id
      AND cm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings m
    JOIN public.club_members cm ON cm.club_id = m.club_id
    WHERE m.id = public.meeting_comments.meeting_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Book ratings scoped to club members" ON public.book_ratings
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.books b
    JOIN public.club_members cm ON cm.club_id = b.club_id
    WHERE b.id = public.book_ratings.book_id
      AND cm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.books b
    JOIN public.club_members cm ON cm.club_id = b.club_id
    WHERE b.id = public.book_ratings.book_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Book progress scoped to club members" ON public.book_progress_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.books b
    JOIN public.club_members cm ON cm.club_id = b.club_id
    WHERE b.id = public.book_progress_logs.book_id
      AND cm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.books b
    JOIN public.club_members cm ON cm.club_id = b.club_id
    WHERE b.id = public.book_progress_logs.book_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Presence readable by shared club members" ON public.user_presence
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.club_members cm_self
    JOIN public.club_members cm_target ON cm_target.club_id = cm_self.club_id
    WHERE cm_self.user_id = auth.uid()
      AND cm_target.user_id = public.user_presence.user_id
  )
);

CREATE POLICY "Presence upsert own" ON public.user_presence
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for new governance tables
CREATE POLICY "Invites readable by club members" ON public.club_invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.club_members cm
    WHERE cm.club_id = public.club_invites.club_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Invites modifiable by admins" ON public.club_invites
FOR ALL
USING (public.is_club_admin(club_id))
WITH CHECK (public.is_club_admin(club_id));

CREATE POLICY "Join requests readable by requester or mods" ON public.club_join_requests
FOR SELECT
USING (
  requester_user_id = auth.uid()
  OR public.is_club_moderator_or_admin(club_id)
);

CREATE POLICY "Join requests create by requester" ON public.club_join_requests
FOR INSERT
WITH CHECK (requester_user_id = auth.uid());

CREATE POLICY "Join requests update by mods or requester" ON public.club_join_requests
FOR UPDATE
USING (
  requester_user_id = auth.uid()
  OR public.is_club_moderator_or_admin(club_id)
)
WITH CHECK (
  requester_user_id = auth.uid()
  OR public.is_club_moderator_or_admin(club_id)
);

-- Keep joins realtime-aware for pending request boards
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_join_requests;

GRANT EXECUTE ON FUNCTION public.create_club_with_admin(TEXT, BOOLEAN, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_club_invite(UUID, TIMESTAMPTZ, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_club_invite(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_club_invite(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_club_membership(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_club_join_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_club_member_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_club_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_club(UUID) TO authenticated;
