import Autocomplete from '@mui/material/Autocomplete';
import { DocumentData, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db, firestore } from '../../firestore';
import { BookInfo, FirestoreBook, MeetingInfo } from '../../pages';
import { StyledMeetingForm, StyledSubmit } from '../../pages/Meetings/styles';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface MeetingFormProps {
  activeModal: boolean;
  currentId?: string;
}

export const MeetingForm = ({
  activeModal = false,
  currentId,
}: MeetingFormProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MeetingInfo>();
  const [books, setBooks] = useState<FirestoreBook[]>([]);
  const meetingsRef = firestore.collection('meetings');

  useEffect(() => {
    console.log(form);
  }, [form]);

  useEffect(() => {
    if (activeModal) {
      setOpen(true);
    }
    console.log(activeModal);
  }, [activeModal]);

  useEffect(() => {
    firestore.collection('books').onSnapshot((snapshot) => {
      const newBooks = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        data: doc.data() as BookInfo,
      })) as FirestoreBook[];
      setBooks(newBooks.filter((book) => book.data.readStatus === 'candidate'));
    });
    if (currentId) {
      console.log(currentId);
      const docRef = doc(db, 'meetings', currentId);
      getDoc(docRef).then((meeting) => {
        console.log(meeting);
        setForm({
          ...meeting.data(),
        });
      });
    }
  }, []);

  const setDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedDate = e.target.value;
    setForm({
      ...form,
      date: pickedDate || undefined,
    });
  };

  const onLocationSelect = (e: SelectChangeEvent<string>) => {
    console.log(e)
    // const pickedLocation = e.target.value;
    // setForm({
    //   ...form,
    //   location: pickedLocation,
    // });
  };

  const onBookSelect = (e: React.SyntheticEvent, books: FirestoreBook[]) => {
    setForm({
      ...form,
      books,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('submitted');
    e.preventDefault();
    if (currentId) {
      console.log(currentId);
      // If the meeting already exists, update its status
      const meetingDocRef = doc(db, 'meetings', currentId);
      try {
        await updateDoc(meetingDocRef, {
          ...form,
        });
      } catch (err) {
        alert(err);
      }
    } else {
      // Create a new meeting
      const addedDate = new Date();
      await meetingsRef.add({
        ...form,
        addedDate: addedDate,
      });
    }
  };

  return (
    <>
      {/* <Modal
      isOpen={activeModal}
      shouldCloseOnEsc={true}
      preventScroll={true}
      contentLabel="Add/edit meeting"
      style={{ overlay: { position: 'absolute', zIndex: 999 } }}
    > */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{`${
          currentId ? 'Edit' : 'Schedule new'
        } meeting`}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
          />
           <StyledMeetingForm onSubmit={handleSubmit}>
            <FormControl fullWidth>
              <InputLabel id="location">Location</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={form?.location}
                label="Age"
                onChange={(e) => onLocationSelect(e)}
              >
                <MenuItem value="jens">Jens</MenuItem>
                <MenuItem value="henrik">Henrik</MenuItem>
                <MenuItem value="troels">Troels</MenuItem>
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
            <StyledSubmit type="submit">Submit</StyledSubmit>
         
        </DialogActions>
      </Dialog>
    </>
  );
};
