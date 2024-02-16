import { useState } from 'react';
import { ProgressBarList, RatingList } from '..';
import { FirestoreBook } from '../../types';
import { BookForm } from './BookForm';
import { BookListItem } from './BookListItem';
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
  StyledSectionTitle,
  StyledTitle,
} from './styles';

interface BookStatusDetailsProps {
  book: FirestoreBook;
  bookAmount: number;
}

export const BookStatusDetails = ({
  book,
  bookAmount,
}: BookStatusDetailsProps) => {
  const [activeBook, setActiveBook] = useState<FirestoreBook | undefined>();
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
          <StyledBookImageContainer>
            <BookListItem
              book={book}
              showDetails={false}
              large={Boolean(bookAmount <= 1)}
              onClick={() => setActiveBook(book)}
            />
            <RatingList book={book} />
          </StyledBookImageContainer>
          <StyledBookBulletinBoard></StyledBookBulletinBoard>
        </StyledBookInfoMiddle>
        <StyledHr />
        <StyledBookInfoBottom>
          <StyledSectionTitle>Reading progress</StyledSectionTitle>
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
