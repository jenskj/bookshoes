import { supabase } from '@lib/supabase';
import { mapMemberRow } from '@lib/mappers';
import type { Member } from '@types';
import { useEffect } from 'react';
import { useCurrentUserStore } from './useCurrentUserStore';

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

  useEffect(() => {
    if (!clubId) {
      setMembers([]);
      return;
    }

    const fetchInitial = async () => {
      const { data: membersData } = await supabase
        .from('club_members')
        .select('*')
        .eq('club_id', clubId);
      const membersList = membersData ?? [];
      if (membersList.length === 0) {
        setMembers([]);
        return;
      }
      const userIds = membersList.map((m: Record<string, unknown>) => m.user_id as string);
      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name, photo_url')
        .in('id', userIds);
      const usersMap = new Map((usersData ?? []).map((u: Record<string, unknown>) => [u.id, u]));
      const members: Member[] = membersList.map((m: Record<string, unknown>) => {
        const u = usersMap.get(m.user_id as string) ?? {};
        return mapMemberRow(m, { user_id: m.user_id, display_name: u.display_name, photo_url: u.photo_url });
      });
      setMembers(members);

      if (currentUserId) {
        const currentMember = members.find((member) => member.data.uid === currentUserId);
        if (currentMember) {
          setMembershipRoleForClub(clubId, currentMember.data.role);
        } else {
          clearMembershipRoleForClub(clubId);
        }
      }
    };

    const mapMemberRealtimeRow = async (row: Record<string, unknown>) => {
      const userId = row.user_id as string | undefined;
      if (!row.id || !userId) return undefined;

      const { data: user } = await supabase
        .from('users')
        .select('display_name, photo_url')
        .eq('id', userId)
        .maybeSingle();

      return mapMemberRow(row, {
        user_id: userId,
        display_name: user?.display_name,
        photo_url: user?.photo_url,
      });
    };

    const handleRealtimeChange = async (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) => {
      if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id as string | undefined;
        const deletedUserId = payload.old?.user_id as string | undefined;
        if (!deletedId) {
          await fetchInitial();
          return;
        }
        removeMember(deletedId);
        if (deletedUserId && currentUserId && deletedUserId === currentUserId) {
          clearMembershipRoleForClub(clubId);
        }
        return;
      }

      const mappedMember = await mapMemberRealtimeRow(payload.new);
      if (!mappedMember) {
        await fetchInitial();
        return;
      }
      upsertMember(mappedMember);
      if (currentUserId && mappedMember.data.uid === currentUserId) {
        setMembershipRoleForClub(clubId, mappedMember.data.role);
      }
    };

    const channel = supabase
      .channel(`club-members-${clubId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_members', filter: `club_id=eq.${clubId}` },
        (payload) => {
          void handleRealtimeChange(payload as Parameters<typeof handleRealtimeChange>[0]);
        }
      )
      .subscribe();

    void fetchInitial();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    clearMembershipRoleForClub,
    clubId,
    currentUserId,
    removeMember,
    setMembers,
    setMembershipRoleForClub,
    upsertMember,
  ]);
}
