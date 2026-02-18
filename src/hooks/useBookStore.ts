import { create } from 'zustand';
import { Book } from '@types';

interface BookStore {
  books: Book[];
  setBooks: (newBooks?: Book[]) => void;
}

export const useBookStore = create<BookStore>(
  (set) => ({
    books: [],
    setBooks: (books) =>
      set(() => ({
        books,
      })),
  })
);
