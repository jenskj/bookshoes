import { supabase } from '@lib/supabase';
import { mapClubRow } from '@lib/mappers';
import { UserInfo } from '@types';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentUserStore } from './useCurrentUserStore';

type UserRow = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  photo_url?: string | null;
  active_club_id?: string | null;
  memberships?: string[] | null;
};

const getSessionDisplayName = (sessionUser: {
  user_metadata?: { full_name?: string };
  email?: string;
}) => {
  return (
    sessionUser.user_metadata?.full_name ||
    sessionUser.email ||
    'Bookshoes Reader'
  );
};

const getSessionPhoto = (sessionUser: {
  user_metadata?: { avatar_url?: string };
}) => {
  return sessionUser.user_metadata?.avatar_url || '';
};

export const useAuthBootstrap = () => {
  const [authReady, setAuthReady] = useState(false);
  const [userLoadedFromSession, setUserLoadedFromSession] = useState(false);
  const {
    setCurrentUser,
    setActiveClub,
    setMembershipClubs,
  } = useCurrentUserStore();

  const clearUserState = useCallback(() => {
    setCurrentUser(undefined);
    setActiveClub(undefined);
    setMembershipClubs([]);
  }, [setActiveClub, setCurrentUser, setMembershipClubs]);

  const resolveMembershipIds = useCallback(
    async (uid: string, membershipsFromUser: string[]) => {
      if (membershipsFromUser.length > 0) return membershipsFromUser;
      const { data: rows } = (await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', uid)) as unknown as {
        data: Array<{ club_id: string | null }> | null;
      };
      return (rows ?? [])
        .map((row) => row.club_id as string)
        .filter(Boolean);
    },
    []
  );

  const resolveMembershipClubs = useCallback(
    async (membershipIds: string[]) => {
      if (!membershipIds.length) {
        setMembershipClubs([]);
        return [];
      }
      const { data: clubs } = (await supabase
        .from('clubs')
        .select('*')
        .in('id', membershipIds)) as unknown as {
        data: Array<Record<string, unknown>> | null;
      };
      const mapped = (clubs ?? []).map((club) => mapClubRow(club));
      setMembershipClubs(mapped);
      return mapped;
    },
    [setMembershipClubs]
  );

  const hydrateUserFromSession = useCallback(
    async (session: { user?: { id: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } } | null) => {
      if (!session?.user) {
        clearUserState();
        setUserLoadedFromSession(true);
        return;
      }

      const uid = session.user.id;
      let userRow: UserRow | null = null;

      const { data: existingUser } = (await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .maybeSingle()) as unknown as {
        data: UserRow | null;
      };

      if (!existingUser) {
        const inserted: UserRow = {
          id: uid,
          email: session.user.email ?? '',
          display_name: getSessionDisplayName(session.user),
          photo_url: getSessionPhoto(session.user),
          memberships: [],
          active_club_id: null,
        };
        const usersTable = supabase.from('users') as unknown as {
          insert: (payload: UserRow) => Promise<unknown>;
        };
        await usersTable.insert({
          id: inserted.id,
          email: inserted.email,
          display_name: inserted.display_name,
          photo_url: inserted.photo_url,
          memberships: inserted.memberships,
          active_club_id: inserted.active_club_id,
        });
        userRow = inserted;
      } else {
        userRow = existingUser as UserRow;
      }

      const membershipsFromUser = (userRow.memberships ?? []) as string[];
      const resolvedMemberships = await resolveMembershipIds(uid, membershipsFromUser);
      const membershipClubs = await resolveMembershipClubs(resolvedMemberships);

      const nextUserInfo: UserInfo = {
        uid,
        email: userRow.email ?? session.user.email ?? '',
        displayName: userRow.display_name ?? getSessionDisplayName(session.user),
        photoURL: userRow.photo_url ?? getSessionPhoto(session.user),
        activeClub: (userRow.active_club_id ?? undefined) || undefined,
        memberships: resolvedMemberships,
      };

      setCurrentUser({
        docId: uid,
        data: nextUserInfo,
      });

      const activeClubId = nextUserInfo.activeClub;
      if (!activeClubId) {
        setActiveClub(undefined);
      } else {
        const cached = membershipClubs.find((club) => club.docId === activeClubId);
        if (cached) {
          setActiveClub(cached);
        } else {
          const { data: activeClub } = (await supabase
            .from('clubs')
            .select('*')
            .eq('id', activeClubId)
            .maybeSingle()) as unknown as {
              data: Record<string, unknown> | null;
            };
          setActiveClub(activeClub ? mapClubRow(activeClub) : undefined);
        }
      }

      setUserLoadedFromSession(true);
    },
    [
      clearUserState,
      resolveMembershipClubs,
      resolveMembershipIds,
      setActiveClub,
      setCurrentUser,
    ]
  );

  useEffect(() => {
    let cancelled = false;
    const fallback = setTimeout(() => {
      if (!cancelled) {
        setAuthReady(true);
        setUserLoadedFromSession(true);
      }
    }, 2500);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        clearUserState();
        setAuthReady(true);
        setUserLoadedFromSession(true);
        return;
      }
      await hydrateUserFromSession(session as Parameters<typeof hydrateUserFromSession>[0]);
      setAuthReady(true);
    });

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (cancelled) return;
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          );
        }
        await hydrateUserFromSession(session as Parameters<typeof hydrateUserFromSession>[0]);
        setAuthReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearUserState();
        setAuthReady(true);
        setUserLoadedFromSession(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, [clearUserState, hydrateUserFromSession]);

  return {
    authReady,
    userLoadedFromSession,
  };
};
