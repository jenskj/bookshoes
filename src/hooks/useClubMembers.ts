import { supabase } from '@lib/supabase';
import { mapMemberRow } from '@lib/mappers';
import type { Member } from '@types';
import { useEffect } from 'react';
import { useCurrentUserStore } from './useCurrentUserStore';

/** Fetches club members and subscribes to realtime updates. Updates useCurrentUserStore members. */
export function useClubMembers(clubId: string | undefined) {
  const setMembers = useCurrentUserStore((s) => s.setMembers);

  useEffect(() => {
    if (!clubId) {
      setMembers([]);
      return;
    }

    const refetch = async () => {
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
    };

    const channel = supabase
      .channel(`club-members-${clubId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'club_members', filter: `club_id=eq.${clubId}` },
        refetch
      )
      .subscribe();

    refetch();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, setMembers]);
}
