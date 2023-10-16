import { create } from 'zustand';
import { FirestoreBook } from '../types';

interface BookStore {
  books: FirestoreBook[];
  setBooks: (newBooks: FirestoreBook[]) => void;
}

export const useBookStore = create<BookStore>((set) => ({
  books: [],
  setBooks: (books) =>
    set(() => ({
      books,
    })),
}));
