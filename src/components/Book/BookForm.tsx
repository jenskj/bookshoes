import {
  Dialog,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { isBefore } from 'date-fns';
import { Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, firestore } from '../../firestore';
import { useCurrentUserStore } from '../../hooks';
import { useBookStore } from '../../hooks/useBookStore';
import { useMeetingStore } from '../../hooks/useMeetingStore';
import { StyledBookStatus } from '../../pages/Books/styles';
import { StyledModalForm } from '../../shared/styles';
import { FirestoreBook, ReadStatus } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { getBookImageUrl } from '../../utils/getBookImageUrl';
import {
  StyledBookAuthor,
  StyledBookBanner,
  StyledBookDescription,
  StyledBookDescriptionContainer,
  StyledBookTitle,
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
    data: { volumeInfo, readStatus, id, scheduledMeeting },
  },
  open,
  onClose,
}: BookProps) => {
  const { meetings } = useMeetingStore();
  const { activeClub } = useCurrentUserStore();
  const { books } = useBookStore();
  const [selectedReadStatus, setSelectedReadStatus] = useState<
    ReadStatus | string
  >('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string | undefined>(
    ''
  );

  const booksRef = firestore
    .collection('clubs')
    .doc(activeClub?.docId)
    .collection('books');

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    setSelectedReadStatus(readStatus as ReadStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readStatus]);

  useEffect(() => {
    if (scheduledMeeting) {
      setSelectedMeeting(scheduledMeeting);
    }
  }, [scheduledMeeting]);

  useEffect(() => {
    // Every time selectedReadStatus or SelectedMeeting change (and readStatus is not the initial state change), the book status should change
    if (
      (selectedReadStatus || selectedMeeting) &&
      (selectedReadStatus !== readStatus ||
        selectedMeeting !== scheduledMeeting)
    ) {
      handleBookStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReadStatus, selectedMeeting]);

  const addToShelf = async () => {
    // If the book does not exist on the shelf, add it
    if (
      !docId ||
      (!books.some((bookItem) => bookItem.data.id === id) && selectedReadStatus)
    ) {
      await booksRef.add({
        volumeInfo,
        id,
        addedDate: Timestamp.now(),
        readStatus: selectedReadStatus,
        scheduledMeeting: selectedMeeting,
        ratings: [],
        progressLogs: [],
      });
      // If the book already exists, update its status
    } else if (docId && selectedReadStatus) {
      const bookDocRef = doc(db, `clubs/${activeClub?.docId}/books`, docId);
      try {
        await updateDoc(bookDocRef, {
          readStatus: selectedReadStatus,
          scheduledMeeting: selectedMeeting,
          modifiedDate: Timestamp.now,
        });
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleBookStatus = async () => {
    if (!selectedReadStatus) {
      return;
    }
    switch (selectedReadStatus) {
      case 'read':
      case 'reading':
        if (selectedMeeting) {
          addToShelf();
          onClose();
        }
        break;
      case 'candidate':
        if (selectedMeeting) {
          setSelectedMeeting('');
          break;
        }
        addToShelf();
        onClose();
        break;
      case 'unread':
        // If the book status is changed to "Unread", remove it.
        if (docId && books.some((bookItem) => bookItem.data.id === id)) {
          const bookDocRef = doc(db, `clubs/${activeClub?.docId}/books`, docId);
          try {
            await deleteDoc(bookDocRef);
          } catch (err) {
            alert(err);
          }
        }
        onClose();
        break;
      default: {
        alert('No status was provided');
      }
    }
  };

  const handleStatusSelect = (e: SelectChangeEvent) => {
    // Reset meeting status.
    setSelectedMeeting('');
    // Set new read status
    setSelectedReadStatus(e.target.value as ReadStatus);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth>
      <DialogTitle>
        <StyledBookTitle title={volumeInfo?.title}>
          {volumeInfo?.title}
        </StyledBookTitle>
        <StyledBookAuthor
          title={
            volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'
          }
        >
          by {volumeInfo?.authors ? volumeInfo?.authors.join(', ') : 'Unknown'}
        </StyledBookAuthor>
      </DialogTitle>
      <StyledDialogContent>
        <StyledBookBanner>
          <img
            src={getBookImageUrl(id, { w: '130', h: '200' })}
            alt={volumeInfo?.title}
          />
        </StyledBookBanner>

        {/* Select status form */}
        <StyledModalForm>
          <StyledBookStatus>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={selectedReadStatus}
                label="Status"
                onChange={(e) => handleStatusSelect(e)}
              >
                <MenuItem value={'unread'}>Unread</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
                <MenuItem value={'candidate'}>Reading candidate</MenuItem>
                <MenuItem value={'reading'}>Currently reading</MenuItem>
              </Select>
            </FormControl>
            {(selectedReadStatus === 'read' ||
              selectedReadStatus === 'reading') && (
              <FormControl>
                <InputLabel id="meeting-select-label">
                  Select meeting
                </InputLabel>

                <Select
                  labelId="meeting-select-label"
                  id="meeting-select"
                  value={selectedMeeting}
                  label="Meeting"
                  onChange={(e) => setSelectedMeeting(e.target.value as string)}
                >
                  {meetings &&
                    meetings.map((meeting) => {
                      // If the selected readStatus is "read", only show meetings whose date is earlier than today. If "reading", only show future meetings.
                      return meeting?.data?.date &&
                        isBefore(
                          new Date(
                            selectedReadStatus === 'read'
                              ? meeting.data.date.toDate()
                              : new Date()
                          ),
                          new Date(
                            selectedReadStatus === 'read'
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
            )}
          </StyledBookStatus>
        </StyledModalForm>

        {volumeInfo?.description && (
          <StyledBookDescriptionContainer>
            <b>Description</b>
            <StyledBookDescription>
              {volumeInfo?.description}
            </StyledBookDescription>
          </StyledBookDescriptionContainer>
        )}
      </StyledDialogContent>
    </Dialog>
  );
};
