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
import { StyledModalForm } from '@shared/styles';
import { FirestoreBook } from '@types';
import {
  addNewDocument,
  formatDate,
  getBookImageUrl,
  updateDocument,
} from '@utils';
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
  book: FirestoreBook;
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
    data: { volumeInfo, id, scheduledMeetings, readStatus },
  },
  open,
  onClose,
}: BookProps) => {
  const { meetings } = useMeetingStore();
  const { activeClub } = useCurrentUserStore();
  const { books } = useBookStore();
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
    const res = await addNewDocument(`clubs/${activeClub?.docId}/books`, {
      volumeInfo,
      id,
      addedDate: new Date().toISOString(),
      scheduledMeetings: selectedMeetings,
      ratings: [],
      progressLogs: [],
    });
    setSelectedDocId(res.id);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDocId || !books.some((bookItem) => bookItem.data.id === id)) {
      addNewBook();
    } else if (selectedDocId) {
      updateDocument(
        `clubs/${activeClub?.docId}/books`,
        { scheduledMeetings: selectedMeetings },
        selectedDocId
      );
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
            src={getBookImageUrl(id, { w: '130', h: '200' })}
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
                      {formatDate(mDate)}
                    </MenuItem>
                  ) : null;
                })}
            </Select>
          </FormControl>
        </StyledModalForm>

        {volumeInfo?.averageRating ? (
          <StyledBookRatingContainer>
            <Rating
              title="Average rating (Google)"
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
