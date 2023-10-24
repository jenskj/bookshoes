import { Swiper } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';

import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Theme, useTheme } from '@mui/material/styles';
import { FormEvent, useEffect, useState } from 'react';
import { BookListItem } from '../../components';
import { BookForm } from '../../components/Book/BookForm';
import { BookShelfNavigation } from '../../components/BookShelfNavigation/BookShelfNavigation';
import { FirestoreBook } from '../../types';
import { ReadStatusKeys } from '../../utils/ReadStatus';
import { getBooksBySearch } from '../../utils/getBooks';
import {
  StyledBookContainer,
  StyledBookshelfTop,
  StyledSearchForm,
  StyledTopLeft,
} from './styles';
import { useBookStore } from '../../hooks';
import { StyledPageTitle } from '../styles';

const ReadStatusArray: (keyof typeof ReadStatusKeys)[] = [
  'unread',
  'read',
  'reading',
  'candidate',
];

export const Books = () => {
  const theme = useTheme();
  const [swiperInstance, setSwiperInstance] = useState<Swiper>();
  const [activeBook, setActiveBook] = useState<FirestoreBook | undefined>();
  const { books } = useBookStore((state) => ({ books: state.books }));
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
      <ReactSwiper
        spaceBetween={50}
        slidesPerView={1}
        onSwiper={setSwiperInstance}
        preventClicks={false}
        touchStartPreventDefault={false}
        preventClicksPropagation={false}
      >
        <SwiperSlide>
          <StyledBookshelfTop>
            <StyledTopLeft>
              <StyledPageTitle>Bookshelf</StyledPageTitle>
              {/* Filter */}
              <FormControl
                sx={{
                  m: 1,
                  maxWidth: 300,
                  minWidth: 150,
                  backgroundColor: theme.palette.background.paper,
                  margin: 0,
                }}
              >
                <Select
                  labelId="filter-select-chip-label"
                  id="filter-select-chip"
                  multiple
                  variant="filled"
                  displayEmpty
                  size="small"
                  value={filters}
                  onChange={handleFilterChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) => {
                    if (!selected.length) {
                      return <em>Select filter</em>;
                    } else {
                      return (
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                          {selected.map((value: string) => (
                            <Chip
                              key={value}
                              // This has to be fixed at some point... can't be arsed now
                              // @ts-ignore
                              label={ReadStatusKeys[value]}
                              color="secondary"
                            />
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
            </StyledTopLeft>
            <BookShelfNavigation shelfType={0} />
          </StyledBookshelfTop>
          <StyledBookContainer>
            {filteredBooks?.map(
              (book) =>
                book?.data?.volumeInfo && (
                  <BookListItem
                    key={book.docId}
                    onClick={() => openModal(book)}
                    book={book}
                  />
                )
            )}
          </StyledBookContainer>
        </SwiperSlide>
        <SwiperSlide>
          <StyledBookshelfTop>
            <StyledTopLeft>
              <StyledPageTitle>Find new books</StyledPageTitle>
              <StyledSearchForm onSubmit={(e) => searchBooks(e)}>
                <FormControl>
                  <TextField
                    sx={{ backgroundColor: theme.palette.background.paper }}
                    label="Search"
                    variant="filled"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </FormControl>

                <input type="submit" disabled={!searchTerm} hidden></input>
              </StyledSearchForm>
            </StyledTopLeft>

            <BookShelfNavigation shelfType={1} />
          </StyledBookshelfTop>

          <StyledBookContainer>
            {googleBooks.map(
              (book) =>
                book?.data.volumeInfo && (
                  // Make currentBook variable, maybe a useState()
                  <BookListItem
                    onClick={() =>
                      openModal(
                        books.find((a) => a.data.id === book.data.id) || book
                      )
                    }
                    key={book.data.id}
                    book={books.find((a) => a.data.id === book.data.id) || book}
                  />
                )
            )}
          </StyledBookContainer>
        </SwiperSlide>
      </ReactSwiper>

      {activeBook && (
        <BookForm
          book={activeBook}
          open={Boolean(activeBook)}
          onClose={closeModal}
        />
      )}
    </>
  );
};
