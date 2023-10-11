import { useState } from 'react';
import { Progress, Rating } from '..';
import { FirestoreBook } from '../../pages';
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

interface BookStatusDetailsProps {
  book: FirestoreBook;
}

export const BookStatusDetails = ({ book }: BookStatusDetailsProps) => {
  const [activeBook, setActiveBook] = useState<FirestoreBook | undefined>();
  return (
    <>
      <StyledBookStatusDetails>
        <BookListItem
          book={book}
          showDetails={false}
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
              {/* To do: Build progress system and component */}
              <Progress />
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
