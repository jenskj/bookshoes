import { useEffect, useState } from 'react';
import { MeetingInfo } from '../../pages';
import { StyledMeetingHeader } from '../../pages/Meetings/styles';
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
    <StyledMeetingHeader>{`Meeting at ${meeting.location} on the ${
      meeting.date
    }. We will be reading ${bookTitles?.join(', ')}`}</StyledMeetingHeader>
  );
};
