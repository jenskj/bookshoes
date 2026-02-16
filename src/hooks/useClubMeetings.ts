import { supabase } from '@lib/supabase';
import { mapMeetingRow } from '@lib/mappers';
import { useEffect } from 'react';
import { useMeetingStore } from './useMeetingStore';

/** Fetches club meetings and subscribes to realtime updates. Updates useMeetingStore. */
export function useClubMeetings(clubId: string | undefined) {
  const setMeetings = useMeetingStore((s) => s.setMeetings);

  useEffect(() => {
    if (!clubId) {
      setMeetings([]);
      return;
    }

    const refetch = () => {
      supabase
        .from('meetings')
        .select('*')
        .eq('club_id', clubId)
        .then(({ data }) => setMeetings((data ?? []).map(mapMeetingRow)));
    };

    const channel = supabase
      .channel(`club-meetings-${clubId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meetings', filter: `club_id=eq.${clubId}` },
        refetch
      )
      .subscribe();

    refetch();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, setMeetings]);
}
