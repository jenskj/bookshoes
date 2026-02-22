import type { BookInfo, CatalogBookCandidate } from '@types';
import { getGoogleBookById } from '@lib/bookProviders/googleBooksProvider';
import { searchBooks } from '@lib/bookProviders/searchBooks';
import { candidateToVolumeInfo } from './bookPayloads';

export const candidateToBookInfo = (candidate: CatalogBookCandidate): BookInfo => ({
  id: `${candidate.source}:${candidate.sourceBookId}`,
  source: candidate.source,
  sourceBookId: candidate.sourceBookId,
  coverUrl: candidate.coverUrl,
  isbn10: candidate.isbn10,
  isbn13: candidate.isbn13,
  metadataRaw: candidate.metadataRaw,
  volumeInfo: candidateToVolumeInfo(candidate),
});

export const getBooksBySearch = async (searchTerm: string): Promise<CatalogBookCandidate[]> => {
  return searchBooks(searchTerm);
};

export const getBookById = async (id: string): Promise<BookInfo | undefined> => {
  const normalizedId = id.startsWith('google:') ? id.replace('google:', '') : id;
  const candidate = await getGoogleBookById(normalizedId);
  if (!candidate) return undefined;
  return candidateToBookInfo(candidate);
};
