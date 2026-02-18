import { BookCover } from '@components';
import { Book } from '@types';
import {
  StyledBoard,
  StyledBookTile,
  StyledLane,
  StyledLaneHeader,
  StyledLaneList,
  StyledMoveButton,
  StyledStamp,
  StyledTileActions,
  StyledTileBody,
  StyledTileMeta,
  StyledTileTitle,
} from './boardStyles';
import { LANE_CONFIG, LaneKey } from './kanbanUtils';

interface LaneData {
  key: LaneKey;
  title: string;
  books: Book[];
}

interface BookLaneBoardProps {
  lanes: LaneData[];
  onDrop: (lane: LaneKey) => void;
  onBookMove: (book: Book, lane: LaneKey) => void;
  onBookOpen: (bookRouteId: string) => void;
  onDragStart: (bookId: string | null) => void;
}

export const BookLaneBoard = ({
  lanes,
  onDrop,
  onBookMove,
  onBookOpen,
  onDragStart,
}: BookLaneBoardProps) => {
  return (
    <StyledBoard>
      {lanes.map((lane) => (
        <StyledLane
          key={lane.key}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => onDrop(lane.key)}
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
                  onDragStart={() => onDragStart(book.docId || null)}
                  onClick={() => onBookOpen(book.docId ?? book.data.id)}
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
                            variant="ghost"
                            compact={true}
                            className="focus-ring"
                            onClick={(event) => {
                              event.stopPropagation();
                              onBookMove(book, target.key);
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
  );
};
