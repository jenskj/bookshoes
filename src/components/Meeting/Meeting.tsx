import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useCurrentUserStore } from '@hooks';
import { isBefore } from 'date-fns';
import { useMemo } from 'react';
import {
  StyledBackgroundImage,
  StyledBackgroundImageContainer,
  StyledDate,
  StyledHeaderLeft,
  StyledLocation,
  StyledMeeting,
  StyledMeetingBottom,
  StyledMeetingContent,
  StyledMeetingHeader,
  StyledReadingList,
} from '@pages/Meetings/styles';
import { Book, MeetingInfo } from '@types';
import { formatDate, parseDate } from '@utils';
import { getBookImageUrl } from '@utils';

interface MeetingProps {
  meeting: MeetingInfo;
  books: Book[];
}

export const Meeting = ({ meeting, books }: MeetingProps) => {
  const dateTimeSettings = useCurrentUserStore((state) => state.settings.dateTime);
  const bookTitles = useMemo(() => {
    return books
      .map((book) => book?.data?.volumeInfo?.title)
      .filter((title): title is string => Boolean(title));
  }, [books]);

  const imageSize = useMemo(() => {
    const safeBookAmount = Math.max(books.length, 1);
    const width = Math.max(220, Math.floor(960 / safeBookAmount));
    return {
      w: `${width}`,
      h: `${width * 2}`,
    };
  }, [books.length]);

  const meetingDate = parseDate(meeting?.date);
  const isUpcoming = meetingDate ? isBefore(new Date(), meetingDate) : false;

  return (
    <StyledMeeting>
      <StyledBackgroundImageContainer bookAmount={books.length}>
        {imageSize &&
          books?.map(
            (book) =>
              book.docId && (
                <StyledBackgroundImage
                  key={book.docId}
                  id="background-image"
                  url={getBookImageUrl(book.data, imageSize)}
                />
              )
          )}
      </StyledBackgroundImageContainer>

      <StyledMeetingContent>
        <StyledMeetingHeader id="meeting-header">
          <StyledHeaderLeft>
            <StyledDate>
              {meeting?.date ? formatDate(meeting.date, false, dateTimeSettings) : ''}
            </StyledDate>
            <StyledLocation>@{meeting?.location?.remoteInfo ? 'Remote' : meeting.location?.user?.displayName}</StyledLocation>
          </StyledHeaderLeft>
          {isUpcoming ? (
            <div title="Currently active">
              <AutoStoriesIcon />
            </div>
          ) : null}
        </StyledMeetingHeader>
        <StyledMeetingBottom id="meeting-bottom">
          <StyledReadingList>
            {bookTitles?.length ? (
              <span>Reading: {bookTitles?.join(', ')}</span>
            ) : (
              <span>No books added</span>
            )}
          </StyledReadingList>
        </StyledMeetingBottom>
      </StyledMeetingContent>
    </StyledMeeting>
  );
};
