import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { isBefore } from 'date-fns';
import React, { useEffect, useState } from 'react';
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
interface MeetingProps {
  meeting: MeetingInfo;
  books: FirestoreBook[];
}

export const Meeting = ({ meeting, books }: MeetingProps) => {
  const [currentDate, setCurrentDate] = useState<Date>();
  const [bookAnimationSwitch, setBookAnimationSwitch] = useState<boolean>(true);
  const [bookTitles, setBookTitles] = useState<string[]>();
  const [imageSize, setImageSize] = useState<string>();

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
    books?.forEach((book) => {
      if (book?.data?.volumeInfo?.title) {
        newTitles.push(book?.data?.volumeInfo?.title);
      }
    });
    if (newTitles) {
      setBookTitles(newTitles);
    }
  }, [books]);

  useEffect(() => {
    if (books.length) {
      const imageWidth = 1008 / books.length;
      const imageHeight = imageWidth * 2;

      const imageSizeString = `w${imageWidth.toString()}-h${imageHeight.toString()}`;

      console.log(`Length: ${books.length}. Image size: ${imageSizeString}`);

      setImageSize(imageSizeString);
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
                  src={`https://books.google.com/books/publisher/content/images/frontcover/${book.data.id}?fife=${imageSize}&source=gbs_api`}
                />
              )
          )}
      </StyledBackgroundImageContainer>

      <StyledMeetingContent>
        <StyledMeetingHeader id="meeting-header">
          <StyledHeaderLeft>
            <StyledDate>{meeting.date}</StyledDate>
            <StyledLocation>@{meeting.location}</StyledLocation>
          </StyledHeaderLeft>
          {currentDate &&
          meeting?.date &&
          isBefore(currentDate, new Date(meeting.date)) ? (
            <div title="Currently active">
              {bookAnimationSwitch ? <MenuBookIcon /> : <AutoStoriesIcon />}
            </div>
          ) : null}
        </StyledMeetingHeader>
        <StyledMeetingBottom id="meeting-bottom">
          <StyledReadingList>
            Reading: {bookTitles?.join(', ')}
          </StyledReadingList>
        </StyledMeetingBottom>
      </StyledMeetingContent>
    </StyledMeeting>
  );
};
