import type { BookSource, CatalogBookCandidate } from '@types';

export type ExternalBookSource = Exclude<BookSource, 'manual'>;

export interface BookProvider {
  source: ExternalBookSource;
  search: (query: string) => Promise<CatalogBookCandidate[]>;
}
