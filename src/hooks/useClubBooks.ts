import { supabase } from '@lib/supabase';
import { mapBookRow } from '@lib/mappers';
import { useEffect } from 'react';
import { useBookStore } from './useBookStore';

/** Fetches club books and subscribes to realtime updates. Updates useBookStore. */
export function useClubBooks(clubId: string | undefined) {
  const setBooks = useBookStore((s) => s.setBooks);

  useEffect(() => {
    if (!clubId) {
      setBooks([]);
      return;
    }

    const refetch = () => {
      supabase
        .from('books')
        .select('*')
        .eq('club_id', clubId)
        .order('added_at', { ascending: true })
        .then(({ data }) => setBooks((data ?? []).map(mapBookRow)));
    };

    const channel = supabase
      .channel(`club-books-${clubId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'books', filter: `club_id=eq.${clubId}` },
        refetch
      )
      .subscribe();

    refetch();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clubId, setBooks]);
}
