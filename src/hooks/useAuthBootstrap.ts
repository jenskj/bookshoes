import { supabase } from '@lib/supabase';
import { mapClubRow } from '@lib/mappers';
import { DEFAULT_USER_SETTINGS, sanitizeUserSettings } from '@lib/userSettings';
import { UserInfo, UserRole } from '@types';
import { useCallback, useEffect, useState } from 'react';
import { useCurrentUserStore } from './useCurrentUserStore';

type UserRow = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  photo_url?: string | null;
  active_club_id?: string | null;
  memberships?: string[] | null;
  preferences?: unknown;
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
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
  const setActiveClub = useCurrentUserStore((state) => state.setActiveClub);
  const setMembershipClubs = useCurrentUserStore(
    (state) => state.setMembershipClubs
  );
  const setMembershipRolesByClubId = useCurrentUserStore(
    (state) => state.setMembershipRolesByClubId
  );
  const setSettings = useCurrentUserStore((state) => state.setSettings);
  const setClubContextCollapsed = useCurrentUserStore(
    (state) => state.setClubContextCollapsed
  );

  const clearUserState = useCallback(() => {
    setCurrentUser(undefined);
    setActiveClub(undefined);
    setMembershipClubs([]);
    setMembershipRolesByClubId({});
    setSettings(DEFAULT_USER_SETTINGS);
    setClubContextCollapsed(DEFAULT_USER_SETTINGS.clubContext.defaultCollapsed);
  }, [
    setActiveClub,
    setClubContextCollapsed,
    setCurrentUser,
    setMembershipClubs,
    setMembershipRolesByClubId,
    setSettings,
  ]);

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

  const resolveMembershipRolesByClubId = useCallback(
    async (uid: string, membershipIds: string[]) => {
      if (!membershipIds.length) {
        setMembershipRolesByClubId({});
        return {};
      }

      const { data: rows } = (await supabase
        .from('club_members')
        .select('club_id, role')
        .eq('user_id', uid)
        .in('club_id', membershipIds)) as unknown as {
          data: Array<{ club_id: string | null; role: UserRole | null }> | null;
        };

      const rolesByClubId = (rows ?? []).reduce<Record<string, UserRole>>(
        (nextRoles, row) => {
          if (!row.club_id || !row.role) return nextRoles;
          nextRoles[row.club_id] = row.role;
          return nextRoles;
        },
        {}
      );

      setMembershipRolesByClubId(rolesByClubId);
      return rolesByClubId;
    },
    [setMembershipRolesByClubId]
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

      const settings = sanitizeUserSettings(userRow.preferences);
      setSettings(settings);
      setClubContextCollapsed(settings.clubContext.defaultCollapsed);

      const membershipsFromUser = (userRow.memberships ?? []) as string[];
      const resolvedMemberships = await resolveMembershipIds(uid, membershipsFromUser);
      const membershipClubs = await resolveMembershipClubs(resolvedMemberships);
      await resolveMembershipRolesByClubId(uid, resolvedMemberships);
      const activeClubFromProfile =
        settings.clubContext.autoSelectLastActiveClub
          ? ((userRow.active_club_id ?? undefined) || undefined)
          : undefined;

      const nextUserInfo: UserInfo = {
        uid,
        email: userRow.email ?? session.user.email ?? '',
        displayName: userRow.display_name ?? getSessionDisplayName(session.user),
        photoURL: userRow.photo_url ?? getSessionPhoto(session.user),
        activeClub: activeClubFromProfile,
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
      resolveMembershipRolesByClubId,
      resolveMembershipIds,
      setActiveClub,
      setClubContextCollapsed,
      setCurrentUser,
      setSettings,
    ]
  );

  useEffect(() => {
    let cancelled = false;
    let bootstrapResolved = false;

    const markReady = () => {
      if (cancelled) return;
      setAuthReady(true);
      setUserLoadedFromSession(true);
    };

    // Safety net: avoid permanent loading state if auth/session fetch stalls.
    const fallback = setTimeout(() => {
      if (bootstrapResolved || cancelled) return;
      markReady();
    }, 6000);

    const hydrateAndMarkReady = async (
      session: Parameters<typeof hydrateUserFromSession>[0]
    ) => {
      try {
        await hydrateUserFromSession(session);
        if (!cancelled) {
          setAuthReady(true);
        }
      } catch {
        if (!cancelled) {
          clearUserState();
          markReady();
        }
      } finally {
        bootstrapResolved = true;
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT') {
        clearUserState();
        markReady();
        bootstrapResolved = true;
        return;
      }

      // Avoid async Supabase calls directly inside auth callback to prevent deadlocks.
      setTimeout(() => {
        if (cancelled) return;
        void hydrateAndMarkReady(
          session as Parameters<typeof hydrateUserFromSession>[0]
        );
      }, 0);
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
        await hydrateAndMarkReady(
          session as Parameters<typeof hydrateUserFromSession>[0]
        );
      })
      .catch(() => {
        if (cancelled) return;
        clearUserState();
        markReady();
      })
      .finally(() => {
        bootstrapResolved = true;
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
