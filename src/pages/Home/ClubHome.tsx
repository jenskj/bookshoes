import { EmptyFallbackLink, ExtendPreviewButton, MemberList } from '@components';
import { useBookStore } from '@hooks';
import { Meetings } from '@pages';
import {
  StyledBookCarousel,
  StyledPageSection,
  StyledSectionHeading
} from '@pages/styles';
import { FirestoreBook } from '@types';
import { getBookImageUrl } from '@utils';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StyledPreviewSection } from './styles';

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
      <StyledPreviewSection>
        <StyledSectionHeading>Upcoming meetings</StyledSectionHeading>
        <Meetings isPreview={true} />
      </StyledPreviewSection>

      <StyledPageSection>
        <StyledSectionHeading>Recently read books</StyledSectionHeading>
        {recentBooks?.length ? (
          <>
            <StyledBookCarousel>
              {recentBooks?.map((book) => (
                // To do: make BookList.tsx and make it work for with BookListItem for this too
                <Link to={`/books/${book.docId}`} key={book.docId}>
                  <img
                    src={getBookImageUrl(book.data.id)}
                    alt={book.data.volumeInfo?.title}
                  />
                </Link>
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
        <StyledSectionHeading>Members</StyledSectionHeading>
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
