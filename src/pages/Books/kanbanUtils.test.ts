import { describe, expect, it } from 'vitest';
import type { Book } from '@types';
import { getLaneBooks, mapLaneToReadStatus } from './kanbanUtils';

const makeBook = (
  id: string,
  readStatus: Book['data']['readStatus']
): Book => ({
  docId: id,
  data: {
    id,
    readStatus,
    volumeInfo: {
      title: id,
      authors: [],
      imageLinks: {
        thumbnail: '',
      },
      pageCount: 0,
    },
  },
});

describe('kanbanUtils', () => {
  it('maps lane keys to read status correctly', () => {
    expect(mapLaneToReadStatus('unread')).toBe('unread');
    expect(mapLaneToReadStatus('candidate')).toBe('candidate');
    expect(mapLaneToReadStatus('read')).toBe('read');
  });

  it('groups reading books into the voting lane', () => {
    const books = [
      makeBook('u1', 'unread'),
      makeBook('c1', 'candidate'),
      makeBook('r1', 'read'),
      makeBook('reading-1', 'reading'),
    ];

    const votingLane = getLaneBooks(books, 'candidate').map((book) => book.docId);
    expect(votingLane).toEqual(['c1', 'reading-1']);
  });
});
