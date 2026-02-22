import { useEffect, useMemo, useState } from 'react';
import { useBookStore, useCurrentUserStore } from '@hooks';
import { runOptimisticMutation } from '@lib/optimistic';
import { useToast } from '@lib/ToastContext';
import { AddBookPayload, addBook, getBooksBySearch, updateBook } from '@utils';
import { Book, CatalogBookCandidate, CustomBookInput } from '@types';
import { LANE_CONFIG, LaneKey, getLaneBooks, mapLaneToReadStatus } from './kanbanUtils';

export const useKanbanBoard = () => {
  const books = useBookStore((state) => state.books);
  const activeClub = useCurrentUserStore((state) => state.activeClub);
  const { showError } = useToast();
  const [dragBookId, setDragBookId] = useState<string | null>(null);
  const [optimisticStatusByDocId, setOptimisticStatusByDocId] = useState<
    Record<string, Book['data']['readStatus']>
  >({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<CatalogBookCandidate[]>([]);

  const findExistingBook = (candidate: CatalogBookCandidate) =>
    books.find((entry) => {
      const sourceMatch =
        entry.data.source === candidate.source &&
        entry.data.sourceBookId === candidate.sourceBookId;
      const legacyGoogleMatch =
        candidate.source === 'google' &&
        (entry.data.googleId === candidate.sourceBookId || entry.data.id === candidate.sourceBookId);
      const isbn13Match =
        Boolean(candidate.isbn13) && candidate.isbn13 === entry.data.isbn13;
      const isbn10Match =
        Boolean(candidate.isbn10) && candidate.isbn10 === entry.data.isbn10;

      return sourceMatch || legacyGoogleMatch || isbn13Match || isbn10Match;
    });

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
    try {
      setSearchLoading(true);
      const found = await getBooksBySearch(searchTerm.trim());
      setSearchResults(found || []);
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error));
    } finally {
      setSearchLoading(false);
    }
  };

  const onAddSearchResult = async (candidate: CatalogBookCandidate) => {
    if (!activeClub?.docId) {
      showError('Select an active club before adding books.');
      return;
    }

    const existing = findExistingBook(candidate);
    if (existing?.docId) {
      await updateBook(activeClub.docId, existing.docId, { inactive: false });
      return;
    }

    const payload: AddBookPayload = {
      source: candidate.source,
      sourceBookId: candidate.sourceBookId,
      coverUrl: candidate.coverUrl,
      isbn10: candidate.isbn10,
      isbn13: candidate.isbn13,
      metadataRaw: candidate.metadataRaw as Record<string, unknown>,
      volumeInfo: {
        title: candidate.title,
        authors: candidate.authors,
        imageLinks: candidate.coverUrl ? { thumbnail: candidate.coverUrl } : undefined,
        description: candidate.description,
        pageCount: candidate.pageCount,
        averageRating: candidate.averageRating,
        ratingsCount: candidate.ratingsCount,
        publishedDate: candidate.publishedDate,
        publisher: candidate.publisher,
        industryIdentifiers: [
          candidate.isbn13
            ? { type: 'ISBN_13', identifier: candidate.isbn13 }
            : undefined,
          candidate.isbn10
            ? { type: 'ISBN_10', identifier: candidate.isbn10 }
            : undefined,
        ].filter(Boolean),
      },
      addedDate: new Date().toISOString(),
      readStatus: 'candidate',
      ratings: [],
      progressReports: [],
      scheduledMeetings: [],
    };
    await addBook(activeClub.docId, payload);
  };

  const onAddCustomBook = async (customBook: CustomBookInput) => {
    if (!activeClub?.docId) {
      showError('Select an active club before adding books.');
      return;
    }

    const payload: AddBookPayload = {
      source: 'manual',
      sourceBookId: null,
      coverUrl: customBook.coverUrl ?? null,
      isbn10: customBook.isbn10 ?? null,
      isbn13: customBook.isbn13 ?? null,
      metadataRaw: {
        provider: 'manual',
        createdFrom: 'custom-book-dialog',
      },
      volumeInfo: {
        title: customBook.title,
        authors: customBook.authors,
        imageLinks: customBook.coverUrl ? { thumbnail: customBook.coverUrl } : undefined,
        description: customBook.description,
        pageCount: customBook.pageCount,
        publishedDate: customBook.publishedDate,
        publisher: customBook.publisher,
        industryIdentifiers: [
          customBook.isbn13
            ? { type: 'ISBN_13', identifier: customBook.isbn13 }
            : undefined,
          customBook.isbn10
            ? { type: 'ISBN_10', identifier: customBook.isbn10 }
            : undefined,
        ].filter(Boolean),
      },
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
    onAddCustomBook,
    onDrop,
    onSearch,
    moveBookToLane,
  };
};
