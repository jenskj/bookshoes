import { create } from 'zustand';
import { Book } from '../types';
import { persist } from 'zustand/middleware';

interface BookStore {
  books: Book[];
  setBooks: (newBooks?: Book[]) => void;
}

export const useBookStore = create(
  persist<BookStore>(
    (set) => ({
      books: [],
      setBooks: (books) =>
        set(() => ({
          books,
        })),
    }),
    {
      name: 'book-storage', // name of the item in the storage (must be unique)
    }
  )
);
