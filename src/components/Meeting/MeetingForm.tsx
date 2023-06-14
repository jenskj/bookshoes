import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { DocumentData, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db, firestore } from '../../firestore';
import { BookInfo, FirestoreBook, MeetingInfo } from '../../pages';
import {
  StyledMeetingForm,
  StyledMeetingFormHeader,
  StyledSubmit,
} from '../../pages/Meetings/styles';

interface MeetingFormProps {
  currentId?: string;
}

export const MeetingForm = ({ currentId }: MeetingFormProps) => {
  const [form, setForm] = useState<MeetingInfo>();
  const [books, setBooks] = useState<FirestoreBook[]>([]);
  const meetingsRef = firestore.collection('meetings');

  useEffect(() => {
    console.log(form);
  }, [form]);

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

  const onLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      <StyledMeetingFormHeader>{`${
        currentId ? 'Edit' : 'Schedule new'
      } meeting`}</StyledMeetingFormHeader>
      <StyledMeetingForm onSubmit={handleSubmit}>
        <div>
          <label htmlFor="location">Location</label>
          <select
            onChange={(e) => onLocationSelect(e)}
            value={form?.location}
            name="location"
          >
            <option value="jens">Jens</option>
            <option value="henrik">Henrik</option>
            <option value="troels">Troels</option>
          </select>
        </div>
        <div>
          <label>Pick a date</label>
          <input type="date" value={form?.date} onChange={(e) => setDate(e)} />
        </div>
        <div>
          <label htmlFor="books">Books</label>
          {books && books.every((book) => Boolean(book?.data?.volumeInfo)) && (
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
        <StyledSubmit type="submit">Submit</StyledSubmit>
      </StyledMeetingForm>
    </>
  );
};
