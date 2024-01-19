import { useState } from 'react';
import { ProgressBarList, Rating } from '..';
import { BookForm } from './BookForm';
import { BookListItem } from './BookListItem';
import {
  StyledAuthor,
  StyledBookInfoCard,
  StyledBookStatusDetails,
  StyledHeader,
  StyledHr,
  StyledInfoList,
  StyledSection,
  StyledSectionTitle,
  StyledTitle,
} from './styles';
import { FirestoreBook } from '../../types';

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
              By:&nbsp;<span>{book.data.volumeInfo?.authors.join(',')}</span>
            </StyledAuthor>
          </StyledHeader>

          <StyledInfoList>
            <StyledSection>
              <StyledSectionTitle>Ratings</StyledSectionTitle>
              {/* To do: Build rating system and component */}
              <Rating />
            </StyledSection>
            <StyledSection>
              <StyledSectionTitle>Reading progress</StyledSectionTitle>
              <ProgressBarList book={book} />
            </StyledSection>
          </StyledInfoList>
        </StyledBookInfoCard>
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
