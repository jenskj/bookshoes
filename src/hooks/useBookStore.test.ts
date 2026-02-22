import { beforeEach, describe, expect, it } from 'vitest';
import type { Book } from '@types';
import { useBookStore } from './useBookStore';

const makeBook = (docId: string): Book => ({
  docId,
  data: {
    id: docId,
  },
});

describe('useBookStore', () => {
  beforeEach(() => {
    useBookStore.setState({ books: [] });
  });

  it('upserts and replaces books by docId', () => {
    const { upsertBook } = useBookStore.getState();

    upsertBook(makeBook('book-1'));
    upsertBook({
      docId: 'book-1',
      data: {
        id: 'book-1',
        readStatus: 'reading',
      },
    });

    const books = useBookStore.getState().books;
    expect(books).toHaveLength(1);
    expect(books[0].data.readStatus).toBe('reading');
  });

  it('removes books by docId', () => {
    const { setBooks, removeBook } = useBookStore.getState();

    setBooks([makeBook('book-1'), makeBook('book-2')]);
    removeBook('book-1');

    const books = useBookStore.getState().books;
    expect(books).toHaveLength(1);
    expect(books[0].docId).toBe('book-2');
  });
});
