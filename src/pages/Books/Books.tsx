import { useNavigate } from 'react-router-dom';
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

  return (
    <StyledBooks className="fade-up">
      <StyledLibraryLayout>
        <BookLaneBoard
          lanes={lanes}
          onDrop={(lane) => void onDrop(lane)}
          onBookMove={(book, lane) => void moveBookToLane(book, lane)}
          onBookOpen={(bookDocId) => navigate(`/books/${bookDocId}`)}
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
          onOpenBook={(candidate, existingDocId) => {
            if (existingDocId) {
              navigate(`/books/${existingDocId}`);
              return;
            }
            navigate(`/books/${candidate.source}:${candidate.sourceBookId}`, {
              state: { candidate },
            });
          }}
          onAddBook={onAddSearchResult}
          onAddCustomBook={onAddCustomBook}
        />
      </StyledLibraryLayout>
    </StyledBooks>
  );
};
