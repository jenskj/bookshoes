import axios from 'axios';
import type { CatalogBookCandidate } from '@types';
import type { BookProvider } from './types';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API ?? '';

interface GoogleBooksResponse {
  items?: GoogleVolume[];
}

interface GoogleVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    averageRating?: number;
    ratingsCount?: number;
    publishedDate?: string;
    publisher?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: {
      type?: string;
      identifier?: string;
    }[];
  };
}

type GoogleIndustryIdentifier =
  NonNullable<GoogleVolume['volumeInfo']>['industryIdentifiers'];

function normalizeIsbn(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (normalized.length === 10 || normalized.length === 13) return normalized;
  return undefined;
}

function getIsbn(
  industryIdentifiers: GoogleIndustryIdentifier,
  type: 'ISBN_10' | 'ISBN_13'
): string | undefined {
  const match = industryIdentifiers?.find(
    (entry: { type?: string; identifier?: string }) => entry.type === type
  )?.identifier;
  return normalizeIsbn(match);
}

function toCandidate(item: GoogleVolume): CatalogBookCandidate {
  const info = item.volumeInfo ?? {};
  const coverUrl = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;

  return {
    providerResultId: `google:${item.id}`,
    source: 'google',
    sourceBookId: item.id,
    title: info.title ?? 'Untitled',
    authors: info.authors ?? [],
    description: info.description,
    pageCount: info.pageCount,
    averageRating: info.averageRating,
    ratingsCount: info.ratingsCount,
    publishedDate: info.publishedDate,
    publisher: info.publisher,
    coverUrl,
    isbn10: getIsbn(info.industryIdentifiers, 'ISBN_10'),
    isbn13: getIsbn(info.industryIdentifiers, 'ISBN_13'),
    metadataRaw: {
      provider: 'google',
      volumeId: item.id,
      volumeInfo: info,
    },
  };
}

export const googleBooksProvider: BookProvider = {
  source: 'google',
  async search(query: string): Promise<CatalogBookCandidate[]> {
    if (!query.trim()) return [];
    const params = new URLSearchParams({
      q: query.trim(),
      maxResults: '20',
      printType: 'books',
      projection: 'lite',
      langRestrict: 'en',
    });
    if (API_KEY) {
      params.set('key', API_KEY);
    }

    const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
    const response = await axios.get<GoogleBooksResponse>(url);
    return (response.data.items ?? []).map(toCandidate);
  },
};

export const getGoogleBookById = async (id: string): Promise<CatalogBookCandidate | undefined> => {
  try {
    const response = await axios.get<GoogleVolume>(`https://www.googleapis.com/books/v1/volumes/${id}`);
    return toCandidate(response.data);
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
