import { useEffect, useMemo, useState } from 'react';
import { useBookStore, useCurrentUserStore } from '@hooks';
import { runOptimisticMutation } from '@lib/optimistic';
import { useToast } from '@lib/ToastContext';
import { AddBookPayload, addBook, getBooksBySearch, updateBook } from '@utils';
import { Book } from '@types';
import { LANE_CONFIG, LaneKey, getLaneBooks, mapLaneToReadStatus } from './kanbanUtils';

export const useKanbanBoard = () => {
  const { books } = useBookStore();
  const { activeClub } = useCurrentUserStore();
  const { showError } = useToast();
  const [dragBookId, setDragBookId] = useState<string | null>(null);
  const [optimisticStatusByDocId, setOptimisticStatusByDocId] = useState<
    Record<string, Book['data']['readStatus']>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const booksWithOptimisticStatus = useMemo(() => {
    return books.map((book) => {
      if (!book.docId) return book;
      const optimisticStatus = optimisticStatusByDocId[book.docId];
      if (!optimisticStatus || optimisticStatus === book.data.readStatus) {
        return book;
      }
      return {
        ...book,
        data: {
          ...book.data,
          readStatus: optimisticStatus,
        },
      };
    });
  }, [books, optimisticStatusByDocId]);

  const lanes = useMemo(
    () =>
      LANE_CONFIG.map((lane) => ({
        ...lane,
        books: getLaneBooks(booksWithOptimisticStatus, lane.key),
      })),
    [booksWithOptimisticStatus]
  );

  useEffect(() => {
    setOptimisticStatusByDocId((currentState) => {
      const nextState = { ...currentState };
      let changed = false;

      Object.entries(currentState).forEach(([docId, optimisticStatus]) => {
        const sourceBook = books.find((book) => book.docId === docId);
        if (!sourceBook || sourceBook.data.readStatus === optimisticStatus) {
          delete nextState[docId];
          changed = true;
        }
      });

      return changed ? nextState : currentState;
    });
  }, [books]);

  const moveBookToLane = async (book: Book, lane: LaneKey) => {
    if (!activeClub?.docId || !book.docId) {
      showError('Select an active club before moving books.');
      return;
    }
    const targetStatus = mapLaneToReadStatus(lane);
    const effectiveStatus = optimisticStatusByDocId[book.docId] ?? book.data.readStatus;
    if (effectiveStatus === targetStatus) return;

    await runOptimisticMutation({
      getSnapshot: () => optimisticStatusByDocId,
      apply: () => {
        setOptimisticStatusByDocId((currentState) => ({
          ...currentState,
          [book.docId as string]: targetStatus,
        }));
      },
      commit: async () => {
        await updateBook(activeClub.docId, book.docId as string, {
          readStatus: targetStatus,
        });
      },
      rollback: (snapshot) => {
        setOptimisticStatusByDocId(snapshot);
      },
      onError: (error) => {
        showError(error instanceof Error ? error.message : String(error));
      },
    });
  };

  const onDrop = async (lane: LaneKey) => {
    const book = books.find((entry) => entry.docId === dragBookId);
    if (!book) return;
    await moveBookToLane(book, lane);
    setDragBookId(null);
  };

  const onSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    const found = await getBooksBySearch(searchTerm.trim());
    setSearchResults(found || []);
    setSearchLoading(false);
  };

  const onAddSearchResult = async (book: Book) => {
    if (!activeClub?.docId) {
      showError('Select an active club before adding books.');
      return;
    }

    const existing = books.find((entry) => entry.data.id === book.data.id);
    if (existing?.docId) {
      await updateBook(activeClub.docId, existing.docId, { inactive: false });
      return;
    }

    const payload: AddBookPayload = {
      volumeInfo: book.data.volumeInfo as unknown as Record<string, unknown>,
      id: book.data.id,
      addedDate: new Date().toISOString(),
      readStatus: 'candidate',
      ratings: [],
      progressReports: [],
      scheduledMeetings: [],
    };
    await addBook(activeClub.docId, payload);
  };

  return {
    books,
    lanes,
    activeClub,
    dragBookId,
    searchLoading,
    searchResults,
    searchTerm,
    setDragBookId,
    setSearchTerm,
    onAddSearchResult,
    onDrop,
    onSearch,
    moveBookToLane,
  };
};
