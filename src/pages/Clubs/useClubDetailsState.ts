import { useCurrentUserStore } from '@hooks';
import { getEffectiveClubJoinMode } from '@lib/clubSettings';
import { fetchClubMembersWithProfiles } from '@lib/clubMembers';
import {
  getClubPermissionSnapshot,
} from '@lib/clubPermissions';
import {
  mapClubInviteRow,
  mapClubJoinRequestRow,
  mapClubRow,
} from '@lib/mappers';
import { supabase } from '@lib/supabase';
import { useToast } from '@lib/ToastContext';
import {
  Club,
  ClubInfo,
  ClubInvite,
  ClubJoinRequest,
  Member,
  UserRole,
} from '@types';
import {
  acceptClubInvite,
  addNewClubMember,
  createClubInvite,
  leaveClub,
  removeClubMember,
  requestClubJoin,
  reviewClubJoinRequest,
  revokeClubInvite,
  toErrorMessage,
  updateClubMemberRole,
  updateClubProfile,
} from '@utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const defaultClubForm: ClubInfo = {
  name: '',
  isPrivate: false,
  tagline: '',
  description: '',
};

export const toInviteUrl = (clubId: string, inviteCode: string) => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const originPath = `${window.location.origin}${basePath}`;
  return `${originPath}/clubs/${clubId}?invite=${inviteCode}`;
};

export const useClubDetailsState = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useToast();
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const activeClub = useCurrentUserStore((state) => state.activeClub);
  const membershipClubs = useCurrentUserStore(
    (state) => state.membershipClubs ?? []
  );
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
  const setActiveClub = useCurrentUserStore((state) => state.setActiveClub);
  const setMembershipClubs = useCurrentUserStore(
    (state) => state.setMembershipClubs
  );
  const setMembershipRoleForClub = useCurrentUserStore(
    (state) => state.setMembershipRoleForClub
  );
  const clearMembershipRoleForClub = useCurrentUserStore(
    (state) => state.clearMembershipRoleForClub
  );

  const [club, setClub] = useState<Club>();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<ClubInvite[]>([]);
  const [joinRequests, setJoinRequests] = useState<ClubJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState<ClubInfo>(defaultClubForm);
  const [joinMessage, setJoinMessage] = useState('');
  const [inviteMaxUses, setInviteMaxUses] = useState('');
  const [inviteExpiresInDays, setInviteExpiresInDays] = useState('7');

  const inviteCode = searchParams.get('invite');
  const inviteAttemptRef = useRef<string | null>(null);
  const userId = currentUser?.docId ?? null;

  const currentMember = useMemo(
    () => members.find((member) => member.data.uid === userId),
    [members, userId]
  );

  const permissions = useMemo(
    () => getClubPermissionSnapshot(currentMember?.data.role, Boolean(currentMember)),
    [currentMember]
  );
  const effectiveJoinMode = useMemo(() => {
    return getEffectiveClubJoinMode(
      club?.data.isPrivate ?? false,
      club?.data.settings?.access.joinMode
    );
  }, [club?.data.isPrivate, club?.data.settings?.access.joinMode]);
  const canDirectJoin = !permissions.isMember && effectiveJoinMode === 'public_direct';
  const canRequestJoin = !permissions.isMember && effectiveJoinMode === 'invite_or_request';

  const pendingRequests = useMemo(
    () => joinRequests.filter((request) => request.data.status === 'pending'),
    [joinRequests]
  );

  const latestOwnRequest = useMemo(() => {
    if (!userId) return undefined;
    return joinRequests.find((request) => request.data.requesterUserId === userId);
  }, [joinRequests, userId]);

  const syncLocalMembershipAdd = useCallback(
    (clubToAdd: Club | undefined, role: UserRole = 'standard') => {
      if (!clubToAdd) return;

      if (currentUser) {
        const nextMemberships = new Set(currentUser.data.memberships ?? []);
        nextMemberships.add(clubToAdd.docId);
        setCurrentUser({
          ...currentUser,
          data: {
            ...currentUser.data,
            memberships: Array.from(nextMemberships),
            activeClub: currentUser.data.activeClub ?? clubToAdd.docId,
          },
        });
      }

      if (!membershipClubs.some((existing) => existing.docId === clubToAdd.docId)) {
        setMembershipClubs([...membershipClubs, clubToAdd]);
      }
      setMembershipRoleForClub(clubToAdd.docId, role);

      if (!activeClub) {
        setActiveClub(clubToAdd);
      }
    },
    [
      activeClub,
      currentUser,
      membershipClubs,
      setActiveClub,
      setCurrentUser,
      setMembershipClubs,
      setMembershipRoleForClub,
    ]
  );

  const syncLocalMembershipRemove = useCallback(() => {
    if (!id) return;

    const nextMembershipClubs = membershipClubs.filter((entry) => entry.docId !== id);
    setMembershipClubs(nextMembershipClubs);
    clearMembershipRoleForClub(id);

    if (currentUser) {
      const nextMemberships = (currentUser.data.memberships ?? []).filter(
        (clubId) => clubId !== id
      );
      setCurrentUser({
        ...currentUser,
        data: {
          ...currentUser.data,
          memberships: nextMemberships,
          activeClub:
            currentUser.data.activeClub === id
              ? nextMemberships[0]
              : currentUser.data.activeClub,
        },
      });
    }

    if (activeClub?.docId === id) {
      const fallbackClub = nextMembershipClubs[0];
      setActiveClub(fallbackClub);
    }
  }, [
    activeClub?.docId,
    clearMembershipRoleForClub,
    currentUser,
    id,
    membershipClubs,
    setActiveClub,
    setCurrentUser,
    setMembershipClubs,
  ]);

  const updateClubState = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data: clubRow, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();
      if (clubError) throw clubError;
      if (!clubRow) return;

      const mappedClub = mapClubRow(clubRow as unknown as Record<string, unknown>);
      setClub(mappedClub);

      const mappedMembers: Member[] = await fetchClubMembersWithProfiles(id);
      setMembers(mappedMembers);

      const selfMember = mappedMembers.find((member) => member.data.uid === userId);
      if (selfMember) {
        setMembershipRoleForClub(id, selfMember.data.role);
      } else {
        clearMembershipRoleForClub(id);
      }

      const { data: inviteRows } = await supabase
        .from('club_invites')
        .select('*')
        .eq('club_id', id)
        .order('created_at', { ascending: false });
      setInvites(
        (inviteRows ?? []).map((row) => mapClubInviteRow(row as unknown as Record<string, unknown>))
      );

      const { data: joinRequestRows } = await supabase
        .from('club_join_requests')
        .select('*')
        .eq('club_id', id)
        .order('created_at', { ascending: false });

      const requesterIds = Array.from(
        new Set(
          (joinRequestRows ?? [])
            .map((row) => row.requester_user_id as string)
            .filter(Boolean)
        )
      );

      const requesterMap = new Map<string, Record<string, unknown>>();
      if (requesterIds.length) {
        const { data: requesterRows } = await supabase
          .from('users')
          .select('id, display_name, photo_url')
          .in('id', requesterIds);
        (requesterRows ?? []).forEach((user) => {
          requesterMap.set(user.id, user as unknown as Record<string, unknown>);
        });
      }

      setJoinRequests(
        (joinRequestRows ?? []).map((row) =>
          mapClubJoinRequestRow(
            row as unknown as Record<string, unknown>,
            requesterMap.get(row.requester_user_id as string)
          )
        )
      );
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [clearMembershipRoleForClub, id, setMembershipRoleForClub, showError, userId]);

  useEffect(() => {
    if (!id) return;
    void updateClubState();
  }, [id, updateClubState]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`club-details-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clubs', filter: `id=eq.${id}` }, () => {
        void updateClubState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'club_members', filter: `club_id=eq.${id}` }, () => {
        void updateClubState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'club_invites', filter: `club_id=eq.${id}` }, () => {
        void updateClubState();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'club_join_requests', filter: `club_id=eq.${id}` }, () => {
        void updateClubState();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, updateClubState]);

  useEffect(() => {
    if (!club?.data) return;
    setProfileDraft({
      name: club.data.name,
      isPrivate: club.data.isPrivate,
      tagline: club.data.tagline ?? '',
      description: club.data.description ?? '',
    });
  }, [club]);

  useEffect(() => {
    if (!inviteCode || !id || !userId || permissions.isMember) {
      return;
    }

    if (inviteAttemptRef.current === inviteCode) {
      return;
    }

    inviteAttemptRef.current = inviteCode;
    setBusyAction('accept-invite');

    void acceptClubInvite(inviteCode)
      .then((joinedClubId) => {
        if (joinedClubId === id) {
          syncLocalMembershipAdd(club, 'standard');
          showSuccess('Invite accepted. You joined the club.');
        }
      })
      .catch((error) => {
        showError(toErrorMessage(error));
      })
      .finally(() => {
        setBusyAction(null);
        void updateClubState();
      });
  }, [club, id, inviteCode, permissions.isMember, showError, showSuccess, syncLocalMembershipAdd, updateClubState, userId]);

  const onJoinClub = async () => {
    if (!id || !club) return;
    if (effectiveJoinMode !== 'public_direct') {
      showError('This club cannot be joined directly. Use an invite link.');
      return;
    }

    try {
      setBusyAction('join');
      await addNewClubMember(id);
      syncLocalMembershipAdd(club, 'standard');
      showSuccess('Joined club');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onLeaveClub = async () => {
    if (!id) return;

    try {
      setBusyAction('leave');
      await leaveClub(id);
      syncLocalMembershipRemove();
      showSuccess('Left club');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onRequestJoin = async () => {
    if (!id) return;
    if (effectiveJoinMode !== 'invite_or_request') {
      showError('This club is invite-only. Use an invite link to join.');
      return;
    }

    try {
      setBusyAction('request-join');
      await requestClubJoin(id, joinMessage);
      showSuccess('Join request submitted');
      setJoinMessage('');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onSaveProfile = async () => {
    if (!id) return;

    try {
      setBusyAction('save-profile');
      await updateClubProfile(id, {
        name: profileDraft.name,
        isPrivate: profileDraft.isPrivate,
        tagline: profileDraft.tagline,
        description: profileDraft.description,
      });
      showSuccess('Club profile updated');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onCreateInvite = async () => {
    if (!id) return;

    const maxUses = inviteMaxUses.trim() ? Number(inviteMaxUses) : null;
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
      showError('Max uses must be a positive integer.');
      return;
    }

    const expiresDays = inviteExpiresInDays.trim()
      ? Number(inviteExpiresInDays)
      : null;
    if (expiresDays !== null && (!Number.isInteger(expiresDays) || expiresDays < 1)) {
      showError('Expiry days must be a positive integer.');
      return;
    }

    const expiresAt =
      expiresDays === null
        ? null
        : new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    try {
      setBusyAction('create-invite');
      await createClubInvite(id, {
        maxUses,
        expiresAt,
      });
      showSuccess('Invite created');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onRevokeInvite = async (inviteId: string) => {
    if (!id) return;
    try {
      setBusyAction(`revoke-${inviteId}`);
      await revokeClubInvite(id, inviteId);
      showSuccess('Invite revoked');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onCopyInvite = async (invite: ClubInvite) => {
    if (!id) return;
    const url = toInviteUrl(id, invite.data.inviteCode);
    try {
      await navigator.clipboard.writeText(url);
      showSuccess('Invite link copied');
    } catch {
      showSuccess(`Invite code: ${invite.data.inviteCode}`);
    }
  };

  const onReviewRequest = async (
    requestId: string,
    decision: 'approved' | 'denied'
  ) => {
    try {
      setBusyAction(`review-${requestId}-${decision}`);
      await reviewClubJoinRequest(requestId, decision);
      showSuccess(
        decision === 'approved'
          ? 'Join request approved'
          : 'Join request denied'
      );
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onChangeMemberRole = async (memberId: string, nextRole: UserRole) => {
    if (!id) return;

    try {
      setBusyAction(`role-${memberId}`);
      await updateClubMemberRole(id, memberId, nextRole);
      showSuccess('Member role updated');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  const onRemoveMember = async (memberId: string) => {
    if (!id) return;
    if (!window.confirm('Remove this member from the club?')) {
      return;
    }

    try {
      setBusyAction(`remove-${memberId}`);
      await removeClubMember(id, memberId);
      showSuccess('Member removed');
      await updateClubState();
    } catch (error) {
      showError(toErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  };

  return {
    id,
    club,
    members,
    invites,
    joinRequests,
    loading,
    busyAction,
    profileDraft,
    joinMessage,
    inviteMaxUses,
    inviteExpiresInDays,
    pendingRequests,
    latestOwnRequest,
    effectiveJoinMode,
    canDirectJoin,
    canRequestJoin,
    permissions,
    userId,
    setProfileDraft,
    setJoinMessage,
    setInviteMaxUses,
    setInviteExpiresInDays,
    onJoinClub,
    onLeaveClub,
    onRequestJoin,
    onSaveProfile,
    onCreateInvite,
    onRevokeInvite,
    onCopyInvite,
    onReviewRequest,
    onChangeMemberRole,
    onRemoveMember,
  };
};
