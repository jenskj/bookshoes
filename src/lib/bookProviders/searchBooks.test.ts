import type { CatalogBookCandidate } from '@types';
import { describe, expect, it } from 'vitest';
import { dedupeBookCandidates } from './searchBooks';

function candidate(overrides: Partial<CatalogBookCandidate>): CatalogBookCandidate {
  return {
    providerResultId: 'default:1',
    source: 'google',
    sourceBookId: 'default-1',
    title: 'Default Title',
    authors: ['Default Author'],
    metadataRaw: {},
    ...overrides,
  };
}

describe('dedupeBookCandidates', () => {
  it('merges Google and Open Library results when ISBN-13 matches', () => {
    const google = candidate({
      providerResultId: 'google:abc',
      source: 'google',
      sourceBookId: 'abc',
      title: 'Dune',
      authors: ['Frank Herbert'],
      isbn13: '9780441172719',
      description: 'Epic science fiction',
    });

    const openLibrary = candidate({
      providerResultId: 'open_library:OL1M',
      source: 'open_library',
      sourceBookId: 'OL1M',
      title: 'Dune',
      authors: ['Frank Herbert'],
      isbn13: '9780441172719',
      coverUrl: 'https://covers.openlibrary.org/b/id/123-L.jpg',
      pageCount: 604,
    });

    const merged = dedupeBookCandidates([google, openLibrary]);

    expect(merged).toHaveLength(1);
    expect(['google', 'open_library']).toContain(merged[0].source);
    expect(merged[0].description).toBe('Epic science fiction');
    expect(merged[0].coverUrl).toBe('https://covers.openlibrary.org/b/id/123-L.jpg');
    expect(merged[0].pageCount).toBe(604);
  });

  it('keeps distinct entries when ISBNs and title-author signatures differ', () => {
    const dune = candidate({
      providerResultId: 'google:dune',
      sourceBookId: 'dune',
      title: 'Dune',
      authors: ['Frank Herbert'],
      isbn13: '9780441172719',
    });

    const hobbit = candidate({
      providerResultId: 'open_library:hobbit',
      source: 'open_library',
      sourceBookId: 'OL2M',
      title: 'The Hobbit',
      authors: ['J. R. R. Tolkien'],
      isbn13: '9780547928227',
    });

    const merged = dedupeBookCandidates([dune, hobbit]);

    expect(merged).toHaveLength(2);
    expect(merged.map((entry) => entry.title).sort()).toEqual(['Dune', 'The Hobbit']);
  });
});
