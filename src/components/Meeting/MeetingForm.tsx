import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DocumentData, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db, firestore } from '../../firestore';
import {
  BookInfo,
  FirestoreBook,
  FirestoreMeeting,
  MeetingInfo,
} from '../../pages';
import { StyledMeetingForm } from '../../pages/Meetings/styles';

interface MeetingFormProps {
  currentId?: string;
  open: boolean;
  onClose: () => void;
}

export const MeetingForm = ({ currentId, open, onClose }: MeetingFormProps) => {
  const [form, setForm] = useState<MeetingInfo>({ location: '' }); // Location has to be empty on load, otherwise MUI gives us a warning
  const [books, setBooks] = useState<FirestoreBook[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<FirestoreBook[]>([]);

  const [meetings, setMeetings] = useState<FirestoreMeeting[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const meetingsRef = firestore.collection('meetings');

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

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
    firestore.collection('books').onSnapshot((snapshot) => {
      const newBooks = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as BookInfo,
      })) as FirestoreBook[];
      setBooks(
        newBooks.filter(
          (book) =>
            book.data.readStatus === 'candidate' ||
            book.data.readStatus === 'reading' ||
            book.data.readStatus === 'read'
        )
      );
      setSelectedBooks(
        newBooks.filter((book) => book.data.scheduledMeeting === currentId)
      );
    });
    if (currentId) {
      const docRef = doc(db, 'meetings', currentId);
      getDoc(docRef).then((meeting) => {
        setForm({
          ...meeting.data(),
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const setDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedDate = e.target.value;
    setForm({
      ...form,
      date: pickedDate || undefined,
    });
  };

  const onLocationSelect = (e: SelectChangeEvent) => {
    const pickedLocation = e.target.value;
    setForm({
      ...form,
      location: pickedLocation,
    });
  };

  const onBookSelect = (e: React.SyntheticEvent, books: FirestoreBook[]) => {
    setSelectedBooks(books);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (currentId) {
      // If the meeting already exists, update its status
      const meetingDocRef = doc(db, 'meetings', currentId);
      try {
        // Find all books that are deleted and remove their scheduled meeting:
        const currentMeeting = meetings.find(
          (meeting) => meeting.docId === currentId
        );

        const booksToAdd: string[] = [];
        const booksToRemove: string[] = [];

        // Get all books scheduled for the current meeting
        const scheduledBooks = books.filter(
          (book) => book.data.scheduledMeeting === currentId
        );

        // For each scheduled book, see if its id corresponds to any of the id's in the selectedBooks list. If it does not, add it to the booksToRemove array
        scheduledBooks.forEach((scheduledBook) => {
          if (
            scheduledBook.docId &&
            !selectedBooks.some((book) => book.docId === scheduledBook.docId)
          ) {
            // If the iterated scheduledBook does not have an id correspondent in the selectedBooks array, it should be deleted
            booksToRemove.push(scheduledBook.docId);
          }
        });

        selectedBooks.forEach((book) => {
          if (
            book.docId &&
            (!book.data.scheduledMeeting ||
              book.data.scheduledMeeting !== currentId)
          ) {
            booksToAdd.push(book.docId);
          }
        });

        await updateDoc(meetingDocRef, {
          ...form,
        }).then((res) => {
          // Make into reusable util in firestoreUtils.ts
          if (booksToRemove?.length) {
            booksToRemove.forEach(async (bookId) => {
              if (bookId) {
                const booksDocRef = doc(db, 'books', bookId);
                try {
                  await updateDoc(booksDocRef, {
                    scheduledMeeting: '',
                  });
                } catch (err) {
                  alert(err);
                }
              }
            });
          }
          // Make into reusable util in firestoreUtils.ts
          if (booksToAdd?.length) {
            booksToAdd.forEach(async (bookId) => {
              if (bookId) {
                const booksDocRef = doc(db, 'books', bookId);
                try {
                  await updateDoc(booksDocRef, {
                    scheduledMeeting: currentId,
                  });
                } catch (err) {
                  alert(err);
                }
              }
            });
          }
        });
        handleClose();
      } catch (err) {
        alert(err);
      }
    } else {
      // Create a new meeting (if a meeting with the chosen date does not already exist)
      if (!meetings.some((meeting) => meeting.data.date === form.date)) {
        const addedDate = new Date();
        await meetingsRef
          .add({
            ...form,
            addedDate: addedDate,
          })
          .then((res) => {
            if (selectedBooks) {
              selectedBooks.forEach(async (book) => {
                if (book.docId) {
                  const booksDocRef = doc(db, 'books', book.docId);
                  try {
                    console.log('update scheduled meeting');
                    await updateDoc(booksDocRef, {
                      scheduledMeeting: res.id,
                    });
                  } catch (err) {
                    alert(err);
                  }
                }
              });
            }
          });
        handleClose();
      } else {
        alert('There already exists a meeting with this date');
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth>
      <DialogTitle>
        {`${currentId ? 'Edit' : 'Schedule new'} meeting`}
        {/* <StyledMeetingFormHeader></StyledMeetingFormHeader> */}
      </DialogTitle>
      <DialogContent>
        <StyledMeetingForm>
          <FormControl fullWidth>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={form?.location}
              label="Location"
              onChange={onLocationSelect}
            >
              <MenuItem value={'henrik'}>Henrik</MenuItem>
              <MenuItem value={'jens'}>Jens</MenuItem>
              <MenuItem value={'troels'}>Troels</MenuItem>
            </Select>
          </FormControl>
          <div>
            <label>Pick a date</label>
            <input
              type="date"
              value={form?.date}
              onChange={(e) => setDate(e)}
            />
          </div>
          <div>
            <label htmlFor="books">Books</label>
            {books &&
              books.every((book) => Boolean(book?.data?.volumeInfo)) && (
                <Autocomplete
                  multiple
                  value={selectedBooks || []}
                  id="tags-standard"
                  options={books}
                  onChange={onBookSelect}
                  getOptionLabel={(option) =>
                    option?.data?.volumeInfo?.title || 'Missing title'
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Book candidates"
                      placeholder="Search books"
                    />
                  )}
                />
              )}
          </div>
        </StyledMeetingForm>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => handleSubmit(e)}>Ok</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
