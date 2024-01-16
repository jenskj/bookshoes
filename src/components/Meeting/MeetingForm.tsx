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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { isBefore, isEqual } from 'date-fns';
import da from 'date-fns/locale/da';
import { Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db, firestore } from '../../firestore';
import {
  useBookStore,
  useCurrentUserStore,
  useMeetingStore,
} from '../../hooks';
import { StyledModalForm } from '../../shared/styles';
import { FirestoreBook, MeetingInfo } from '../../types';

interface MeetingFormProps {
  currentId?: string;
  open: boolean;
  onClose: (changesSubmitted: boolean) => void;
}

export const MeetingForm = ({ currentId, open, onClose }: MeetingFormProps) => {
  const [form, setForm] = useState<MeetingInfo>({ location: '' }); // Location has to be empty on load, otherwise MUI gives us a warning
  const [selectedBooks, setSelectedBooks] = useState<FirestoreBook[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { activeClub } = useCurrentUserStore();

  const { meetings } = useMeetingStore();
  const { books } = useBookStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    setSelectedBooks(
      books.filter((book) => book.data.scheduledMeeting === currentId)
    );
    if (currentId) {
      const docRef = doc(db, `clubs/${activeClub?.docId}/meetings`, currentId);
      getDoc(docRef).then((meeting) => {
        setForm({
          ...meeting.data(),
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books]);

  useEffect(() => {
    if (selectedDate !== null) {
      if (form?.date && isEqual(selectedDate, form?.date?.toDate())) {
        // If the selected is the same as before, do nothing
        return;
      } else {
        // If it is different, convert it to Timestamp and set the new date
        const dateAsTimestamp = Timestamp.fromDate(selectedDate);
        setForm({ ...form, date: dateAsTimestamp });
      }
    } else if (form.date) {
      // If no date is selected, set the previously selected date
      setSelectedDate(form.date.toDate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, form.date]);

  const handleClose = (changesSubmitted = false) => {
    setIsOpen(false);
    onClose(changesSubmitted);
  };

  const setDate = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
    }
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
      const meetingDocRef = doc(
        db,
        `clubs/${activeClub?.docId}/meetings`,
        currentId
      );

      try {
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
              if (bookId && activeClub) {
                const bookDocRef = doc(
                  db,
                  `clubs/${activeClub?.docId}/books`,
                  bookId
                );
                try {
                  await updateDoc(bookDocRef, {
                    scheduledMeeting: '',
                    readStatus: 'candidate',
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
              if (bookId && activeClub) {
                const bookDocRef = doc(
                  db,
                  `clubs/${activeClub?.docId}/books`,
                  bookId
                );
                try {
                  await updateDoc(bookDocRef, {
                    scheduledMeeting: currentId,
                    // Change the readStatus based on whether the scheduled date is before or after the current time
                    readStatus:
                      form?.date && isBefore(form?.date?.toDate(), new Date())
                        ? 'read'
                        : 'reading',
                  });
                } catch (err) {
                  alert(err);
                }
              }
            });
          }
        });
        handleClose(true);
      } catch (err) {
        alert(err);
      }
    } else {
      // Create a new meeting (if a meeting with the chosen date does not already exist)
      if (
        !meetings.some(
          (meeting) => meeting.data.date?.toDate() === form.date?.toDate()
        )
      ) {
        const meetingsRef = firestore
          .collection('clubs')
          .doc(activeClub?.docId)
          .collection('meetings');
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
                  const bookDocRef = doc(
                    db,
                    `clubs/${activeClub?.docId}/books`,
                    book.docId
                  );
                  try {
                    await updateDoc(bookDocRef, {
                      scheduledMeeting: res.id,
                      readStatus:
                        selectedDate && isBefore(selectedDate, new Date())
                          ? 'read'
                          : 'reading',
                    });
                  } catch (err) {
                    alert(err);
                  }
                }
              });
            }
            handleClose();
          });
      } else {
        alert('A meeting with this date already exists');
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => handleClose(false)} fullWidth>
      <DialogTitle>
        {`${currentId ? 'Edit' : 'Schedule new'} meeting`}
      </DialogTitle>
      <DialogContent>
        <StyledModalForm>
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
          <FormControl>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={da}
            >
              <DateTimePicker
                label="Pick date/time"
                onChange={(e) => setDate(e)}
                value={selectedDate}
              />
            </LocalizationProvider>
          </FormControl>
          <FormControl>
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
          </FormControl>
        </StyledModalForm>
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => handleSubmit(e)}>Ok</Button>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
