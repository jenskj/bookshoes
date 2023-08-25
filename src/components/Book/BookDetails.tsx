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
import { DocumentData, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db, firestore } from '../../firestore';
import { FirestoreMeeting, MeetingInfo } from '../../pages';
import { FirestoreBook, ReadStatus } from '../../pages/Books/Books';
import {
  StyledBookStatus,
  StyledModalBookForm,
} from '../../pages/Books/styles';
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
  books: FirestoreBook[];
  open: boolean;
  onClose: () => void;
};

export const BookDetails = ({
  book: {
    docId,
    data: { volumeInfo, readStatus, id, scheduledMeeting },
  },
  books,
  open,
  onClose,
}: BookProps) => {
  const [selectedReadStatus, setSelectedReadStatus] = useState<ReadStatus>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [meetings, setMeetings] = useState<FirestoreMeeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string | undefined>(
    ''
  );
  const [showMeetingSelector, setShowMeetingSelector] =
    useState<boolean>(false);

  // const [addMeetingFromBook, setAddMeetingFromBook] =
  //   useState<SelectChangeEvent<string> | null>(null);

  const booksRef = firestore.collection('books');

  useEffect(() => {
    firestore.collection('meetings').onSnapshot((snapshot) => {
      const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as MeetingInfo,
      })) as FirestoreMeeting[];
      setMeetings(newMeetings);
    });
  }, []);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    setSelectedReadStatus(readStatus);
    console.log({ volumeInfo, readStatus, id, scheduledMeeting });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readStatus]);

  useEffect(() => {
    if (scheduledMeeting) {
      setShowMeetingSelector(true);
      setSelectedMeeting(scheduledMeeting);
    }
  }, [scheduledMeeting]);

  useEffect(() => {
    if (selectedMeeting) {
      addBookToMeeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMeeting]);

  const addToShelf = async () => {
    // If the book does not exist on the shelf, add it
    if (
      !docId ||
      (!books.some((bookItem) => bookItem.data.id === id) && selectedReadStatus)
    ) {
      const date = new Date();
      await booksRef.add({
        volumeInfo,
        id,
        addedDate: date.toLocaleDateString(),
        readStatus: selectedReadStatus,
        scheduledMeeting: selectedMeeting ? selectedMeeting : '',
      });
      console.log('added to shelf', {
        volumeInfo,
        id,
        addedDate: date.toLocaleDateString(),
        readStatus: selectedReadStatus,
        scheduledMeeting: selectedMeeting ? selectedMeeting : '',
      });
      // If the book already exists, update its status
    } else if (docId) {
      const bookDocRef = doc(db, 'books', docId);
      try {
        await updateDoc(bookDocRef, {
          readStatus: selectedReadStatus,
          scheduledMeeting: selectedMeeting ? selectedMeeting : '',
        });
      } catch (err) {
        alert(err);
      }
    }
  };

  const handleBookStatus = async (e: SelectChangeEvent) => {
    setShowMeetingSelector(false); // Deactivate meeting selector by default
    const selectedStatus = e.target.value as ReadStatus;
    setSelectedReadStatus(selectedStatus);
    switch (selectedStatus) {
      case 'read':
      case 'reading':
        setShowMeetingSelector(true);
        break;
      case 'candidate':
        addToShelf();
        onClose();
        break;
      default:
        // If the book status is changed to "Unread", remove it.
        if (docId && books.some((bookItem) => bookItem.data.id === id)) {
          const bookDocRef = doc(db, 'books', docId);
          try {
            await deleteDoc(bookDocRef);
            const meetingsWithBook = meetings.filter((meeting) =>
              meeting.data.books?.some((book) => book.data.id === id)
            );
            // Remove the book from any meetings that is it currently on
            meetingsWithBook.forEach(async (meeting) => {
              const meetingDocRef = doc(db, 'meetings', meeting.docId);
              const modifiedBookArray = meeting?.data?.books?.filter(
                (book) => book.data.id !== id
              );
              await updateDoc(meetingDocRef, {
                books: modifiedBookArray,
              });
            });
          } catch (err) {
            alert(err);
          }
        }
        onClose();
        break;
    }
  };

  const addBookToMeeting = async () => {
    const currentMeeting = meetings.find(
      (meeting) => meeting.docId === selectedMeeting
    );
    const bookAlreadyAddedToMeeting = currentMeeting?.data?.books?.some(
      (book) => book.data.id === id
    );

    if (!bookAlreadyAddedToMeeting && currentMeeting) {
      const booksArray = (
        currentMeeting?.data?.books?.length ? currentMeeting?.data?.books : []
      ) as FirestoreBook[];
      booksArray.push({
        data: {
          id,
          volumeInfo,
          readStatus: selectedReadStatus,
          scheduledMeeting: selectedMeeting,
        },
      });

      if (booksArray?.length && currentMeeting) {
        currentMeeting.data.books = booksArray;
        console.log('is this on?');
      }
    } else if (bookAlreadyAddedToMeeting) {
      return alert(
        `"${volumeInfo?.title}" is already scheduled for ${currentMeeting?.data.date}`
      );
    }
    if (currentMeeting?.data.date && selectedMeeting) {
      const addedDate = new Date();
      const meetingDocRef = doc(db, 'meetings', selectedMeeting);
      try {
        addToShelf();
        await updateDoc(meetingDocRef, { ...currentMeeting.data, addedDate });
      } catch (err) {
        alert(err);
      }
    }
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
            src={volumeInfo?.imageLinks?.thumbnail}
            alt={volumeInfo?.title}
          />
        </StyledBookBanner>

        {/* Select status form */}
        <StyledModalBookForm>
          <StyledBookStatus>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={selectedReadStatus}
                label="Status"
                onChange={(e) => handleBookStatus(e)}
              >
                <MenuItem value={'unread'}>Unread</MenuItem>
                <MenuItem value={'read'}>Read</MenuItem>
                <MenuItem value={'candidate'}>Reading candidate</MenuItem>
                <MenuItem value={'reading'}>Currently reading</MenuItem>
              </Select>
            </FormControl>
            {showMeetingSelector && (
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
                              ? meeting.data.date
                              : new Date()
                          ),
                          new Date(
                            selectedReadStatus === 'read'
                              ? new Date()
                              : meeting.data.date
                          )
                        ) ? (
                        <MenuItem value={meeting.docId}>
                          {meeting.data.date}
                        </MenuItem>
                      ) : null;
                    })}
                </Select>
              </FormControl>
            )}
          </StyledBookStatus>
        </StyledModalBookForm>

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
