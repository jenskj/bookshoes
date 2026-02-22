import { create } from 'zustand';
import { Book } from '@types';

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
        const index = state.books.findIndex((entry) => entry.docId === book.docId);
        if (index === -1) {
          return { books: [...state.books, book] };
        }
        const nextBooks = [...state.books];
        nextBooks[index] = book;
        return { books: nextBooks };
      }),
    removeBook: (bookId) =>
      set((state) => ({
        books: state.books.filter((book) => book.docId !== bookId),
      })),
  })
);
