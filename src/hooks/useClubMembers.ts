import {
  fetchClubMembersWithProfiles,
  mapClubMemberRowWithProfile,
} from '@lib/clubMembers';
import { useCallback } from 'react';
import { useCurrentUserStore } from './useCurrentUserStore';
import { useClubRealtimeCollection } from './useClubRealtimeCollection';

/** Fetches club members and subscribes to realtime updates. Updates useCurrentUserStore members. */
export function useClubMembers(clubId: string | undefined) {
  const currentUserId = useCurrentUserStore((state) => state.currentUser?.docId);
  const setMembers = useCurrentUserStore((s) => s.setMembers);
  const upsertMember = useCurrentUserStore((s) => s.upsertMember);
  const removeMember = useCurrentUserStore((s) => s.removeMember);
  const setMembershipRoleForClub = useCurrentUserStore(
    (state) => state.setMembershipRoleForClub
  );
  const clearMembershipRoleForClub = useCurrentUserStore(
    (state) => state.clearMembershipRoleForClub
  );

  const syncCurrentUserRole = useCallback(
    (members: Array<{ data: { uid?: string; role: string } }>) => {
      if (!clubId || !currentUserId) return;
      const currentMember = members.find((member) => member.data.uid === currentUserId);
      if (!currentMember) {
        clearMembershipRoleForClub(clubId);
        return;
      }
      setMembershipRoleForClub(
        clubId,
        currentMember.data.role as Parameters<typeof setMembershipRoleForClub>[1]
      );
    },
    [clearMembershipRoleForClub, clubId, currentUserId, setMembershipRoleForClub]
  );
  const onDisabled = useCallback(() => {
    setMembers([]);
  }, [setMembers]);
  const fetchInitial = useCallback(async () => {
    const members = await fetchClubMembersWithProfiles(clubId as string);
    setMembers(members);
    syncCurrentUserRole(members);
  }, [clubId, setMembers, syncCurrentUserRole]);
  const onDelete = useCallback((row: Record<string, unknown>) => {
    const deletedId = row.id as string;
    const deletedUserId = row.user_id as string | undefined;
    removeMember(deletedId);
    if (clubId && deletedUserId && currentUserId && deletedUserId === currentUserId) {
      clearMembershipRoleForClub(clubId);
    }
  }, [clearMembershipRoleForClub, clubId, currentUserId, removeMember]);
  const onUpsert = useCallback(async (row: Record<string, unknown>) => {
    const mappedMember = await mapClubMemberRowWithProfile(row);
    if (!mappedMember) {
      const members = await fetchClubMembersWithProfiles(clubId as string);
      setMembers(members);
      syncCurrentUserRole(members);
      return;
    }
    upsertMember(mappedMember);
    if (clubId && currentUserId && mappedMember.data.uid === currentUserId) {
      setMembershipRoleForClub(clubId, mappedMember.data.role);
    }
  }, [
    clubId,
    currentUserId,
    setMembers,
    syncCurrentUserRole,
    upsertMember,
    setMembershipRoleForClub,
  ]);

  useClubRealtimeCollection({
    clubId,
    table: 'club_members',
    channelKey: 'club-members',
    onDisabled,
    fetchInitial,
    onDelete,
    onUpsert,
  });
}
