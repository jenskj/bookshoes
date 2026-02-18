import { BookHeader, Rating } from '@components';
import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import {
  Dialog,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useToast } from '@lib/ToastContext';
import { StyledModalForm } from '@shared/styles';
import { Book } from '@types';
import { addBook, formatDate, getBookImageUrl, updateBook } from '@utils';
import { isBefore } from 'date-fns';
import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StyledBookBanner,
  StyledBookDescription,
  StyledBookDescriptionContainer,
  StyledBookRatingContainer,
  StyledDialogContent,
} from './styles';

type BookProps = {
  book: Book;
  open: boolean;
  onClose: () => void;
};

const toDate = (d: string | { seconds?: number } | undefined): Date | null => {
  if (!d) return null;
  if (typeof d === 'string') return new Date(d);
  if (typeof d === 'object' && 'seconds' in d) return new Date(d.seconds! * 1000);
  return null;
};

export const BookForm = ({
  book: {
    docId,
    data: {
      volumeInfo,
      id,
      source,
      sourceBookId,
      coverUrl,
      isbn10,
      isbn13,
      metadataRaw,
      scheduledMeetings,
      readStatus,
    },
  },
  open,
  onClose,
}: BookProps) => {
  const { showError } = useToast();
  const meetings = useMeetingStore((state) => state.meetings);
  const activeClub = useCurrentUserStore((state) => state.activeClub);
  const settings = useCurrentUserStore((state) => state.settings);
  const books = useBookStore((state) => state.books);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  useEffect(() => {
    if (docId) {
      setSelectedDocId(docId);
    }
  }, [docId]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    if (scheduledMeetings?.length) {
      setSelectedMeetings(scheduledMeetings);
    }
  }, [scheduledMeetings]);

  const addNewBook = async () => {
    if (!activeClub?.docId) {
      showError('Select an active club before adding books.');
      return;
    }
    try {
      const res = await addBook(activeClub.docId, {
        volumeInfo: volumeInfo as unknown as Record<string, unknown>,
        source: source ?? 'google',
        sourceBookId: source === 'manual' ? null : (sourceBookId ?? id),
        id: source === 'google' ? (sourceBookId ?? id) : undefined,
        coverUrl,
        isbn10,
        isbn13,
        metadataRaw: metadataRaw as Record<string, unknown>,
        addedDate: new Date().toISOString(),
        scheduledMeetings: selectedMeetings,
        ratings: [],
        progressReports: [],
      });
      setSelectedDocId(res.id);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeClub?.docId) {
      showError('Select an active club before updating books.');
      return;
    }
    try {
      if (!selectedDocId || !books.some((bookItem) => bookItem.data.id === id)) {
        await addNewBook();
      } else if (selectedDocId) {
        await updateBook(activeClub.docId, selectedDocId, {
          scheduledMeetings: selectedMeetings,
        });
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleMeetingSelect = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setSelectedMeetings(
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const handleCandidateSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDocId) {
      navigate(`/books/${selectedDocId}`);
    } else {
      addNewBook();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle component="div">
        {volumeInfo ? <BookHeader volumeInfo={volumeInfo} /> : null}
      </DialogTitle>
      <StyledDialogContent>
        <StyledBookBanner>
          <img
            src={getBookImageUrl({ id, volumeInfo }, { w: '130', h: '200' })}
            alt={volumeInfo?.title}
          />
        </StyledBookBanner>

        <StyledModalForm onSubmit={handleCandidateSubmit}>
          <FormControl>
            <IconButton size="large" type="submit">
              {selectedDocId ? (
                <LibraryAddCheckIcon color="success" />
              ) : (
                <LibraryAddIcon color="primary" />
              )}
            </IconButton>
            <InputLabel id="read-status-select-label">
              {selectedDocId ? 'Added to shelf' : 'Add to shelf'}
            </InputLabel>
          </FormControl>
        </StyledModalForm>

        <StyledModalForm onSubmit={handleSubmit}>
          <FormControl>
            <InputLabel id="meeting-select-label">Select meeting</InputLabel>

            <Select
              labelId="meeting-select-label"
              id="meeting-select"
              value={selectedMeetings}
              label="Meeting"
              multiple
              onChange={(e) => handleMeetingSelect(e)}
            >
              {meetings &&
                meetings.map((meeting) => {
                  const mDate = toDate(meeting.data.date);
                  if (!mDate) return null;
                  const meetsFilter =
                    readStatus === 'read'
                      ? isBefore(mDate, new Date())
                      : isBefore(new Date(), mDate);
                  return meetsFilter ? (
                    <MenuItem key={meeting.docId} value={meeting.docId}>
                      {formatDate(mDate, false, settings.dateTime)}
                    </MenuItem>
                  ) : null;
                })}
            </Select>
          </FormControl>
        </StyledModalForm>

        {volumeInfo?.averageRating ? (
          <StyledBookRatingContainer>
            <Rating
              title="Average rating"
              rating={volumeInfo.averageRating}
              isReadOnly={true}
            />
          </StyledBookRatingContainer>
        ) : null}
        {volumeInfo?.description ? (
          <StyledBookDescriptionContainer>
            <b>Description</b>
            <StyledBookDescription>
              {volumeInfo?.description}
            </StyledBookDescription>
          </StyledBookDescriptionContainer>
        ) : null}
      </StyledDialogContent>
    </Dialog>
  );
};
