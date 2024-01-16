import React, { useEffect, useState } from 'react';
import { Meeting } from './Meeting';
import {
  StyledMeetingList,
  StyledMeetingContainer,
  StyledLink,
} from './styles';
import { FirestoreMeeting, FirestoreBook } from '../../types';

interface MeetingListProps {
  meetings?: FirestoreMeeting[];
  books: FirestoreBook[];
}

export const MeetingList = ({ meetings, books }: MeetingListProps) => {
  const [sortedMeetings, setSortedMeetings] = useState<
    FirestoreMeeting[] | null
  >(null);
  useEffect(() => {
    if (meetings?.length) {
      setSortedMeetings(
        meetings
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
  }, [meetings, setSortedMeetings]);

  return (
    <StyledMeetingList>
      <StyledMeetingContainer>
        {sortedMeetings?.map((meeting) => (
          <StyledLink key={meeting.docId} to={`/meetings/${meeting.docId}`}>
            <Meeting
              meeting={meeting.data}
              books={books.filter(
                (book) => book.data.scheduledMeeting === meeting.docId
              )}
            />
          </StyledLink>
        ))}
      </StyledMeetingContainer>
    </StyledMeetingList>
  );
};
