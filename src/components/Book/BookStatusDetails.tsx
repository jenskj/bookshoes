import { useState } from 'react';
import { ProgressBarList, Rating } from '..';
import { FirestoreBook } from '../../types';
import { BookForm } from './BookForm';
import { BookListItem } from './BookListItem';
import {
  StyledAuthor,
  StyledBookInfoBottom,
  StyledBookInfoCard,
  StyledBookInfoTop,
  StyledBookStatusDetails,
  StyledHeader,
  StyledHr,
  StyledInfoList,
  StyledSection,
  StyledSectionTitle,
  StyledTitle
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
          <BookListItem
            book={book}
            showDetails={false}
            large={Boolean(bookAmount <= 1)}
            onClick={() => setActiveBook(book)}
          />
          <StyledBookInfoCard>
            <StyledHeader>
              <StyledTitle>{book.data.volumeInfo?.title}</StyledTitle>
              <StyledHr />
              <StyledAuthor>
                By:&nbsp;
                <span>{book.data.volumeInfo?.authors.join(',')}</span>
              </StyledAuthor>
            </StyledHeader>

            <StyledInfoList>
              <StyledSection>
                <StyledSectionTitle>Ratings</StyledSectionTitle>
                {/* To do: Build rating system and component */}
                <Rating />
              </StyledSection>
            </StyledInfoList>
          </StyledBookInfoCard>
        </StyledBookInfoTop>
        <StyledBookInfoBottom>
          <StyledSection>
            <StyledSectionTitle>Reading progress</StyledSectionTitle>
            <ProgressBarList book={book} />
          </StyledSection>
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
