import { supabase } from '@lib/supabase';
import type { Member } from '@types';
import { useCallback, useMemo } from 'react';
import { useCurrentUserStore } from './useCurrentUserStore';
import { useClubRealtimeCollection } from './useClubRealtimeCollection';

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
  const presenceFilter = useMemo(() => {
    return `user_id=in.(${memberUserIds.join(',')})`;
  }, [memberUserIds]);
  const onDisabled = useCallback(() => {
    setPresenceByUserId({});
  }, [setPresenceByUserId]);
  const fetchInitial = useCallback(async () => {
    const { data } = await supabase
      .from('user_presence')
      .select('user_id, last_online_at')
      .in('user_id', memberUserIds);

    const nextPresence = (
      data ?? []
    ).reduce<Record<string, { lastOnlineAt: string; isOnline: boolean }>>(
      (acc, row) => {
        if (!row.user_id || !row.last_online_at) return acc;
        acc[row.user_id] = toPresence(row.last_online_at);
        return acc;
      },
      {}
    );

    setPresenceByUserId(nextPresence);
  }, [memberUserIds, setPresenceByUserId]);
  const onDelete = useCallback((row: Record<string, unknown>) => {
    const removedUserId = row.user_id as string | undefined;
    if (removedUserId) {
      removePresence(removedUserId);
    }
  }, [removePresence]);
  const onUpsert = useCallback((row: Record<string, unknown>) => {
    const nextUserId = row.user_id as string | undefined;
    const lastOnlineAt = row.last_online_at as string | undefined;
    if (!nextUserId || !lastOnlineAt) return;
    upsertPresence(nextUserId, toPresence(lastOnlineAt));
  }, [upsertPresence]);

  useClubRealtimeCollection({
    clubId,
    table: 'user_presence',
    channelKey: 'club-presence',
    filter: presenceFilter,
    enabled: memberUserIds.length > 0,
    requireRowId: false,
    onDisabled,
    fetchInitial,
    onDelete,
    onUpsert,
  });
};
