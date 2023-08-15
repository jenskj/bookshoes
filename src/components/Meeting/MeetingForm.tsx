import { TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
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
  const [meetings, setMeetings] = useState<FirestoreMeeting[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const meetingsRef = firestore.collection('meetings');

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    firestore.collection('meetings').onSnapshot((snapshot) => {
      const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        data: doc.data() as MeetingInfo,
      })) as FirestoreMeeting[];
      setMeetings(newMeetings);
    });
  }, []);

  useEffect(() => {
    firestore.collection('books').onSnapshot((snapshot) => {
      const newBooks = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        data: doc.data() as BookInfo,
      })) as FirestoreBook[];
      setBooks(newBooks.filter((book) => book.data.readStatus === 'candidate'));
    });
    if (currentId) {
      const docRef = doc(db, 'meetings', currentId);
      getDoc(docRef).then((meeting) => {
        setForm({
          ...meeting.data(),
        });
      });
    }
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
    setForm({
      ...form,
      books,
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (currentId) {
      // If the meeting already exists, update its status
      const meetingDocRef = doc(db, 'meetings', currentId);
      try {
        await updateDoc(meetingDocRef, {
          ...form,
        });
        handleClose();
      } catch (err) {
        alert(err);
      }
    } else {
      // Create a new meeting (if a meeting with the chosen date does not already exist)
      if (!meetings.some((meeting) => meeting.data.date === form.date)) {
        const addedDate = new Date();
        await meetingsRef.add({
          ...form,
          addedDate: addedDate,
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
        <DialogContentText></DialogContentText>
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
              <MenuItem value={'henrik'}>Jens</MenuItem>
              <MenuItem value={'troels'}>Troels</MenuItem>
              <MenuItem value={'jens'}>Jens</MenuItem>
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
                  value={form?.books || []}
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
