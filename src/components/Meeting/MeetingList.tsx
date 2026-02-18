import { useMemo } from 'react';
import { Book, Meeting as MeetingType } from '@types';
import { parseDate } from '@utils';
import { Meeting } from './Meeting';
import {
  StyledLink,
  StyledMeetingContainer,
  StyledMeetingList,
} from './styles';

interface MeetingListProps {
  books: Book[];
  meetings: MeetingType[];
}

export const MeetingList = ({ books, meetings }: MeetingListProps) => {
  const sortedMeetings = useMemo(() => {
    if (!meetings?.length) {
      return [];
    }
    return [...meetings]
      .sort((a, b) => {
        const dateA = parseDate(a.data.date)?.getTime();
        const dateB = parseDate(b.data.date)?.getTime();
        if (dateA != null && dateB != null) {
          return dateA > dateB ? 1 : -1;
        }
        return -1;
      })
      .reverse();
  }, [meetings]);

  const meetingBooksById = useMemo(() => {
    const booksByMeetingId = new Map<string, Book[]>();
    sortedMeetings.forEach((meeting) => {
      booksByMeetingId.set(meeting.docId, []);
    });
    books.forEach((book) => {
      (book.data.scheduledMeetings ?? []).forEach((meetingId) => {
        const meetingBooks = booksByMeetingId.get(meetingId);
        if (meetingBooks) {
          meetingBooks.push(book);
        }
      });
    });
    return booksByMeetingId;
  }, [books, sortedMeetings]);

  return (
    <StyledMeetingList>
      <StyledMeetingContainer>
        {sortedMeetings.map((meeting) => (
          <StyledLink key={meeting.docId} to={`/meetings/${meeting.docId}`}>
            <Meeting
              meeting={meeting.data}
              books={meetingBooksById.get(meeting.docId) ?? []}
            />
          </StyledLink>
        ))}
      </StyledMeetingContainer>
    </StyledMeetingList>
  );
};
