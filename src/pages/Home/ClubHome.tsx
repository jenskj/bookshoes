import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { EmptyFallbackLink, ExtendPreviewButton } from '@components';
import { useBookStore } from '../../hooks';
import { FirestoreBook } from '../../types';
import { Meetings } from '../Meetings/Meetings';
import {
  StyledBookCarousel,
  StyledPageSection,
  StyledPageTitle,
} from '../styles';
import { MemberList } from '@components';

export const ClubHome = () => {
  const { books } = useBookStore();
  const [recentBooks, setRecentBooks] = useState<FirestoreBook[]>();

  useEffect(() => {
    if (books) {
      const readBooks = books.filter((book) => book.data.readStatus === 'read');
      if (readBooks) {
        readBooks.sort((a, b) => {
          if (
            a.data.addedDate &&
            b.data.addedDate &&
            // To do: make this sort on the meeting date instead
            isBefore(new Date(a.data.addedDate), new Date(b.data.addedDate))
          ) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      setRecentBooks(readBooks.slice(0, 4));
    }
  }, [books]);

  return (
    <>
      <StyledPageSection>
        <StyledPageTitle>Upcoming meetings</StyledPageTitle>
        <Meetings isPreview={true} />
      </StyledPageSection>

      <StyledPageSection>
        <StyledPageTitle>Recently read books</StyledPageTitle>
        {recentBooks?.length ? (
          <>
            <StyledBookCarousel>
              {recentBooks?.map((book) => (
                // To do: make BookList.tsx and make it work for with BookListItem for this too
                <img
                  key={book.docId}
                  src={book.data.volumeInfo?.imageLinks?.thumbnail}
                  alt=""
                />
              ))}
              <ExtendPreviewButton destination="books" />
            </StyledBookCarousel>
          </>
        ) : (
          <EmptyFallbackLink
            link={'books'}
            title="No books read yet"
            buttonText="Find books to read"
          />
        )}
      </StyledPageSection>
      <StyledPageSection>
        <StyledPageTitle>Members</StyledPageTitle>
        <MemberList />
      </StyledPageSection>
    </>

    // To do: find out how the news section should figure on the active home page
    // <StyledNewsSection>
    //   <StyledPageTitle>News</StyledPageTitle>
    //   <Updates />
    // </StyledNewsSection>
  );
};
