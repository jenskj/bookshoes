import { create } from 'zustand';
import { FirestoreBook } from '../types';
import { persist } from 'zustand/middleware';

interface BookStore {
  books: FirestoreBook[];
  setBooks: (newBooks: FirestoreBook[]) => void;
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
