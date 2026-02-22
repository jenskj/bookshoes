import { supabase } from '@lib/supabase';
import { mapBookRow } from '@lib/mappers';
import { useCallback } from 'react';
import { useBookStore } from './useBookStore';
import { useClubRealtimeCollection } from './useClubRealtimeCollection';

/** Fetches club books and subscribes to realtime updates. Updates useBookStore. */
export function useClubBooks(clubId: string | undefined) {
  const setBooks = useBookStore((s) => s.setBooks);
  const upsertBook = useBookStore((s) => s.upsertBook);
  const removeBook = useBookStore((s) => s.removeBook);
  const onDisabled = useCallback(() => {
    setBooks([]);
  }, [setBooks]);
  const fetchInitial = useCallback(async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('club_id', clubId as string)
      .order('added_at', { ascending: true });
    setBooks((data ?? []).map(mapBookRow));
  }, [clubId, setBooks]);
  const onDelete = useCallback((row: Record<string, unknown>) => {
    removeBook(row.id as string);
  }, [removeBook]);
  const onUpsert = useCallback((row: Record<string, unknown>) => {
    upsertBook(mapBookRow(row));
  }, [upsertBook]);

  useClubRealtimeCollection({
    clubId,
    table: 'books',
    channelKey: 'club-books',
    onDisabled,
    fetchInitial,
    onDelete,
    onUpsert,
  });
}
