import { supabase } from '@lib/supabase';
import { mapMeetingRow } from '@lib/mappers';
import { useCallback } from 'react';
import { useMeetingStore } from './useMeetingStore';
import { useClubRealtimeCollection } from './useClubRealtimeCollection';

/** Fetches club meetings and subscribes to realtime updates. Updates useMeetingStore. */
export function useClubMeetings(clubId: string | undefined) {
  const setMeetings = useMeetingStore((s) => s.setMeetings);
  const upsertMeeting = useMeetingStore((s) => s.upsertMeeting);
  const removeMeeting = useMeetingStore((s) => s.removeMeeting);
  const onDisabled = useCallback(() => {
    setMeetings([]);
  }, [setMeetings]);
  const fetchInitial = useCallback(async () => {
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('club_id', clubId as string);
    setMeetings((data ?? []).map(mapMeetingRow));
  }, [clubId, setMeetings]);
  const onDelete = useCallback((row: Record<string, unknown>) => {
    removeMeeting(row.id as string);
  }, [removeMeeting]);
  const onUpsert = useCallback((row: Record<string, unknown>) => {
    upsertMeeting(mapMeetingRow(row));
  }, [upsertMeeting]);

  useClubRealtimeCollection({
    clubId,
    table: 'meetings',
    channelKey: 'club-meetings',
    onDisabled,
    fetchInitial,
    onDelete,
    onUpsert,
  });
}
