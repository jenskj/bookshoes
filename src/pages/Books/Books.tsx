import { Swiper } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import { DocumentData } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { BookListItem } from '../../components';
import { BookDetails } from '../../components/Book/BookDetails';
import { BookShelfNavigation } from '../../components/BookShelfNavigation/BookShelfNavigation';
import { firestore } from '../../firestore';
import { GoogleBook, getBooksBySearch } from '../../utils/getBooks';
import {
  StyledBookContainer,
  StyledMenu,
  StyledPageTitle,
  StyledSearchButton,
  StyledSearchForm,
} from './styles';

export type ReadStatus = 'unread' | 'read' | 'reading' | 'candidate';

export interface FirestoreBook {
  docId?: string;
  data: BookInfo;
}

export interface BookInfo extends GoogleBook {
  readStatus?: ReadStatus;
  addedDate?: string;
  googleId?: string;
  scheduledMeeting?: string;
}

export const Books = () => {
  const [swiperInstance, setSwiperInstance] = useState<Swiper>();
  const [activeBook, setActiveBook] = useState<FirestoreBook | undefined>();
  const [books, setBooks] = useState<FirestoreBook[]>([]);

  useEffect(() => {
    firestore.collection('books').onSnapshot((snapshot) => {
      const newBooks = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as BookInfo,
      })) as FirestoreBook[];
      setBooks(newBooks);
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState<string | undefined>('');

  const [googleBooks, setGoogleBooks] = useState<FirestoreBook[]>([]);

  const searchBooks = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm) {
      const bookResults = await getBooksBySearch(searchTerm);
      if (bookResults) {
        setGoogleBooks(bookResults);
      }
    }
  };

  const openModal = (book?: FirestoreBook) => {
    setActiveBook(book);
  };

  const closeModal = () => {
    setActiveBook(undefined);
    if (swiperInstance) {
      swiperInstance.slideTo(0);
    }
  };

  return (
    <>
      <ReactSwiper
        spaceBetween={50}
        slidesPerView={1}
        onSwiper={setSwiperInstance}
      >
        <SwiperSlide>
          <StyledMenu>
            <StyledPageTitle>Bookshelf</StyledPageTitle>
            <BookShelfNavigation shelfType={0} />
          </StyledMenu>
          <StyledBookContainer>
            {books?.map(
              (book) =>
                book?.data?.volumeInfo && (
                  <div key={book.docId} onClick={() => openModal(book)}>
                    <BookListItem book={book} />
                  </div>
                )
            )}
          </StyledBookContainer>
        </SwiperSlide>
        <SwiperSlide>
          <StyledMenu>
            <StyledSearchForm onSubmit={(e) => searchBooks(e)}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search book title/author"
              />

              <StyledSearchButton type="submit" disabled={!searchTerm}>
                🕊️
              </StyledSearchButton>
            </StyledSearchForm>
            <BookShelfNavigation shelfType={1} />
          </StyledMenu>

          <StyledBookContainer>
            {googleBooks.map(
              (book) =>
                book?.data.volumeInfo && (
                  <div onClick={() => openModal(book)}>
                    <BookListItem key={book.data.id} book={book} />
                  </div>
                )
            )}
          </StyledBookContainer>
        </SwiperSlide>
      </ReactSwiper>

      {activeBook && (
        <BookDetails
          book={activeBook}
          books={books}
          open={Boolean(activeBook)}
          onClose={closeModal}
        />
      )}
    </>
  );
};
