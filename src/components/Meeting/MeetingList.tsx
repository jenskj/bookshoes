import { useEffect, useState } from 'react';
import { FirestoreBook, FirestoreMeeting } from '@types';
import { parseDate } from '@utils';
import { Meeting } from './Meeting';
import {
  StyledLink,
  StyledMeetingContainer,
  StyledMeetingList,
} from './styles';

interface MeetingListProps {
  books: FirestoreBook[];
  meetings: FirestoreMeeting[];
}

export const MeetingList = ({ books, meetings }: MeetingListProps) => {
  const [sortedMeetings, setSortedMeetings] = useState<
    FirestoreMeeting[] | null
  >(null);
  useEffect(() => {
    if (meetings?.length) {
      setSortedMeetings(
        [...meetings]
          .sort((a, b) => {
            const dateA = parseDate(a.data.date)?.getTime();
            const dateB = parseDate(b.data.date)?.getTime();
            if (dateA != null && dateB != null) {
              return dateA > dateB ? 1 : -1;
            }
            return -1;
          })
          .reverse()
      );
    }
  }, [meetings]);

  return (
    <StyledMeetingList>
      <StyledMeetingContainer>
        {sortedMeetings?.map((meeting) => (
          <StyledLink key={meeting.docId} to={`/meetings/${meeting.docId}`}>
            <Meeting
              meeting={meeting.data}
              books={books.filter(
                (book) => book.data.scheduledMeetings?.includes(meeting.docId)
              )}
            />
          </StyledLink>
        ))}
      </StyledMeetingContainer>
    </StyledMeetingList>
  );
};
