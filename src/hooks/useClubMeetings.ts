import { supabase } from '@lib/supabase';
import { mapMeetingRow } from '@lib/mappers';
import { useEffect } from 'react';
import { useMeetingStore } from './useMeetingStore';

/** Fetches club meetings and subscribes to realtime updates. Updates useMeetingStore. */
export function useClubMeetings(clubId: string | undefined) {
  const setMeetings = useMeetingStore((s) => s.setMeetings);
  const upsertMeeting = useMeetingStore((s) => s.upsertMeeting);
  const removeMeeting = useMeetingStore((s) => s.removeMeeting);

  useEffect(() => {
    if (!clubId) {
      setMeetings([]);
      return;
    }

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('meetings')
        .select('*')
        .eq('club_id', clubId);
      setMeetings((data ?? []).map(mapMeetingRow));
    };

    const handleRealtimeChange = async (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new: Record<string, unknown>;
      old: Record<string, unknown>;
    }) => {
      if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id as string | undefined;
        if (!deletedId) {
          await fetchInitial();
          return;
        }
        removeMeeting(deletedId);
        return;
      }

      const nextRow = payload.new;
      if (!nextRow?.id) {
        await fetchInitial();
        return;
      }
      upsertMeeting(mapMeetingRow(nextRow));
    };

    const channel = supabase
      .channel(`club-meetings-${clubId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meetings', filter: `club_id=eq.${clubId}` },
        (payload) => {
          void handleRealtimeChange(payload as Parameters<typeof handleRealtimeChange>[0]);
        }
      )
      .subscribe();

    void fetchInitial();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, removeMeeting, setMeetings, upsertMeeting]);
}
