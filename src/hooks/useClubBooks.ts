import { supabase } from '@lib/supabase';
import { mapBookRow } from '@lib/mappers';
import { useEffect } from 'react';
import { useBookStore } from './useBookStore';

/** Fetches club books and subscribes to realtime updates. Updates useBookStore. */
export function useClubBooks(clubId: string | undefined) {
  const setBooks = useBookStore((s) => s.setBooks);
  const upsertBook = useBookStore((s) => s.upsertBook);
  const removeBook = useBookStore((s) => s.removeBook);

  useEffect(() => {
    if (!clubId) {
      setBooks([]);
      return;
    }

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('club_id', clubId)
        .order('added_at', { ascending: true });
      setBooks((data ?? []).map(mapBookRow));
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
        removeBook(deletedId);
        return;
      }

      const nextRow = payload.new;
      if (!nextRow?.id) {
        await fetchInitial();
        return;
      }
      upsertBook(mapBookRow(nextRow));
    };

    const channel = supabase
      .channel(`club-books-${clubId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'books', filter: `club_id=eq.${clubId}` },
        (payload) => {
          void handleRealtimeChange(payload as Parameters<typeof handleRealtimeChange>[0]);
        }
      )
      .subscribe();

    void fetchInitial();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, removeBook, setBooks, upsertBook]);
}
