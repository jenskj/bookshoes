import { BookCover, BookHeader } from '@components';
import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import { IconButton } from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';

import {
  StyledBookDetailsMiddle,
  StyledHeaderContainer,
} from '@pages/Books/styles';
import { FirestoreBook, FirestoreMeeting } from '@types';
import { addNewDocument, getBookById } from '@utils';
import { MouseEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';

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

  const handleAddBook = (e: MouseEvent<HTMLButtonElement>) => {
    if (book?.data?.id && id) {
      if (books.some((book: FirestoreBook) => book.data.id === id)) {
        return alert('This book already exists on your shelf');
      }
      addNewDocument(`clubs/${activeClub?.docId}/books`, {
        volumeInfo: book.data.volumeInfo,
        id: book.data.id,
        addedDate: Timestamp.now(),
        ratings: [],
        progressLogs: [],
      });
    }
  };

  return (
    <>
      {book?.data.volumeInfo ? (
        <>
          <StyledHeaderContainer>
            <BookHeader volumeInfo={book.data.volumeInfo} />

            <IconButton onClick={handleAddBook}>
              {books.find((book: FirestoreBook) => book.data.id === id)
                ? 'Added'
                : 'Add to shelf'}
              &nbsp;
              {!books.find((book: FirestoreBook) => book.data.id === id) ? (
                <LibraryAddIcon />
              ) : (
                <LibraryAddCheckIcon />
              )}
            </IconButton>
          </StyledHeaderContainer>

          <StyledBookDetailsMiddle>
            <BookCover bookInfo={book.data} size="L" />
          </StyledBookDetailsMiddle>
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
