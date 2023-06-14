import { FirestoreBook } from '../../pages/Books/Books';
import {
  StyledBookAuthor,
  StyledBookCard,
  StyledBookTitle
} from './styles';

type BookProps = {
  book: FirestoreBook;
};

export const BookListItem = ({
  book: {
    data: { id, volumeInfo },
  },
}: BookProps) => {
  return (
    <StyledBookCard coverUrl={volumeInfo?.imageLinks?.thumbnail || ''} key={id}>
      <StyledBookTitle title={volumeInfo?.title}>
        {volumeInfo?.title}
      </StyledBookTitle>
      <StyledBookAuthor
        title={volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
      >
        {volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
      </StyledBookAuthor>
    </StyledBookCard>
  );
};
