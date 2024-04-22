import { useEffect, useState } from 'react';
import { FirestoreBook, FirestoreMeeting } from '@types';
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
            const dateA = a.data.date?.seconds;
            const dateB = b.data.date?.seconds;
            if (dateA && dateB) {
              if (dateA > dateB) {
                return 1;
              } else {
                return -1;
              }
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
             
            />
          </StyledLink>
        ))}
      </StyledMeetingContainer>
    </StyledMeetingList>
  );
};
