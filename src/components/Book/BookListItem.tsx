import { FirestoreBook } from '../../pages/Books/Books';
import { getBookImageUrl } from '../../utils/getBookImageUrl';
import { BookStatusIcon } from './BookStatusIcon';
import {
  StyledBookAuthor,
  StyledBookCard,
  StyledBookCover,
  StyledBookTitle,
} from './styles';

type BookProps = {
  book: FirestoreBook;
  showDetails?: boolean;
  onClick?: () => void;
};

export const BookListItem = ({
  book: {
    data: { id, volumeInfo, readStatus },
  },
  showDetails = true,
  onClick,
}: BookProps) => {
  return (
    <StyledBookCard onClick={onClick}>
      <StyledBookCover src={getBookImageUrl(id)} alt={volumeInfo?.title} />

      {showDetails && (
        <>
          <StyledBookTitle title={volumeInfo?.title}>
            {volumeInfo?.title}
          </StyledBookTitle>
          <StyledBookAuthor
            title={
              volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'
            }
          >
            {volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
          </StyledBookAuthor>
          <BookStatusIcon readStatus={readStatus}></BookStatusIcon>
        </>
      )}
    </StyledBookCard>
  );
};
