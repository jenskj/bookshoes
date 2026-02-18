import { BookCover, ProgressBarList, RatingList } from '@components';
import { StyledSectionHeading } from '@pages/styles';
import { Book } from '@types';
import {
  StyledAuthor,
  StyledBookBulletinBoard,
  StyledBookImageContainer,
  StyledBookInfo,
  StyledBookInfoBottom,
  StyledBookInfoMiddle,
  StyledBookInfoTop,
  StyledBookStatusDetails,
  StyledHr,
  StyledMiddleLeft,
  StyledTitle,
} from './styles';
import { Link } from 'react-router-dom';

interface BookStatusDetailsProps {
  book: Book;
}

export const BookStatusDetails = ({
  book,
}: BookStatusDetailsProps) => {
  return (
    <StyledBookStatusDetails>
      <StyledBookInfoTop>
        <StyledBookInfo>
          <StyledTitle>{book.data.volumeInfo?.title}</StyledTitle>
          <StyledAuthor>
            By:&nbsp;
            <span>{book.data.volumeInfo?.authors.join(',')}</span>
          </StyledAuthor>
        </StyledBookInfo>
      </StyledBookInfoTop>
      <StyledHr />
      <StyledBookInfoMiddle>
        <StyledMiddleLeft>
          <StyledBookImageContainer>
            <Link to={`/books/${book.data.id}`}>
              <BookCover bookInfo={book.data} size="L" />
            </Link>
          </StyledBookImageContainer>
          <RatingList book={book} />
        </StyledMiddleLeft>
        <StyledBookBulletinBoard />
      </StyledBookInfoMiddle>
      <StyledHr />
      <StyledBookInfoBottom>
        <StyledSectionHeading>Reading progress</StyledSectionHeading>
        <ProgressBarList book={book} />
      </StyledBookInfoBottom>
    </StyledBookStatusDetails>
  );
};
