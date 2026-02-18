import { useMemo, useState } from 'react';
import { useBookStore, useCurrentUserStore } from '@hooks';
import { useToast } from '@lib/ToastContext';
import { AddBookPayload, addBook, getBooksBySearch, updateBook } from '@utils';
import { Book } from '@types';
import { LANE_CONFIG, LaneKey, getLaneBooks, mapLaneToReadStatus } from './kanbanUtils';

export const useKanbanBoard = () => {
  const { books } = useBookStore();
  const { activeClub } = useCurrentUserStore();
  const { showError } = useToast();
  const [dragBookId, setDragBookId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const lanes = useMemo(
    () =>
      LANE_CONFIG.map((lane) => ({
        ...lane,
        books: getLaneBooks(books, lane.key),
      })),
    [books]
  );

  const moveBookToLane = async (book: Book, lane: LaneKey) => {
    if (!activeClub?.docId || !book.docId) {
      showError('Select an active club before moving books.');
      return;
    }
    const targetStatus = mapLaneToReadStatus(lane);
    if (book.data.readStatus === targetStatus) return;
    await updateBook(activeClub.docId, book.docId, { readStatus: targetStatus });
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
