import { BookCover, ProgressBarList, RatingList } from '@components';
import { StyledSectionHeading } from '@pages/styles';
import { Book } from '@types';
import { useState } from 'react';
import { BookForm } from './BookForm';
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
  bookAmount: number;
}

export const BookStatusDetails = ({
  book,
  bookAmount,
}: BookStatusDetailsProps) => {
  const [activeBook, setActiveBook] = useState<Book | undefined>();
  return (
    <>
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
          <StyledBookBulletinBoard></StyledBookBulletinBoard>
        </StyledBookInfoMiddle>
        <StyledHr />
        <StyledBookInfoBottom>
          <StyledSectionHeading>Reading progress</StyledSectionHeading>
          <ProgressBarList book={book} />
        </StyledBookInfoBottom>
      </StyledBookStatusDetails>
      {activeBook && (
        <BookForm
          book={activeBook}
          open={Boolean(activeBook)}
          onClose={() => setActiveBook(undefined)}
        />
      )}
    </>
  );
};
