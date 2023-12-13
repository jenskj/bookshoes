import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { EmptyFallbackLink, ExtendPreviewButton } from '../../components';
import { useBookStore, useMeetingStore } from '../../hooks';
import { FirestoreBook, FirestoreMeeting } from '../../types';
import { Meetings } from '../Meetings/Meetings';
import {
  StyledBookCarousel,
  StyledPageSection,
  StyledPageTitle,
} from '../styles';

export const ClubHome = () => {
  const { books } = useBookStore();
  const { meetings } = useMeetingStore();
  const [recentBooks, setRecentBooks] = useState<FirestoreBook[]>();
  const [displayedMeetings, setDisplayedMeetings] =
    useState<FirestoreMeeting[]>();

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

  useEffect(() => {
    if (meetings) {
      const meetingList: FirestoreMeeting[] = [];
      meetings.forEach((meeting) => {
        if (
          meeting.data.date &&
          isBefore(new Date(), meeting?.data.date?.toDate())
        ) {
          meetingList.push(meeting);
        }
        setDisplayedMeetings(meetingList);
      });
    }
  }, [meetings]);

  return (
    <>
      <StyledPageSection>
        {displayedMeetings?.length ? (
          <>
            <StyledPageTitle>Upcoming meetings</StyledPageTitle>
            <Meetings displayedMeetings={displayedMeetings} />
            <ExtendPreviewButton direction="vertical" destination="meetings" />
          </>
        ) : (
          <EmptyFallbackLink
            link={'meetings'}
            title="No upcoming meetings"
            buttonText="Go schedule one"
          />
        )}
      </StyledPageSection>

      <StyledPageSection>
        {recentBooks?.length ? (
          <>
            <StyledPageTitle>Recently read books</StyledPageTitle>
            <StyledBookCarousel>
              {recentBooks?.map((book) => (
                // To do: make BookList.tsx and make it work for with BookListItem for this too
                <img src={book.data.volumeInfo?.imageLinks?.thumbnail} alt="" />
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
        Coming soon...
      </StyledPageSection>
    </>

    // To do: find out how the news section should figure on the active home page
    // <StyledNewsSection>
    //   <StyledPageTitle>News</StyledPageTitle>
    //   <Updates />
    // </StyledNewsSection>
  );
};
