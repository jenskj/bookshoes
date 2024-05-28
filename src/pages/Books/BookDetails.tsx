import { BookCover, BookHeader, MeetingForm } from '@components';
import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import CloseIcon from '@mui/icons-material/Close';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';

import { CalendarMonthRounded, PlaceRounded } from '@mui/icons-material';
import { Button, IconButton, Snackbar } from '@mui/material';

import {
  StyledBookDetailsMiddle,
  StyledHeaderContainer,
  StyledMeetingLink,
  StyledMeetingLinkDate,
  StyledMeetingLinkLocation,
  StyledScheduledMeetings,
} from '@pages/Books/styles';
import { FirestoreBook, FirestoreMeeting } from '@types';
import {
  addNewDocument,
  deleteDocument,
  formatDate,
  getBookById,
  updateDocument,
} from '@utils';
import { Timestamp, deleteField } from 'firebase/firestore';
import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const BookDetails = () => {
  const { id } = useParams();
  const { books } = useBookStore();
  const { meetings } = useMeetingStore();
  const { activeClub } = useCurrentUserStore();
  const [book, setBook] = useState<FirestoreBook>();
  const [sortedMeetings, setSortedMeetings] = useState<{
    past: FirestoreMeeting[];
    upcoming: FirestoreMeeting[];
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
        (meeting) =>
          meeting.data.date && meeting.data.date.toDate() < new Date()
      );
      const upcomingMeetings = meetings.filter(
        (meeting) =>
          meeting.data.date && meeting.data.date.toDate() > new Date()
      );

      setSortedMeetings({
        ...sortedMeetings,
        past: pastMeetings,
        upcoming: upcomingMeetings,
      });
    }
  }, [meetings]);

  const handleAddBook = (scheduleBook = false) => {
    if (book?.data?.id && id) {
      if (snackbarMessage) {
        return setSnackbarMessage('');
      }
      const existingBook = books.find((book) => book.data.id === id);

      if (existingBook && scheduleBook) {
        return setMeetingFormActive(true);
      }
      if (existingBook && book.docId) {
        if (
          existingBook.data.progressReports?.length ||
          existingBook.data.ratings?.length ||
          existingBook.data.scheduledMeetings?.length
        ) {
          // If club data exists on the book, flip the book's inactive status
          updateDocument(
            `clubs/${activeClub?.docId}/books`,
            {
              inactive: existingBook.data.inactive ? deleteField() : true,
            },
            book.docId
          ).then(() =>
            setSnackbarMessage(
              'Book' +
                (existingBook.data.inactive
                  ? ' restored to your shelf'
                  : ' removed')
            )
          );
        } else {
          // If no user data exists on the book, delete it from the collection
          deleteDocument(`clubs/${activeClub?.docId}/books`, book.docId).then(
            () => setSnackbarMessage('Book removed from your shelf')
          );
        }
      } else {
        addNewDocument(`clubs/${activeClub?.docId}/books`, {
          volumeInfo: book.data.volumeInfo,
          id: book.data.id,
          addedDate: Timestamp.now(),
          ratings: [],
          progressLogs: [],
        })
          .then(() => setSnackbarMessage('Book added to your shelf'))
          .then(() => {
            if (scheduleBook) {
              setMeetingFormActive(true);
            }
          });
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
            onClose={() => setTimeout(() => setSnackbarMessage(''), 200)}
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
            <BookHeader volumeInfo={book.data.volumeInfo} />
            {/* Make into a component */}
            {sortedMeetings.upcoming ? (
              <StyledScheduledMeetings>
                {sortedMeetings.upcoming
                  .filter((meeting) =>
                    book.data.scheduledMeetings?.includes(meeting.docId)
                  )
                  .map((meeting) => (
                    <StyledMeetingLink to={`/meetings/${meeting.docId}`}>
                      <StyledMeetingLinkDate>
                        <CalendarMonthRounded />
                        {`${
                          meeting.data.date
                            ? `Meeting scheduled on ${formatDate(
                                meeting.data.date
                              )}`
                            : 'with no date'
                        }`}
                      </StyledMeetingLinkDate>
                      <StyledMeetingLinkLocation>
                        <>
                          <PlaceRounded />
                          {`${
                            meeting.data.location?.remoteInfo
                              ? 'Held remotely'
                              : meeting.data.location?.user?.displayName
                              ? meeting.data.location.user.displayName
                              : 'unknown location'
                          }`}
                        </>
                      </StyledMeetingLinkLocation>
                    </StyledMeetingLink>
                  ))}
              </StyledScheduledMeetings>
            ) : null}

            <IconButton onClick={() => handleAddBook()}>
              {!books.find((book: FirestoreBook) => book.data.id === id) ||
              book?.data?.inactive ? (
                <LibraryAddIcon />
              ) : (
                <LibraryAddCheckIcon />
              )}
            </IconButton>
          </StyledHeaderContainer>

          <Button variant="contained" onClick={handleScheduleMeeting}>
            Schedule a meeting for this book
          </Button>

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
          {/* This is parked for now */}
          {/* <FloatingActionButton
            onClick={handleAddBook}
            furtherOptions={[
              {
                title: 'Add to upcoming meeting',
                options: sortedMeetings.upcoming.map(
                  (meeting) => meeting.docId
                ),
              },
            ]}
          /> */}
        </>
      ) : null}
    </>
  );
};
