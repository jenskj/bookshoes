import { Swiper } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Theme, useTheme } from '@mui/material/styles';
import { DocumentData } from 'firebase/firestore';
import { FormEvent, useEffect, useState } from 'react';
import { BookListItem } from '../../components';
import { BookForm } from '../../components/Book/BookForm';
import { BookShelfNavigation } from '../../components/BookShelfNavigation/BookShelfNavigation';
import { firestore } from '../../firestore';
import { ReadStatusKeys } from '../../utils/ReadStatus';
import { GoogleBook, getBooksBySearch } from '../../utils/getBooks';
import {
  StyledBookContainer,
  StyledMenu,
  StyledPageTitle,
  StyledSearchButton,
  StyledSearchForm,
} from './styles';

export type ReadStatus = 'unread' | 'read' | 'reading' | 'candidate';

const ReadStatusArray: (keyof typeof ReadStatusKeys)[] = [
  'unread',
  'read',
  'reading',
  'candidate',
];

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
  const theme = useTheme();
  const [swiperInstance, setSwiperInstance] = useState<Swiper>();
  const [activeBook, setActiveBook] = useState<FirestoreBook | undefined>();
  const [books, setBooks] = useState<FirestoreBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<FirestoreBook[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  useEffect(() => {
    firestore.collection('books').onSnapshot((snapshot) => {
      const newBooks = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as BookInfo,
      })) as FirestoreBook[];
      setBooks(newBooks);
    });
  }, []);

  useEffect(() => {
    const newBooks =
      filters.length === 0
        ? books
        : books.filter(
            (book) =>
              book?.data.readStatus && filters.includes(book?.data?.readStatus)
          );
    if (newBooks) {
      setFilteredBooks(newBooks);
    }
  }, [filters, books]);

  const [searchTerm, setSearchTerm] = useState<string | undefined>('');

  const [googleBooks, setGoogleBooks] = useState<FirestoreBook[]>([]);

  const handleFilterChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setFilters(typeof value === 'string' ? value.split(',') : value);
  };

  // MUI multiselect-code
  const getStyles = (
    name: string,
    filterName: readonly string[],
    theme: Theme
  ) => {
    return {
      fontWeight:
        filterName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  };

  const searchBooks = async (event: FormEvent<HTMLFormElement>) => {
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
      <div>
        <FormControl sx={{ m: 1, width: 300 }}>
          <Select
            labelId="filter-select-chip-label"
            id="filter-select-chip"
            multiple
            displayEmpty
            value={filters}
            onChange={handleFilterChange}
            input={<OutlinedInput />}
            renderValue={(selected) => {
              if (!selected.length) {
                console.log(selected);
                return <em>Select filter</em>;
              } else {
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      // This has to be fixed at some point... can't be arsed now
                      // @ts-ignore
                      <Chip key={value} label={ReadStatusKeys[value]} />
                    ))}
                  </Box>
                );
              }
            }}
            MenuProps={MenuProps}
          >
            <MenuItem disabled value="">
              <em>Select filter</em>
            </MenuItem>
            {ReadStatusArray?.map((filter) => (
              <MenuItem
                key={filter}
                value={filter}
                style={getStyles(filter, ReadStatusArray, theme)}
              >
                {ReadStatusKeys[filter]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
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
            {filteredBooks?.map(
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
        <BookForm
          book={activeBook}
          books={books}
          open={Boolean(activeBook)}
          onClose={closeModal}
        />
      )}
    </>
  );
};
