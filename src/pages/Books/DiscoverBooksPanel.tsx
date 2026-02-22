import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomBookDialog } from '@components';
import { UIButton } from '@components/ui';
import { Book, CatalogBookCandidate, CustomBookInput } from '@types';
import { getPlaceholderImageUrl } from '@utils';
import {
  StyledDiscoverPanel,
  StyledResultCover,
  StyledResultCard,
  StyledResultGrid,
  StyledResultOpenButton,
  StyledSearchInput,
  StyledSearchRow,
  StyledTileMeta,
  StyledTileTitle,
} from './boardStyles';

interface DiscoverBooksPanelProps {
  activeClubSelected: boolean;
  books: Book[];
  results: CatalogBookCandidate[];
  searchTerm: string;
  searchLoading: boolean;
  onSearchTermChange: (value: string) => void;
  onSearch: () => Promise<void>;
  onOpenBook: (candidate: CatalogBookCandidate, existingDocId?: string) => void;
  onAddBook: (candidate: CatalogBookCandidate) => Promise<void>;
  onAddCustomBook: (payload: CustomBookInput) => Promise<void>;
}

export const DiscoverBooksPanel = ({
  activeClubSelected,
  books,
  results,
  searchTerm,
  searchLoading,
  onSearchTermChange,
  onSearch,
  onOpenBook,
  onAddBook,
  onAddCustomBook,
}: DiscoverBooksPanelProps) => {
  const [customBookOpen, setCustomBookOpen] = useState(false);

  const existingBookByKey = useMemo(() => {
    const map = new Map<string, Book>();
    books.forEach((entry) => {
      const source = entry.data.source ?? 'google';
      if (entry.data.sourceBookId) {
        map.set(`source:${source}:${entry.data.sourceBookId}`, entry);
      }
      if (entry.data.googleId) {
        map.set(`google-id:${entry.data.googleId}`, entry);
      }
      if (entry.data.id) {
        map.set(`book-id:${entry.data.id}`, entry);
      }
      if (entry.data.isbn13) {
        map.set(`isbn13:${entry.data.isbn13}`, entry);
      }
      if (entry.data.isbn10) {
        map.set(`isbn10:${entry.data.isbn10}`, entry);
      }
    });
    return map;
  }, [books]);

  const findExistingBook = (candidate: CatalogBookCandidate) => {
    return (
      existingBookByKey.get(`source:${candidate.source}:${candidate.sourceBookId}`) ??
      (candidate.source === 'google'
        ? existingBookByKey.get(`google-id:${candidate.sourceBookId}`) ??
          existingBookByKey.get(`book-id:${candidate.sourceBookId}`)
        : undefined) ??
      (candidate.isbn13 ? existingBookByKey.get(`isbn13:${candidate.isbn13}`) : undefined) ??
      (candidate.isbn10 ? existingBookByKey.get(`isbn10:${candidate.isbn10}`) : undefined)
    );
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSearch();
  };

  return (
    <StyledDiscoverPanel>
      <h3>Discover Books</h3>
      <p className="mono">Search and push titles into the Voting lane.</p>
      <StyledSearchRow onSubmit={handleSearchSubmit}>
        <StyledSearchInput
          className="focus-ring"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search by title, author, or isbn"
        />
        <UIButton
          type="submit"
          variant="primary"
          className="focus-ring"
          disabled={searchLoading}
        >
          {searchLoading ? 'Searching…' : 'Search'}
        </UIButton>
      </StyledSearchRow>
      <div>
        <UIButton
          type="button"
          variant="secondary"
          className="focus-ring"
          onClick={() => setCustomBookOpen(true)}
        >
          Add Custom Book
        </UIButton>
      </div>
      <StyledResultGrid>
        {results.length ? (
          results.map((result) => {
            const existing = findExistingBook(result);
            const exists = Boolean(existing?.docId);
            return (
              <StyledResultCard key={result.providerResultId}>
                <StyledResultOpenButton
                  type="button"
                  className="focus-ring"
                  onClick={() => onOpenBook(result, existing?.docId)}
                >
                  <StyledResultCover
                    src={result.coverUrl || getPlaceholderImageUrl()}
                    alt={result.title}
                  />
                  <div>
                    <StyledTileTitle>{result.title}</StyledTileTitle>
                    <StyledTileMeta>
                      {result.authors.join(', ') || 'Unknown author'}
                    </StyledTileMeta>
                  </div>
                </StyledResultOpenButton>
                {exists ? (
                  <UIButton
                    variant="ghost"
                    className="focus-ring"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenBook(result, existing?.docId);
                    }}
                  >
                    Open
                  </UIButton>
                ) : (
                  <UIButton
                    variant="ghost"
                    className="focus-ring"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onAddBook(result);
                    }}
                  >
                    Add
                  </UIButton>
                )}
              </StyledResultCard>
            );
          })
        ) : (
          <p>No search results yet. Start by querying a book to add it into voting.</p>
        )}
      </StyledResultGrid>
      {!activeClubSelected ? (
        <p>Select an active club in the context bar before adding books to a shared lane.</p>
      ) : null}
      <Link to="/meetings" className="mono">
        Move to meeting planning →
      </Link>
      <CustomBookDialog
        open={customBookOpen}
        onClose={() => setCustomBookOpen(false)}
        onCreate={onAddCustomBook}
      />
    </StyledDiscoverPanel>
  );
};
