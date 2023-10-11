import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { FirestoreBook, MeetingInfo } from '../../pages';
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
} from '../../pages/Meetings/styles';
import { formatDate } from '../../utils/formatDate';
import { getBookImageUrl } from '../../utils/getBookImageUrl';
interface MeetingProps {
  meeting: MeetingInfo;
  books: FirestoreBook[];
}

export const Meeting = ({ meeting, books }: MeetingProps) => {
  const [currentDate, setCurrentDate] = useState<Date>();
  const [bookAnimationSwitch, setBookAnimationSwitch] = useState<boolean>(true);
  const [bookTitles, setBookTitles] = useState<string[]>();
  const [imageSize, setImageSize] = useState<{ w: string; h: string }>({
    w: '1008',
    h: '2016',
  });

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBookAnimationSwitch((prev) => !prev);
    }, 700);
    return () => {
      clearTimeout(interval);
    };
  }, []);

  useEffect(() => {
    const newTitles: string[] = [];
    if (books?.length) {
      books?.forEach((book) => {
        if (book?.data?.volumeInfo?.title) {
          newTitles.push(book?.data?.volumeInfo?.title);
        }
      });
    }
    if (newTitles?.length) {
      setBookTitles(newTitles);
    }
  }, [books]);

  useEffect(() => {
    if (books.length) {
      const imageWidth = 1008 / books.length;
      const imageHeight = imageWidth * 2;

      setImageSize({ w: imageWidth.toString(), h: imageHeight.toString() });
    }
  }, [books]);

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
                  src={getBookImageUrl(book.data.id, imageSize)}
                />
              )
          )}
      </StyledBackgroundImageContainer>

      <StyledMeetingContent>
        <StyledMeetingHeader id="meeting-header">
          <StyledHeaderLeft>
            <StyledDate>{meeting.date && formatDate(meeting.date)}</StyledDate>
            <StyledLocation>@{meeting.location}</StyledLocation>
          </StyledHeaderLeft>
          {currentDate &&
          meeting?.date &&
          isBefore(currentDate, meeting.date.toDate()) ? (
            <div title="Currently active">
              {bookAnimationSwitch ? <MenuBookIcon /> : <AutoStoriesIcon />}
            </div>
          ) : null}
        </StyledMeetingHeader>
        <StyledMeetingBottom id="meeting-bottom">
          <StyledReadingList>
            {bookTitles?.length ? (
              <span>Reading: {bookTitles?.join(', ')}</span>
            ) : <span>No books added</span>}
          </StyledReadingList>
        </StyledMeetingBottom>
      </StyledMeetingContent>
    </StyledMeeting>
  );
};
