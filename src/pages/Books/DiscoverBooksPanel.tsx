import { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BookCover } from '@components';
import { Book } from '@types';
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
  results: Book[];
  searchTerm: string;
  searchLoading: boolean;
  onSearchTermChange: (value: string) => void;
  onSearch: () => Promise<void>;
  onOpenBook: (googleBookId: string) => void;
  onAddBook: (book: Book) => Promise<void>;
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
}: DiscoverBooksPanelProps) => {
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
      <StyledResultGrid>
        {results.length ? (
          results.map((book) => {
            const exists = books.some((entry) => entry.data.id === book.data.id);
            return (
              <StyledResultCard key={book.data.id}>
                <BookCover bookInfo={book.data} />
                <div>
                  <StyledTileTitle>{book.data.volumeInfo?.title}</StyledTileTitle>
                  <StyledTileMeta>
                    {book.data.volumeInfo?.authors?.join(', ') || 'Unknown author'}
                  </StyledTileMeta>
                </div>
                {exists ? (
                  <StyledResultAction
                    variant="ghost"
                    className="focus-ring"
                    onClick={() => onOpenBook(book.data.id)}
                  >
                    Open
                  </StyledResultAction>
                ) : (
                  <StyledResultAction
                    variant="ghost"
                    className="focus-ring"
                    onClick={() => void onAddBook(book)}
                  >
                    Add
                  </StyledResultAction>
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
    </StyledDiscoverPanel>
  );
};
