import { parseDate, updateBook } from '@utils';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { useBookStore } from './useBookStore';
import { useCurrentUserStore } from './useCurrentUserStore';
import { useMeetingStore } from './useMeetingStore';

export const useAutoMarkReadBooks = () => {
  const [dateChecked, setDateChecked] = useState(false);
  const { books } = useBookStore();
  const { meetings } = useMeetingStore();
  const { activeClub } = useCurrentUserStore();

  useEffect(() => {
    setDateChecked(false);
  }, [activeClub?.docId]);

  useEffect(() => {
    if (!activeClub?.docId || !meetings?.length || !books?.length || dateChecked) {
      return;
    }

    const pastMeetings: string[] = [];
    meetings.forEach((meeting) => {
      const date = parseDate(meeting?.data?.date);
      if (date && isBefore(date, Date.now())) {
        pastMeetings.push(meeting.docId);
      }
    });

    if (pastMeetings.length) {
      const booksToUpdate: string[] = [];
      books.forEach((book) => {
        if (
          book?.data?.scheduledMeetings?.length &&
          book.docId &&
          book.data.scheduledMeetings.every((meetingId) =>
            pastMeetings.includes(meetingId)
          ) &&
          book.data.readStatus === 'reading'
        ) {
          booksToUpdate.push(book.docId);
        }
      });

      booksToUpdate.forEach((bookId) => {
        updateBook(activeClub.docId, bookId, { readStatus: 'read' });
      });
    }

    setDateChecked(true);
  }, [activeClub?.docId, books, dateChecked, meetings]);
};
