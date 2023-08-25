import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { isBefore } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { MeetingInfo } from '../../pages';
import {
  StyledBackgroundImage,
  StyledBackgroundImageContainer,
  StyledDate,
  StyledLocation,
  StyledMeeting,
  StyledMeetingBottom,
  StyledMeetingContent,
  StyledMeetingHeader,
  StyledReadingList,
} from '../../pages/Meetings/styles';
interface MeetingProps {
  meeting: MeetingInfo;
}

export const Meeting = ({ meeting }: MeetingProps) => {
  const [currentDate, setCurrentDate] = useState<Date>();
  const [bookAnimationSwitch, setBookAnimationSwitch] = useState<boolean>(true);
  const [bookTitles, setBookTitles] = useState<string[]>();

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
    meeting.books?.forEach((book) => {
      if (book?.data?.volumeInfo?.title) {
        newTitles.push(book?.data?.volumeInfo?.title);
      }
    });
    if (newTitles) {
      setBookTitles(newTitles);
    }
  }, [meeting?.books]);
  
  return (
    <StyledMeeting>
      <StyledBackgroundImageContainer>
        {meeting?.books?.map((book) => (
          <StyledBackgroundImage
            key={book.docId}
            src={book.data.volumeInfo?.imageLinks?.thumbnail}
          />
        ))}
      </StyledBackgroundImageContainer>
      <StyledMeetingContent>
        <StyledMeetingHeader>
          <StyledDate>{meeting.date}</StyledDate>

          {currentDate &&
          meeting?.date &&
          isBefore(currentDate, new Date(meeting.date)) ? (
            <div title="Currently active">
              {bookAnimationSwitch ? <MenuBookIcon /> : <AutoStoriesIcon />}
            </div>
          ) : null}
        </StyledMeetingHeader>
        <StyledMeetingBottom>
          <StyledLocation>@{meeting.location}</StyledLocation>
          <StyledReadingList>
            Reading: {bookTitles?.join(', ')}
          </StyledReadingList>
        </StyledMeetingBottom>
      </StyledMeetingContent>
    </StyledMeeting>
  );
};
