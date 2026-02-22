import { supabase } from '@lib/supabase';
import type { Database } from '@lib/database.types';
import { useEffect } from 'react';

type CollectionTable = keyof Database['public']['Tables'];

type RealtimePayload<TRow extends Record<string, unknown>> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: TRow;
  old: TRow;
};

interface UseClubRealtimeCollectionOptions<TRow extends Record<string, unknown>> {
  clubId: string | undefined;
  table: CollectionTable;
  channelKey: string;
  filter?: string;
  enabled?: boolean;
  requireRowId?: boolean;
  onDisabled: () => void;
  fetchInitial: () => Promise<void>;
  onDelete: (row: TRow) => Promise<void> | void;
  onUpsert: (row: TRow) => Promise<void> | void;
}

const hasRowId = (row: Record<string, unknown> | undefined): row is Record<'id', string> => {
  return typeof row?.id === 'string' && row.id.length > 0;
};

export function useClubRealtimeCollection<TRow extends Record<string, unknown>>({
  clubId,
  table,
  channelKey,
  filter,
  enabled = true,
  requireRowId = true,
  onDisabled,
  fetchInitial,
  onDelete,
  onUpsert,
}: UseClubRealtimeCollectionOptions<TRow>) {
  useEffect(() => {
    if (!clubId || !enabled) {
      onDisabled();
      return;
    }

    const realtimeFilter = filter ?? `club_id=eq.${clubId}`;

    const handleRealtimeChange = async (payload: RealtimePayload<TRow>) => {
      if (payload.eventType === 'DELETE') {
        const previousRow = payload.old;
        if (requireRowId && !hasRowId(previousRow)) {
          await fetchInitial();
          return;
        }
        await onDelete(previousRow);
        return;
      }

      const nextRow = payload.new;
      if (requireRowId && !hasRowId(nextRow)) {
        await fetchInitial();
        return;
      }
      await onUpsert(nextRow);
    };

    const channel = supabase
      .channel(`${channelKey}-${clubId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: realtimeFilter,
        },
        (payload) => {
          void handleRealtimeChange(
            payload as Parameters<typeof handleRealtimeChange>[0]
          );
        }
      )
      .subscribe();

    void fetchInitial();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    channelKey,
    clubId,
    enabled,
    fetchInitial,
    filter,
    onDelete,
    onDisabled,
    onUpsert,
    requireRowId,
    table,
  ]);
}
