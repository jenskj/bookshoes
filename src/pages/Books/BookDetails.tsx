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
  StyledBookDetailsPage,
  StyledBookMetadataPanel,
  StyledBookMissingState,
  StyledDescriptionSection,
  StyledBookDetailsMiddle,
  StyledBookHeaderContainer,
  StyledHeaderContainer,
  StyledMetadataGrid,
  StyledMetadataRow,
} from '@pages/Books/styles';
import { StyledSectionHeading } from '@pages/styles';
import { useToast } from '@lib/ToastContext';
import { Book, CatalogBookCandidate } from '@types';
import {
  addBook,
  buildAddBookPayloadFromBookData,
  candidateToBookInfo,
  deleteBook,
  getBookById,
  splitMeetingsByTimeline,
  toErrorMessage,
  updateBook,
} from '@utils';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const BookDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { showError } = useToast();
  const books = useBookStore((state) => state.books);
  const meetings = useMeetingStore((state) => state.meetings);
  const activeClub = useCurrentUserStore((state) => state.activeClub);
  const [book, setBook] = useState<Book>();
  const [meetingFormActive, setMeetingFormActive] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const locationState = location.state as { candidate?: CatalogBookCandidate } | null;
  const sortedMeetings = useMemo(
    () => splitMeetingsByTimeline(meetings),
    [meetings]
  );

  useEffect(() => {
    if (id && books) {
      setBook(undefined);
      const bookOnShelf = books.find(
        (entry) =>
          entry.docId === id ||
          entry.data.id === id ||
          (entry.data.source === 'google' &&
            `google:${entry.data.sourceBookId ?? entry.data.id}` === id)
      );
      if (bookOnShelf) {
        setBook(bookOnShelf);
      } else if (
        locationState?.candidate &&
        `${locationState.candidate.source}:${locationState.candidate.sourceBookId}` === id
      ) {
        setBook({ data: candidateToBookInfo(locationState.candidate) });
      } else if (!UUID_PATTERN.test(id)) {
        getBookById(id).then(
          (newBook) => newBook && setBook({ data: newBook })
        );
      }
    }
  }, [id, books, locationState]);

  const handleAddBook = async (scheduleBook = false) => {
    if (!book?.data || !id) return;
    if (!activeClub?.docId) {
      showError('Select an active club before updating your library.');
      return;
    }
    if (snackbarMessage) setSnackbarMessage('');

    const existingBook = books.find(
      (entry) =>
        entry.docId === book.docId ||
        entry.docId === id ||
        entry.data.id === book.data.id
    );

    if (existingBook && scheduleBook) {
      return setMeetingFormActive(true);
    }
    if (existingBook?.docId) {
      try {
        if (
          existingBook.data.progressReports?.length ||
          existingBook.data.ratings?.length ||
          existingBook.data.scheduledMeetings?.length
        ) {
          await updateBook(
            activeClub.docId,
            existingBook.docId,
            { inactive: existingBook.data.inactive ? false : true }
          );
          setSnackbarMessage(
            'Book' +
              (existingBook.data.inactive
                ? ' restored to your shelf'
                : ' removed')
          );
        } else {
          await deleteBook(activeClub.docId, existingBook.docId);
          setSnackbarMessage('Book removed from your shelf');
        }
      } catch (err) {
        showError(toErrorMessage(err));
      }
    } else {
      try {
        await addBook(activeClub.docId, buildAddBookPayloadFromBookData(book.data));
        setSnackbarMessage('Book added to your shelf');
        if (scheduleBook) {
          setMeetingFormActive(true);
        }
      } catch (err) {
        showError(toErrorMessage(err));
      }
    }
  };

  const handleScheduleMeeting = () => {
    handleAddBook(true);
  };

  const formatReadStatus = (value: Book['data']['readStatus']) => {
    if (!value) return 'Candidate';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getIsbn = (type: 'ISBN_10' | 'ISBN_13'): string | undefined => {
    return book?.data?.volumeInfo?.industryIdentifiers?.find(
      (identifier) => identifier.type === type
    )?.identifier;
  };

  const pageCount = book?.data?.volumeInfo?.pageCount;
  const isbn13 = book?.data?.isbn13 ?? getIsbn('ISBN_13');
  const isbn10 = book?.data?.isbn10 ?? getIsbn('ISBN_10');

  const metadataRows = book
    ? [
        {
          label: 'Authors',
          value: book.data.volumeInfo?.authors?.join(', ') || 'Unknown author',
        },
        {
          label: 'Page count',
          value: pageCount ? `${pageCount}` : 'Not available',
        },
        {
          label: 'Published',
          value: book.data.volumeInfo?.publishedDate || 'Not available',
        },
        {
          label: 'Publisher',
          value: book.data.volumeInfo?.publisher || 'Not available',
        },
        {
          label: 'ISBN-13',
          value: isbn13 || 'Not available',
        },
        {
          label: 'ISBN-10',
          value: isbn10 || 'Not available',
        },
        {
          label: 'Rating',
          value: book.data.volumeInfo?.averageRating
            ? `${book.data.volumeInfo.averageRating}/5`
            : 'Not available',
        },
        {
          label: 'Status',
          value: formatReadStatus(book.data.readStatus),
        },
      ]
    : [];

  return (
    <StyledBookDetailsPage>
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
                {!books.find(
                  (entry: Book) =>
                    entry.docId === book?.docId ||
                    entry.docId === id ||
                    entry.data.id === book?.data?.id
                ) || book?.data?.inactive ? (
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
                {!books.find(
                  (entry: Book) =>
                    entry.docId === book?.docId ||
                    entry.docId === id ||
                    entry.data.id === book?.data?.id
                ) || book?.data?.inactive ? (
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
            <StyledBookMetadataPanel>
              <StyledSectionHeading>Book Details</StyledSectionHeading>
              <StyledMetadataGrid>
                {metadataRows.map((row) => (
                  <StyledMetadataRow key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </StyledMetadataRow>
                ))}
              </StyledMetadataGrid>
            </StyledBookMetadataPanel>
          </StyledBookDetailsMiddle>

          <StyledDescriptionSection>
            <StyledSectionHeading>Description</StyledSectionHeading>
            <p>
              {book.data.volumeInfo?.description ||
                'No description available for this title yet.'}
            </p>
          </StyledDescriptionSection>

          {meetingFormActive ? (
            <MeetingForm
              open={meetingFormActive}
              onClose={() => setMeetingFormActive(false)}
              preselectedBook={book}
            />
          ) : null}
        </>
      ) : (
        <StyledBookMissingState>
          Book details are not available for this item.
        </StyledBookMissingState>
      )}
    </StyledBookDetailsPage>
  );
};
