import { Swiper } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import { DocumentData, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BookListItem } from '../../components';
import { BookDetails } from '../../components/Book/BookDetails';
import { BookShelfNavigation } from '../../components/BookShelfNavigation/BookShelfNavigation';
import { db, firestore } from '../../firestore';
import { GoogleBook, getBooksBySearch } from '../../utils/getBooks';
import {
  StyledBookContainer,
  StyledMenu,
  StyledModalCloseButton,
  StyledModalHeader,
  StyledPageTitle,
  StyledSearchButton,
  StyledSearchForm,
} from './styles';
import { Dialog } from '@mui/material';

export type ReadStatus = 'unread' | 'read' | 'reading' | 'candidate';

export interface FirestoreBook {
  id?: string;
  data: BookInfo;
}

export interface BookInfo extends GoogleBook {
  readStatus?: ReadStatus;
  addedDate?: string;
  googleId?: string;
}

export const Books = () => {
  const [swiperInstance, setSwiperInstance] = useState<Swiper>();
  const [activeBook, setActiveBook] = useState<FirestoreBook | undefined>();
  const [activeShelf, setActiveShelf] = useState<number>(0);
  const [books, setBooks] = useState<FirestoreBook[]>([]);
  const booksRef = firestore.collection('books');

  useEffect(() => {
    firestore.collection('books').onSnapshot((snapshot) => {
      const newBooks = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
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

  const handleBookStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (activeBook) {
      const selectedStatus = e.target.value as ReadStatus;
      const docId = books.find(
        (book) => book.data.id === activeBook.data.id
      )?.id;
      switch (selectedStatus) {
        case 'read':
        case 'reading':
        case 'candidate':
          // If the book does not exist on the shelf, add it
          if (!books.some((book) => book.data.id === activeBook?.data.id)) {
            const date = new Date();
            await booksRef.add({
              ...activeBook.data,
              googleId: activeBook.data.id,
              addedDate: date.toLocaleDateString(),
              readStatus: selectedStatus,
            });
            // If the book already exists, update its status
          } else if (docId) {
            const bookDocRef = doc(db, 'books', docId);
            try {
              await updateDoc(bookDocRef, {
                readStatus: selectedStatus,
              });
            } catch (err) {
              alert(err);
            }
          }
          break;
        // If the book status is changed to "Unread", remove it.
        default:
          if (
            docId &&
            books.some((book) => book.data.id === activeBook.data.id)
          ) {
            const bookDocRef = doc(db, 'books', docId);
            try {
              await deleteDoc(bookDocRef);
            } catch (err) {
              alert(err);
            }
          }
          break;
      }
    }

    setActiveBook(undefined);
    if (swiperInstance) {
      swiperInstance.slideTo(0);
    }
  };

  const openModal = (book?: FirestoreBook) => {
    setActiveBook(book);
  };

  function closeModal() {
    setActiveBook(undefined);
  }

  return (
    <>
      <ReactSwiper
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(e) => setActiveShelf(e.activeIndex)} // is this used anywhere?
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
                  <div onClick={() => openModal(book)}>
                    <BookListItem key={book.id} book={book} />
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

      <Dialog open={Boolean(activeBook)} onClose={closeModal} fullWidth>
        <StyledModalHeader>
          <StyledModalCloseButton onClick={closeModal}>
            X
          </StyledModalCloseButton>
          {activeBook && (
            <BookDetails
              book={activeBook}
              updateBookStatus={handleBookStatus}
            />
          )}
        </StyledModalHeader>
      </Dialog>
    </>
  );
};
