import axios from 'axios';
import type { CatalogBookCandidate } from '@types';
import type { BookProvider } from './types';

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryDoc[];
}

interface OpenLibraryDoc {
  key?: string;
  edition_key?: string[];
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  publisher?: string[];
  isbn?: string[];
  cover_i?: number;
}

function normalizeIsbn(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (normalized.length === 10 || normalized.length === 13) return normalized;
  return undefined;
}

function getPreferredIdentifier(doc: OpenLibraryDoc): string | undefined {
  const editionId = doc.edition_key?.[0];
  if (editionId) return editionId;
  const workKey = doc.key;
  if (!workKey) return undefined;
  return workKey.split('/').pop();
}

function splitIsbn(isbnList: string[] | undefined): { isbn10?: string; isbn13?: string } {
  if (!isbnList?.length) return {};
  let isbn10: string | undefined;
  let isbn13: string | undefined;

  isbnList.forEach((isbn) => {
    const normalized = normalizeIsbn(isbn);
    if (!normalized) return;
    if (normalized.length === 13 && !isbn13) {
      isbn13 = normalized;
      return;
    }
    if (normalized.length === 10 && !isbn10) {
      isbn10 = normalized;
    }
  });

  return { isbn10, isbn13 };
}

function toCoverUrl(coverId: number | undefined): string | undefined {
  if (!coverId) return undefined;
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

function toCandidate(doc: OpenLibraryDoc): CatalogBookCandidate | undefined {
  const sourceBookId = getPreferredIdentifier(doc);
  if (!sourceBookId) return undefined;
  const { isbn10, isbn13 } = splitIsbn(doc.isbn);
  const publishedDate = doc.first_publish_year
    ? String(doc.first_publish_year)
    : undefined;

  return {
    providerResultId: `open_library:${sourceBookId}`,
    source: 'open_library',
    sourceBookId,
    title: doc.title ?? 'Untitled',
    authors: doc.author_name ?? [],
    pageCount: doc.number_of_pages_median,
    publishedDate,
    publisher: doc.publisher?.[0],
    coverUrl: toCoverUrl(doc.cover_i),
    isbn10,
    isbn13,
    metadataRaw: {
      provider: 'open_library',
      doc,
    },
  };
}

export const openLibraryProvider: BookProvider = {
  source: 'open_library',
  async search(query: string): Promise<CatalogBookCandidate[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({
      q: query.trim(),
      limit: '20',
      fields: 'key,edition_key,title,author_name,first_publish_year,number_of_pages_median,publisher,isbn,cover_i',
    });

    const url = `https://openlibrary.org/search.json?${params.toString()}`;
    const response = await axios.get<OpenLibrarySearchResponse>(url);

    return (response.data.docs ?? [])
      .map(toCandidate)
      .filter((candidate): candidate is CatalogBookCandidate => Boolean(candidate));
  },
};
