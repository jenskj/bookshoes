import { create } from 'zustand';
import { Book } from '@types';
import { removeByDocId, upsertByDocId } from '@lib/storeCollections';

interface BookStore {
  books: Book[];
  setBooks: (newBooks?: Book[]) => void;
  upsertBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
}

export const useBookStore = create<BookStore>(
  (set) => ({
    books: [],
    setBooks: (books) =>
      set(() => ({
        books: books ?? [],
      })),
    upsertBook: (book) =>
      set((state) => {
        return { books: upsertByDocId(state.books, book) };
      }),
    removeBook: (bookId) =>
      set((state) => ({
        books: removeByDocId(state.books, bookId),
      })),
  })
);
