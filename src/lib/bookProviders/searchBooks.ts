import type { CatalogBookCandidate } from '@types';
import { googleBooksProvider } from './googleBooksProvider';
import { openLibraryProvider } from './openLibraryProvider';

const providers = [googleBooksProvider, openLibraryProvider];

function normalizeText(value: string | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeIsbn(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (normalized.length === 10 || normalized.length === 13) return normalized;
  return undefined;
}

function extractYear(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const match = value.match(/\b(\d{4})\b/);
  return match?.[1];
}

function getScore(candidate: CatalogBookCandidate): number {
  let score = 0;
  if (candidate.title) score += 2;
  if (candidate.authors.length) score += 1.5;
  if (candidate.coverUrl) score += 2;
  if (candidate.pageCount) score += 1;
  if (candidate.description) score += 1;
  if (candidate.publisher) score += 0.5;
  if (candidate.publishedDate) score += 0.5;
  if (candidate.isbn13) score += 2;
  else if (candidate.isbn10) score += 1;

  if (candidate.source === 'google') score += 0.2;
  if (candidate.source === 'open_library') score += 0.1;

  return score;
}

function hasIsbnMatch(a: CatalogBookCandidate, b: CatalogBookCandidate): boolean {
  const a13 = normalizeIsbn(a.isbn13);
  const b13 = normalizeIsbn(b.isbn13);
  if (a13 && b13 && a13 === b13) return true;

  const a10 = normalizeIsbn(a.isbn10);
  const b10 = normalizeIsbn(b.isbn10);
  return Boolean(a10 && b10 && a10 === b10);
}

function hasTitleAuthorMatch(a: CatalogBookCandidate, b: CatalogBookCandidate): boolean {
  const aTitle = normalizeText(a.title);
  const bTitle = normalizeText(b.title);
  const aAuthor = normalizeText(a.authors[0]);
  const bAuthor = normalizeText(b.authors[0]);
  if (!aTitle || !bTitle || !aAuthor || !bAuthor) return false;
  if (aTitle !== bTitle || aAuthor !== bAuthor) return false;

  const aYear = extractYear(a.publishedDate);
  const bYear = extractYear(b.publishedDate);
  if (aYear && bYear) return aYear === bYear;

  return true;
}

function isSameBook(a: CatalogBookCandidate, b: CatalogBookCandidate): boolean {
  return hasIsbnMatch(a, b) || hasTitleAuthorMatch(a, b);
}

function mergeCandidates(
  primary: CatalogBookCandidate,
  incoming: CatalogBookCandidate
): CatalogBookCandidate {
  return {
    ...primary,
    title: primary.title || incoming.title,
    authors: primary.authors.length ? primary.authors : incoming.authors,
    description: primary.description ?? incoming.description,
    pageCount: primary.pageCount ?? incoming.pageCount,
    averageRating: primary.averageRating ?? incoming.averageRating,
    ratingsCount: primary.ratingsCount ?? incoming.ratingsCount,
    publishedDate: primary.publishedDate ?? incoming.publishedDate,
    publisher: primary.publisher ?? incoming.publisher,
    coverUrl: primary.coverUrl ?? incoming.coverUrl,
    isbn10: primary.isbn10 ?? incoming.isbn10,
    isbn13: primary.isbn13 ?? incoming.isbn13,
    metadataRaw: {
      mergedFrom: [primary.source, incoming.source],
      primary: primary.metadataRaw ?? {},
      secondary: incoming.metadataRaw ?? {},
    },
  };
}

export function dedupeBookCandidates(candidates: CatalogBookCandidate[]): CatalogBookCandidate[] {
  const sorted = [...candidates].sort((a, b) => getScore(b) - getScore(a));
  const merged: CatalogBookCandidate[] = [];

  sorted.forEach((candidate) => {
    const matchIndex = merged.findIndex((existing) => isSameBook(existing, candidate));
    if (matchIndex === -1) {
      merged.push(candidate);
      return;
    }

    merged[matchIndex] = mergeCandidates(merged[matchIndex], candidate);
  });

  return merged
    .sort((a, b) => getScore(b) - getScore(a))
    .slice(0, 30);
}

export const searchBooks = async (query: string): Promise<CatalogBookCandidate[]> => {
  if (!query.trim()) return [];

  const settled = await Promise.allSettled(providers.map((provider) => provider.search(query)));
  const candidates = settled.flatMap((result) => {
    if (result.status === 'fulfilled') return result.value;
    console.error(result.reason);
    return [];
  });

  return dedupeBookCandidates(candidates);
};
