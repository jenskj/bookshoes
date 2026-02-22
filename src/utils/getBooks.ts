import type { BookInfo, CatalogBookCandidate, VolumeInfo } from '@types';
import { getGoogleBookById } from '@lib/bookProviders/googleBooksProvider';
import { searchBooks } from '@lib/bookProviders/searchBooks';

function candidateToVolumeInfo(candidate: CatalogBookCandidate): VolumeInfo {
  return {
    title: candidate.title,
    authors: candidate.authors,
    imageLinks: candidate.coverUrl ? { thumbnail: candidate.coverUrl } : undefined,
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
    ].filter((item): item is { type: string; identifier: string } => Boolean(item)),
  };
}

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
