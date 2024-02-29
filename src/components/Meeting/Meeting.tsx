import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useMediaQuery, useTheme } from '@mui/material';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
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
import { FirestoreBook, MeetingInfo } from '@types';
import { formatDate } from '@utils';
import { getBookImageUrl } from '@utils';

interface MeetingProps {
  meeting: MeetingInfo;
  books: FirestoreBook[];
}

export const Meeting = ({ meeting, books }: MeetingProps) => {
  const theme = useTheme();
  const smallToMid = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const lessThanSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [bookAnimationSwitch, setBookAnimationSwitch] = useState<boolean>(true);
  const [bookTitles, setBookTitles] = useState<string[]>();
  const [imageSize, setImageSize] = useState<{ w: string; h: string }>({
    w: '1008',
    h: '2016',
  });

  useEffect(() => {
    if (meeting?.date && isBefore(new Date(), meeting.date.toDate())) {
      const interval = setInterval(() => {
        setBookAnimationSwitch((prev) => !prev);
      }, 700);
      return () => {
        clearTimeout(interval);
      };
    }
  }, [meeting.date]);

  useEffect(() => {
    const newTitles: string[] = [];
    if (books?.length) {
      // Set book titles
      books?.forEach((book) => {
        if (book?.data?.volumeInfo?.title) {
          newTitles.push(book?.data?.volumeInfo?.title);
        }
      });

      if (newTitles?.length) {
        setBookTitles(newTitles);
      }

      // Set image sizes
      // Large image size
      let imageWidth = 992;
      if (lessThanSmall) {
        // Small image size
        imageWidth = 418;
      } else if (smallToMid) {
        // Mid image size
        imageWidth = 736;
      }

      const calculatedImageWidth = imageWidth / books.length;
      const calculatedImageHeight = calculatedImageWidth * 2;

      setImageSize({
        w: calculatedImageWidth.toString(),
        h: calculatedImageHeight.toString(),
      });
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
                  url={getBookImageUrl(book.data.id, imageSize)}
                />
              )
          )}
      </StyledBackgroundImageContainer>

      <StyledMeetingContent>
        <StyledMeetingHeader id="meeting-header">
          <StyledHeaderLeft>
            <StyledDate>{meeting.date && formatDate(meeting.date)}</StyledDate>
            <StyledLocation>@{meeting?.location?.remoteInfo ? 'Remote' : meeting.location?.user?.displayName}</StyledLocation>
          </StyledHeaderLeft>
          {meeting?.date && isBefore(new Date(), meeting.date.toDate()) ? (
            <div title="Currently active">
              {bookAnimationSwitch ? <MenuBookIcon /> : <AutoStoriesIcon />}
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
