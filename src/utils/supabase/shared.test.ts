import { describe, expect, it } from 'vitest';
import { flattenBookPayload, parseCollectionPath } from './shared';

describe('parseCollectionPath', () => {
  it('parses top-level and club-scoped paths', () => {
    expect(parseCollectionPath('clubs')).toEqual({ table: 'clubs' });
    expect(parseCollectionPath('users')).toEqual({ table: 'users' });
    expect(parseCollectionPath('clubs/abc/books')).toEqual({
      table: 'books',
      clubId: 'abc',
    });
  });

  it('throws on unknown paths', () => {
    expect(() => parseCollectionPath('unknown/path')).toThrowError();
  });
});

describe('flattenBookPayload', () => {
  it('sets manual books with null source_book_id', () => {
    const payload = flattenBookPayload(
      {
        source: 'manual',
        volumeInfo: {
          title: 'Manual Title',
          authors: ['Author'],
        },
      },
      'club-1'
    );

    expect(payload.club_id).toBe('club-1');
    expect(payload.source).toBe('manual');
    expect(payload.source_book_id).toBeNull();
    expect(payload.title).toBe('Manual Title');
  });
});
