import { BookCover, BookHeader, MeetingForm } from '@components';
import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import CloseIcon from '@mui/icons-material/Close';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';

import { IconButton, Snackbar, Typography } from '@mui/material';

import { BookScheduledMeeting } from '@components/Book/BookScheduledMeeting';
import { UIButton } from '@components/ui';
import {
  StyledAddButtonContainer,
  StyledBookDetailsMiddle,
  StyledBookHeaderContainer,
  StyledHeaderContainer,
} from '@pages/Books/styles';
import { useToast } from '@lib/ToastContext';
import { Book, Meeting } from '@types';
import { addBook, deleteBook, getBookById, updateBook } from '@utils';
import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const toDate = (d: string | { seconds?: number } | undefined): Date | null => {
  if (!d) return null;
  if (typeof d === 'string') return new Date(d);
  if (typeof d === 'object' && 'seconds' in d) return new Date(d.seconds! * 1000);
  return null;
};

export const BookDetails = () => {
  const { id } = useParams();
  const { showError } = useToast();
  const { books } = useBookStore();
  const { meetings } = useMeetingStore();
  const { activeClub } = useCurrentUserStore();
  const [book, setBook] = useState<Book>();
  const [sortedMeetings, setSortedMeetings] = useState<{
    past: Meeting[];
    upcoming: Meeting[];
  }>({ past: [], upcoming: [] });
  const [meetingFormActive, setMeetingFormActive] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (id && books) {
      const bookOnShelf = books.find((book) => book.data.id === id);
      if (bookOnShelf) {
        setBook(bookOnShelf);
      } else {
        getBookById(id).then(
          (newBook) => newBook && setBook({ data: newBook })
        );
      }
    }
  }, [id, books]);

  useEffect(() => {
    if (meetings?.length) {
      const pastMeetings = meetings.filter(
        (meeting) => toDate(meeting.data.date) && toDate(meeting.data.date)! < new Date()
      );
      const upcomingMeetings = meetings.filter(
        (meeting) => toDate(meeting.data.date) && toDate(meeting.data.date)! > new Date()
      );

      setSortedMeetings({
        past: pastMeetings,
        upcoming: upcomingMeetings,
      });
    }
  }, [meetings]);

  const handleAddBook = async (scheduleBook = false) => {
    if (!book?.data?.id || !id) return;
    if (!activeClub?.docId) {
      showError('Select an active club before updating your library.');
      return;
    }
    if (snackbarMessage) setSnackbarMessage('');

    const existingBook = books.find((book) => book.data.id === id);

    if (existingBook && scheduleBook) {
      return setMeetingFormActive(true);
    }
    if (existingBook && book.docId) {
      try {
        if (
          existingBook.data.progressReports?.length ||
          existingBook.data.ratings?.length ||
          existingBook.data.scheduledMeetings?.length
        ) {
          await updateBook(
            activeClub.docId,
            book.docId,
            { inactive: existingBook.data.inactive ? false : true }
          );
          setSnackbarMessage(
            'Book' +
              (existingBook.data.inactive
                ? ' restored to your shelf'
                : ' removed')
          );
        } else {
          await deleteBook(activeClub.docId, book.docId);
          setSnackbarMessage('Book removed from your shelf');
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    } else {
      try {
        await addBook(activeClub.docId, {
          volumeInfo: book.data.volumeInfo as unknown as Record<string, unknown>,
          id: book.data.id,
          addedDate: new Date().toISOString(),
          ratings: [],
          progressReports: [],
        });
        setSnackbarMessage('Book added to your shelf');
        if (scheduleBook) {
          setMeetingFormActive(true);
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleScheduleMeeting = () => {
    handleAddBook(true);
  };

  return (
    <>
      {book?.data.volumeInfo ? (
        <>
          <Snackbar
            open={Boolean(snackbarMessage)}
            autoHideDuration={5000}
            onClose={() => setSnackbarMessage('')}
            message={snackbarMessage}
            action={
              <Fragment>
                <IconButton
                  aria-label="close"
                  color="inherit"
                  sx={{ p: 0.5 }}
                  onClick={() => setSnackbarMessage('')}
                >
                  <CloseIcon />
                </IconButton>
              </Fragment>
            }
          />
          <StyledHeaderContainer>
            <StyledBookHeaderContainer>
              <BookHeader volumeInfo={book.data.volumeInfo} />
              <IconButton
                sx={{ display: { md: 'none' } }}
                onClick={() => handleAddBook()}
              >
                {!books.find((book: Book) => book.data.id === id) ||
                book?.data?.inactive ? (
                  <LibraryAddIcon />
                ) : (
                  <LibraryAddCheckIcon />
                )}
              </IconButton>
            </StyledBookHeaderContainer>
            <BookScheduledMeeting sortedMeetings={sortedMeetings} book={book} />
            <StyledAddButtonContainer>
              <Typography
                sx={{ cursor: 'pointer' }}
                onClick={() => handleAddBook()}
                variant="h6"
              >
                {`${book.docId ? 'Remove from' : 'Add to'} shelf`}
              </Typography>
              <IconButton
                sx={{
                  justifyContent: 'flex-end',
                }}
                onClick={() => handleAddBook()}
              >
                {!books.find((book: Book) => book.data.id === id) ||
                book?.data?.inactive ? (
                  <LibraryAddIcon />
                ) : (
                  <LibraryAddCheckIcon />
                )}
              </IconButton>
            </StyledAddButtonContainer>
          </StyledHeaderContainer>

          <UIButton
            variant="primary"
            className="focus-ring"
            onClick={handleScheduleMeeting}
          >
            Schedule Meeting
          </UIButton>

          <StyledBookDetailsMiddle>
            <BookCover bookInfo={book.data} size="L" />
          </StyledBookDetailsMiddle>

          {meetingFormActive ? (
            <MeetingForm
              open={meetingFormActive}
              onClose={() => setMeetingFormActive(false)}
              preselectedBook={book}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
};
