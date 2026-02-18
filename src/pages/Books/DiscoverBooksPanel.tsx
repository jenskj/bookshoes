import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomBookDialog } from '@components';
import { Book, CatalogBookCandidate, CustomBookInput } from '@types';
import {
  StyledDiscoverPanel,
  StyledResultAction,
  StyledResultCard,
  StyledResultGrid,
  StyledSearchButton,
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

  const findExistingBook = (candidate: CatalogBookCandidate) => {
    return books.find((entry) => {
      const sourceMatch =
        entry.data.source === candidate.source &&
        entry.data.sourceBookId === candidate.sourceBookId;
      const legacyGoogleMatch =
        candidate.source === 'google' &&
        (entry.data.googleId === candidate.sourceBookId || entry.data.id === candidate.sourceBookId);
      const isbn13Match =
        Boolean(candidate.isbn13) && candidate.isbn13 === entry.data.isbn13;
      const isbn10Match =
        Boolean(candidate.isbn10) && candidate.isbn10 === entry.data.isbn10;
      return sourceMatch || legacyGoogleMatch || isbn13Match || isbn10Match;
    });
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
        <StyledSearchButton
          type="submit"
          variant="primary"
          className="focus-ring"
          disabled={searchLoading}
        >
          {searchLoading ? 'Searching…' : 'Search'}
        </StyledSearchButton>
      </StyledSearchRow>
      <div>
        <StyledSearchButton
          type="button"
          variant="secondary"
          className="focus-ring"
          onClick={() => setCustomBookOpen(true)}
        >
          Add Custom Book
        </StyledSearchButton>
      </div>
      <StyledResultGrid>
        {results.length ? (
          results.map((result) => {
            const existing = findExistingBook(result);
            const exists = Boolean(existing?.docId);
            return (
              <StyledResultCard key={result.providerResultId}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenBook(result, existing?.docId)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenBook(result, existing?.docId);
                    }
                  }}
                  style={{
                    display: 'contents',
                    cursor: 'pointer',
                  }}
                >
                <img
                  src={result.coverUrl || '/book-placeholder.svg'}
                  alt={result.title}
                  style={{ width: 64, height: 96, objectFit: 'cover', borderRadius: 6 }}
                />
                <div>
                  <StyledTileTitle>{result.title}</StyledTileTitle>
                  <StyledTileMeta>
                    {result.authors.join(', ') || 'Unknown author'}
                  </StyledTileMeta>
                </div>
                {exists ? (
                  <StyledResultAction
                    variant="ghost"
                    className="focus-ring"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenBook(result, existing?.docId);
                    }}
                  >
                    Open
                  </StyledResultAction>
                ) : (
                  <StyledResultAction
                    variant="ghost"
                    className="focus-ring"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onAddBook(result);
                    }}
                  >
                    Add
                  </StyledResultAction>
                )}
                </div>
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
