import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookCover } from '@components';
import { useBookStore, useCurrentUserStore } from '@hooks';
import { Book, ReadStatus } from '@types';
import { AddBookPayload, addBook, getBooksBySearch, updateBook } from '@utils';
import {
  StyledBoard,
  StyledBooks,
  StyledDiscoverPanel,
  StyledLane,
  StyledLaneHeader,
  StyledLaneList,
  StyledLibraryLayout,
  StyledMoveButton,
  StyledResultAction,
  StyledResultCard,
  StyledResultGrid,
  StyledSearchButton,
  StyledSearchInput,
  StyledSearchRow,
  StyledStamp,
  StyledTileActions,
  StyledTileBody,
  StyledTileMeta,
  StyledTileTitle,
  StyledBookTile,
} from './styles';

type LaneKey = 'unread' | 'candidate' | 'read';

interface LaneConfig {
  key: LaneKey;
  title: string;
}

const LANE_CONFIG: LaneConfig[] = [
  { key: 'unread', title: 'To Read' },
  { key: 'candidate', title: 'Voting' },
  { key: 'read', title: 'Read' },
];

const getLaneBooks = (books: Book[], lane: LaneKey) => {
  if (lane === 'candidate') {
    return books.filter(
      (book) =>
        !book.data.inactive &&
        (book.data.readStatus === 'candidate' || book.data.readStatus === 'reading')
    );
  }
  return books.filter(
    (book) => !book.data.inactive && (book.data.readStatus || 'unread') === lane
  );
};

const mapLaneToReadStatus = (lane: LaneKey): ReadStatus =>
  lane === 'candidate' ? 'candidate' : lane;

export const Books = () => {
  const { books } = useBookStore();
  const { activeClub } = useCurrentUserStore();
  const navigate = useNavigate();

  const [dragBookId, setDragBookId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const lanes = useMemo(
    () =>
      LANE_CONFIG.map((lane) => ({
        ...lane,
        books: getLaneBooks(books, lane.key),
      })),
    [books]
  );

  const moveBookToLane = async (book: Book, lane: LaneKey) => {
    if (!activeClub?.docId || !book.docId) return;
    const targetStatus = mapLaneToReadStatus(lane);
    if (book.data.readStatus === targetStatus) return;
    await updateBook(activeClub.docId, book.docId, { readStatus: targetStatus });
  };

  const onDrop = async (lane: LaneKey) => {
    const book = books.find((entry) => entry.docId === dragBookId);
    if (!book) return;
    await moveBookToLane(book, lane);
    setDragBookId(null);
  };

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    const found = await getBooksBySearch(searchTerm.trim());
    setSearchResults(found || []);
    setSearchLoading(false);
  };

  const onAddSearchResult = async (book: Book) => {
    if (!activeClub?.docId) return;
    const existing = books.find((entry) => entry.data.id === book.data.id);
    if (existing?.docId) {
      await updateBook(activeClub.docId, existing.docId, { inactive: false });
      return;
    }
    const payload: AddBookPayload = {
      volumeInfo: book.data.volumeInfo as Record<string, unknown>,
      id: book.data.id,
      addedDate: new Date().toISOString(),
      readStatus: 'candidate',
      ratings: [],
      progressReports: [],
      scheduledMeetings: [],
    };
    await addBook(activeClub.docId, payload);
  };

  return (
    <StyledBooks className="fade-up">
      <StyledLibraryLayout>
        <StyledBoard>
          {lanes.map((lane) => (
            <StyledLane
              key={lane.key}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => void onDrop(lane.key)}
            >
              <StyledLaneHeader>
                <h3>{lane.title}</h3>
                <span>{lane.books.length}</span>
              </StyledLaneHeader>
              <StyledLaneList>
                {lane.books.length ? (
                  lane.books.map((book) => (
                    <StyledBookTile
                      key={book.docId || book.data.id}
                      draggable={Boolean(book.docId)}
                      onDragStart={() => setDragBookId(book.docId || null)}
                      onClick={() => navigate(`/books/${book.data.id}`)}
                    >
                      {book.data.readStatus === 'reading' ? (
                        <StyledStamp>Current Pick</StyledStamp>
                      ) : null}
                      <BookCover bookInfo={book.data} />
                      <StyledTileBody>
                        <StyledTileTitle>{book.data.volumeInfo?.title}</StyledTileTitle>
                        <StyledTileMeta>
                          {book.data.volumeInfo?.authors?.join(', ') || 'Unknown author'}
                        </StyledTileMeta>
                        <StyledTileActions>
                          {LANE_CONFIG.filter((entry) => entry.key !== lane.key).map(
                            (target) => (
                              <StyledMoveButton
                                key={`${book.docId}-${target.key}`}
                                type="button"
                                className="focus-ring"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void moveBookToLane(book, target.key);
                                }}
                              >
                                {target.title}
                              </StyledMoveButton>
                            )
                          )}
                        </StyledTileActions>
                      </StyledTileBody>
                    </StyledBookTile>
                  ))
                ) : (
                  <p>No books in this lane yet.</p>
                )}
              </StyledLaneList>
            </StyledLane>
          ))}
        </StyledBoard>

        <StyledDiscoverPanel>
          <h3>Discover Books</h3>
          <p className="mono">Search and push titles into the Voting lane.</p>
          <StyledSearchRow onSubmit={(event) => void onSearch(event)}>
            <StyledSearchInput
              className="focus-ring"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or isbn"
            />
            <StyledSearchButton
              className="focus-ring"
              type="submit"
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching…' : 'Search'}
            </StyledSearchButton>
          </StyledSearchRow>
          <StyledResultGrid>
            {searchResults.length ? (
              searchResults.map((book) => {
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
                        type="button"
                        className="focus-ring"
                        onClick={() => navigate(`/books/${book.data.id}`)}
                      >
                        Open
                      </StyledResultAction>
                    ) : (
                      <StyledResultAction
                        type="button"
                        className="focus-ring"
                        onClick={() => void onAddSearchResult(book)}
                      >
                        Add
                      </StyledResultAction>
                    )}
                  </StyledResultCard>
                );
              })
            ) : (
              <p>
                No search results yet. Start by querying a book to add it into voting.
              </p>
            )}
          </StyledResultGrid>
          {!activeClub ? (
            <p>
              Select an active club in the context bar before adding books to a shared
              lane.
            </p>
          ) : null}
          <Link to="/meetings" className="mono">
            Move to meeting planning →
          </Link>
        </StyledDiscoverPanel>
      </StyledLibraryLayout>
    </StyledBooks>
  );
};
