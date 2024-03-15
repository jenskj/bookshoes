import { BookCover, BookHeader } from '@components';
import { FirestoreBook } from '@types';
import { StyledBookCard, StyledBookDetails } from './styles';

type BookProps = {
  book: FirestoreBook;
  showDetails?: boolean;
  onClick?: () => void;
};

export const BookListItem = ({
  book,
  showDetails = true,
  onClick,
}: BookProps) => {
  return (
    <StyledBookCard onClick={onClick}>
      <BookCover bookInfo={book.data} showStatus={true} />
      {showDetails && book?.data.volumeInfo ? (
        <StyledBookDetails>
          <BookHeader volumeInfo={book.data.volumeInfo} />
        </StyledBookDetails>
      ) : null}
    </StyledBookCard>
  );
};
