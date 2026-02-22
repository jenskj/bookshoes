import { parseDate, updateBook } from '@utils';
import { useToast } from '@lib/ToastContext';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { useBookStore } from './useBookStore';
import { useCurrentUserStore } from './useCurrentUserStore';
import { useMeetingStore } from './useMeetingStore';

export const useAutoMarkReadBooks = () => {
  const { showError } = useToast();
  const [dateChecked, setDateChecked] = useState(false);
  const books = useBookStore((state) => state.books);
  const meetings = useMeetingStore((state) => state.meetings);
  const activeClub = useCurrentUserStore((state) => state.activeClub);
  const settings = useCurrentUserStore((state) => state.settings);

  useEffect(() => {
    setDateChecked(false);
  }, [activeClub?.docId]);

  useEffect(() => {
    if (!settings.automation.autoMarkReadWhenMeetingsPassed) {
      return;
    }
    if (!activeClub?.docId || !meetings?.length || !books?.length || dateChecked) {
      return;
    }
    const minimumScheduledMeetings =
      settings.automation.autoMarkReadMinimumScheduledMeetings;

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
          book.data.scheduledMeetings.length >= minimumScheduledMeetings &&
          book.data.scheduledMeetings.every((meetingId) =>
            pastMeetings.includes(meetingId)
          ) &&
          book.data.readStatus === 'reading'
        ) {
          booksToUpdate.push(book.docId);
        }
      });

      void Promise.allSettled(
        booksToUpdate.map((bookId) =>
          updateBook(activeClub.docId, bookId, { readStatus: 'read' })
        )
      ).then((results) => {
        const hasFailures = results.some((result) => result.status === 'rejected');
        if (hasFailures) {
          showError('Some books could not be auto-marked as read.');
        }
      });
    }

    setDateChecked(true);
  }, [activeClub?.docId, books, dateChecked, meetings, settings.automation, showError]);
};
