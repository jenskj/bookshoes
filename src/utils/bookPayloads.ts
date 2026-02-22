import type { AddBookPayload } from './supabase/books';
import type {
  Book,
  CatalogBookCandidate,
  CustomBookInput,
  VolumeInfo,
} from '@types';

const DEFAULT_ADD_BOOK_ARRAYS = {
  ratings: [],
  progressReports: [],
};

type BuildAddBookPayloadOptions = {
  addedDate?: string;
  readStatus?: string;
  scheduledMeetings?: string[];
};

const resolveAddedDate = (addedDate?: string) => {
  return addedDate ?? new Date().toISOString();
};

export const candidateToVolumeInfo = (
  candidate: CatalogBookCandidate
): VolumeInfo => {
  return {
    title: candidate.title,
    authors: candidate.authors,
    imageLinks: candidate.coverUrl
      ? { thumbnail: candidate.coverUrl }
      : undefined,
    description: candidate.description,
    pageCount: candidate.pageCount,
    averageRating: candidate.averageRating,
    ratingsCount: candidate.ratingsCount,
    publishedDate: candidate.publishedDate,
    publisher: candidate.publisher,
    industryIdentifiers: [
      candidate.isbn13
        ? { type: 'ISBN_13', identifier: candidate.isbn13 }
        : undefined,
      candidate.isbn10
        ? { type: 'ISBN_10', identifier: candidate.isbn10 }
        : undefined,
    ].filter((item): item is { type: string; identifier: string } =>
      Boolean(item)
    ),
  };
};

export const buildAddBookPayloadFromCandidate = (
  candidate: CatalogBookCandidate,
  options: BuildAddBookPayloadOptions = {}
): AddBookPayload => {
  return {
    source: candidate.source,
    sourceBookId: candidate.sourceBookId,
    coverUrl: candidate.coverUrl,
    isbn10: candidate.isbn10,
    isbn13: candidate.isbn13,
    metadataRaw: candidate.metadataRaw as Record<string, unknown>,
    volumeInfo: candidateToVolumeInfo(candidate),
    addedDate: resolveAddedDate(options.addedDate),
    readStatus: options.readStatus ?? 'candidate',
    scheduledMeetings: options.scheduledMeetings ?? [],
    ...DEFAULT_ADD_BOOK_ARRAYS,
  };
};

export const buildAddBookPayloadFromCustomInput = (
  customBook: CustomBookInput,
  options: BuildAddBookPayloadOptions = {}
): AddBookPayload => {
  return {
    source: 'manual',
    sourceBookId: null,
    coverUrl: customBook.coverUrl ?? null,
    isbn10: customBook.isbn10 ?? null,
    isbn13: customBook.isbn13 ?? null,
    metadataRaw: {
      provider: 'manual',
      createdFrom: 'custom-book-dialog',
    },
    volumeInfo: {
      title: customBook.title,
      authors: customBook.authors,
      imageLinks: customBook.coverUrl
        ? { thumbnail: customBook.coverUrl }
        : undefined,
      description: customBook.description,
      pageCount: customBook.pageCount,
      publishedDate: customBook.publishedDate,
      publisher: customBook.publisher,
      industryIdentifiers: [
        customBook.isbn13
          ? { type: 'ISBN_13', identifier: customBook.isbn13 }
          : undefined,
        customBook.isbn10
          ? { type: 'ISBN_10', identifier: customBook.isbn10 }
          : undefined,
      ].filter((item): item is { type: string; identifier: string } =>
        Boolean(item)
      ),
    },
    addedDate: resolveAddedDate(options.addedDate),
    readStatus: options.readStatus ?? 'candidate',
    scheduledMeetings: options.scheduledMeetings ?? [],
    ...DEFAULT_ADD_BOOK_ARRAYS,
  };
};

export const buildAddBookPayloadFromBookData = (
  bookData: Book['data'],
  options: BuildAddBookPayloadOptions = {}
): AddBookPayload => {
  return {
    volumeInfo: bookData.volumeInfo as unknown as Record<string, unknown>,
    source: bookData.source ?? 'google',
    sourceBookId:
      bookData.source === 'manual'
        ? null
        : (bookData.sourceBookId ?? bookData.id),
    id:
      bookData.source === 'google'
        ? (bookData.sourceBookId ?? bookData.id)
        : undefined,
    coverUrl: bookData.coverUrl,
    isbn10: bookData.isbn10,
    isbn13: bookData.isbn13,
    metadataRaw: bookData.metadataRaw as Record<string, unknown>,
    addedDate: resolveAddedDate(options.addedDate),
    scheduledMeetings: options.scheduledMeetings,
    ...DEFAULT_ADD_BOOK_ARRAYS,
  };
};
