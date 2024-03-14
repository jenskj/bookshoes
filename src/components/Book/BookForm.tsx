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
import { Timestamp } from 'firebase/firestore';
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
    addNewDocument(`clubs/${activeClub?.docId}/books`, {
      volumeInfo,
      id,
      addedDate: Timestamp.now(),
      scheduledMeetings: selectedMeetings,
      ratings: [],
      progressLogs: [],
    }).then((res) => {
      setSelectedDocId(res.id);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // If the book does not exist on the shelf, add it
    if (!selectedDocId || !books.some((bookItem) => bookItem.data.id === id)) {
      addNewBook();
      // If the book already exists, update its status
    } else if (selectedDocId) {
      console.log(selectedDocId);
      updateDocument(
        `clubs/${activeClub?.docId}/books`,
        {
          scheduledMeetings: selectedMeetings,
          modifiedDate: Timestamp.now(),
        },
        selectedDocId
      );
    }
  };



  const handleMeetingSelect = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setSelectedMeetings(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const handleCandidateSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDocId) {
      console.log(`/books/${selectedDocId}`);
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

        {/* Add book to shelf form */}
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

        {/* Date select form */}
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
                  // If the selected readStatus is "read", only show meetings whose date is earlier than today. If "reading", only show future meetings.
                  return meeting?.data?.date &&
                    isBefore(
                      new Date(
                        readStatus === 'read'
                          ? meeting.data.date.toDate()
                          : new Date()
                      ),
                      new Date(
                        readStatus === 'read'
                          ? new Date()
                          : meeting.data.date.toDate()
                      )
                    ) ? (
                    <MenuItem value={meeting.docId}>
                      {formatDate(meeting.data.date)}
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
