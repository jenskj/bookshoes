import { BookCover, BookHeader } from '@components';
import { useBookStore, useMeetingStore } from '@hooks';
import { StyledBookDetailsMiddle } from '@pages/Books/styles';
import { FirestoreBook, FirestoreMeeting } from '@types';
import { getBookById } from '@utils';
import { MouseEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const BookDetails = () => {
  const { id } = useParams();
  const { books } = useBookStore();
  const { meetings } = useMeetingStore();
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

  // const handleAddBook = (e: MouseEvent<HTMLButtonElement>) => {
  //   console.log(`/books/${id}`);
  //   if (id) {
  //   }
  // };

  return (
    <>
      {book?.data.volumeInfo ? (
        <>
          <BookHeader volumeInfo={book.data.volumeInfo} />
          <StyledBookDetailsMiddle>
            <BookCover bookInfo={book.data} size='L' />
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
