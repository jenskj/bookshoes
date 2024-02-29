import { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper as ReactSwiper, SwiperSlide } from 'swiper/react';
import {
  Box,
  Chip,
  FormControl,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Theme,
  useTheme,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import {
  BookListItem,
  EmptyFallbackLink,
  SwiperNavigationButtons,
  BookForm,
} from '@components';
import { useBookStore } from '@hooks';
import { ReadStatusKeys, getBooksBySearch } from '@utils';
import { FirestoreBook } from '@types';
import {
  StyledBookContainer,
  StyledBooks,
  StyledBookshelfTop,
  StyledSearchForm,
  StyledTopLeft,
} from './styles';
import { useNavigate } from 'react-router-dom';

const ReadStatusArray: (keyof typeof ReadStatusKeys)[] = [
  'unread',
  'read',
  'reading',
  'candidate',
];

export const Books = () => {
  const theme = useTheme();
  const [swiperInstance, setSwiperInstance] = useState<
    SwiperType | undefined
  >();
  // Used to force a rerender since activeIndex isn't updated properly in react/swiper (known bug)
  const [activeIndex, setActiveIndex] = useState(1);
  const [activeBook, setActiveBook] = useState<FirestoreBook | undefined>();
  const { books } = useBookStore((state) => ({ books: state.books }));
  const navigate = useNavigate();
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

  const handleBookClick = (book?: FirestoreBook) => {
    if (book && activeIndex === 1) {
      navigate(`/books/${book.docId}`);
    } else {
      openModal(book);
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

  const onSlideChange = (index: number) => setActiveIndex(index);

  return (
    <StyledBooks>
      <SwiperNavigationButtons
        activeIndex={swiperInstance?.activeIndex || 0}
        onSwipe={(index) => swiperInstance?.slideTo(index)}
        slides={[
          { title: 'Bookshelf', description: '' },
          { title: 'Find new books', description: '' },
        ]}
      />
      <ReactSwiper
        onSlideChange={(swiper) => onSlideChange(swiper.activeIndex + 1)}
        spaceBetween={50}
        slidesPerView={1}
        onSwiper={setSwiperInstance}
        preventClicks={false}
        touchStartPreventDefault={false}
        preventClicksPropagation={false}
      >
        <SwiperSlide>
          <StyledBookshelfTop>
            {books?.length ? (
              <StyledTopLeft>
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
                    {ReadStatusArray?.map((filter) =>
                      filter !== 'unread' ? (
                        <MenuItem
                          key={filter}
                          value={filter}
                          style={getStyles(filter, ReadStatusArray, theme)}
                        >
                          {ReadStatusKeys[filter]}
                        </MenuItem>
                      ) : null
                    )}
                  </Select>
                </FormControl>
              </StyledTopLeft>
            ) : (
              <EmptyFallbackLink title="No books added yet" />
            )}
          </StyledBookshelfTop>
          <StyledBookContainer>
            {filteredBooks?.map(
              (book) =>
                book?.data?.volumeInfo && (
                  <BookListItem
                    key={book.docId}
                    onClick={() => handleBookClick(book)}
                    book={book}
                  />
                )
            )}
          </StyledBookContainer>
        </SwiperSlide>
        <SwiperSlide>
          <StyledBookshelfTop>
            <StyledTopLeft>
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
          </StyledBookshelfTop>

          <StyledBookContainer>
            {googleBooks.map(
              (book) =>
                book?.data.volumeInfo && (
                  // Make currentBook variable, maybe a useState()
                  <BookListItem
                    onClick={() =>
                      handleBookClick(
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
    </StyledBooks>
  );
};
