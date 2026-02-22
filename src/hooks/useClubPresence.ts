import { supabase } from '@lib/supabase';
import type { Member } from '@types';
import { useEffect, useMemo } from 'react';
import { useCurrentUserStore } from './useCurrentUserStore';

const ONLINE_THRESHOLD_MS = 60_000;
const EMPTY_MEMBERS: Member[] = [];

const toPresence = (lastOnlineAt: string) => {
  const lastOnlineDate = new Date(lastOnlineAt);
  const isOnline = Date.now() - lastOnlineDate.getTime() < ONLINE_THRESHOLD_MS;
  return {
    lastOnlineAt,
    isOnline,
  };
};

export const useClubPresence = (clubId: string | undefined) => {
  const members = useCurrentUserStore((state) => state.members);
  const setPresenceByUserId = useCurrentUserStore((state) => state.setPresenceByUserId);
  const upsertPresence = useCurrentUserStore((state) => state.upsertPresence);
  const removePresence = useCurrentUserStore((state) => state.removePresence);

  const memberUserIds = useMemo(
    () =>
      (members ?? EMPTY_MEMBERS)
        .map((member) => member.data.uid)
        .filter((userId): userId is string => Boolean(userId)),
    [members]
  );

  useEffect(() => {
    if (!clubId || memberUserIds.length === 0) {
      setPresenceByUserId({});
      return;
    }

    const fetchInitialPresence = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('user_id, last_online_at')
        .in('user_id', memberUserIds);

      const nextPresence = (data ?? []).reduce<Record<string, { lastOnlineAt: string; isOnline: boolean }>>(
        (acc, row) => {
          if (!row.user_id || !row.last_online_at) return acc;
          acc[row.user_id] = toPresence(row.last_online_at);
          return acc;
        },
        {}
      );

      setPresenceByUserId(nextPresence);
    };

    const filter = `user_id=in.(${memberUserIds.join(',')})`;
    const channel = supabase
      .channel(`club-presence-${clubId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter,
        },
        (payload) => {
          const eventType = payload.eventType;
          if (eventType === 'DELETE') {
            const removedUserId = (payload.old as Record<string, unknown>)
              ?.user_id as string | undefined;
            if (removedUserId) {
              removePresence(removedUserId);
            }
            return;
          }

          const nextRow = payload.new as Record<string, unknown>;
          const nextUserId = nextRow?.user_id as string | undefined;
          const lastOnlineAt = nextRow?.last_online_at as string | undefined;
          if (!nextUserId || !lastOnlineAt) return;

          upsertPresence(nextUserId, toPresence(lastOnlineAt));
        }
      )
      .subscribe();

    void fetchInitialPresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, memberUserIds, removePresence, setPresenceByUserId, upsertPresence]);
};
