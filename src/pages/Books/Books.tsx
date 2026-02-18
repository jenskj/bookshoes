import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CatalogBookCandidate } from '@types';
import { StyledBooks, StyledLibraryLayout } from './boardStyles';
import { BookLaneBoard } from './BookLaneBoard';
import { DiscoverBooksPanel } from './DiscoverBooksPanel';
import { useKanbanBoard } from './useKanbanBoard';

export const Books = () => {
  const navigate = useNavigate();
  const {
    activeClub,
    onAddCustomBook,
    books,
    lanes,
    onAddSearchResult,
    onDrop,
    onSearch,
    moveBookToLane,
    searchLoading,
    searchResults,
    searchTerm,
    setDragBookId,
    setSearchTerm,
  } = useKanbanBoard();

  const handleBoardDrop = useCallback(
    (lane: Parameters<typeof onDrop>[0]) => {
      void onDrop(lane);
    },
    [onDrop]
  );

  const handleBookMove = useCallback(
    (book: Parameters<typeof moveBookToLane>[0], lane: Parameters<typeof moveBookToLane>[1]) => {
      void moveBookToLane(book, lane);
    },
    [moveBookToLane]
  );

  const handleOpenBookFromBoard = useCallback(
    (bookDocId: string) => {
      navigate(`/books/${bookDocId}`);
    },
    [navigate]
  );

  const handleOpenBookFromSearch = useCallback(
    (candidate: CatalogBookCandidate, existingDocId?: string) => {
      if (existingDocId) {
        navigate(`/books/${existingDocId}`);
        return;
      }
      navigate(`/books/${candidate.source}:${candidate.sourceBookId}`, {
        state: { candidate },
      });
    },
    [navigate]
  );

  return (
    <StyledBooks>
      <StyledLibraryLayout>
        <BookLaneBoard
          lanes={lanes}
          onDrop={handleBoardDrop}
          onBookMove={handleBookMove}
          onBookOpen={handleOpenBookFromBoard}
          onDragStart={setDragBookId}
        />

        <DiscoverBooksPanel
          activeClubSelected={Boolean(activeClub?.docId)}
          books={books}
          results={searchResults}
          searchTerm={searchTerm}
          searchLoading={searchLoading}
          onSearchTermChange={setSearchTerm}
          onSearch={onSearch}
          onOpenBook={handleOpenBookFromSearch}
          onAddBook={onAddSearchResult}
          onAddCustomBook={onAddCustomBook}
        />
      </StyledLibraryLayout>
    </StyledBooks>
  );
};
