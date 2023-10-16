import { FirestoreBook } from '../../types';
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
  large?: boolean;
  onClick?: () => void;
};

export const BookListItem = ({
  book: {
    data: { id, volumeInfo, readStatus },
  },
  showDetails = true,
  large = false,
  onClick,
}: BookProps) => {
  return (
    <StyledBookCard onClick={onClick}>
      <StyledBookCover
        src={getBookImageUrl(id, large ? { w: '500', h: '1000' } : undefined)}
        alt={volumeInfo?.title}
      />

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
