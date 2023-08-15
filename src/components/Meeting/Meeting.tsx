import { useEffect, useState } from 'react';
import { MeetingInfo } from '../../pages';
import {
  StyledDate,
  StyledLocation,
  StyledMeeting,
  StyledMeetingHeader,
  StyledReadingList,
} from '../../pages/Meetings/styles';
interface MeetingProps {
  meeting: MeetingInfo;
}

export const Meeting = ({ meeting }: MeetingProps) => {
  const [bookTitles, setBookTitles] = useState<string[]>();
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
      <StyledMeetingHeader>
        <StyledDate>{meeting.date}</StyledDate>
        <StyledLocation>@{meeting.location}</StyledLocation>
        <StyledReadingList>Reading list: {bookTitles?.join(', ')}</StyledReadingList>
      </StyledMeetingHeader>
    </StyledMeeting>
  );
};
