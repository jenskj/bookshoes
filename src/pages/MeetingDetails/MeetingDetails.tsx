import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MeetingInfo } from '..';
import { BookListItem, MeetingForm } from '../../components';
import { db } from '../../firestore';
import { StyledBooksBanner } from './styles';

export const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingInfo>();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  //   const [books, setBooks] = useState<BookInfo[]>();

  useEffect(() => {
    if (id) {
      const docRef = doc(db, 'meetings', id);
      getDoc(docRef).then((res) => {
        setMeeting({ ...res.data() });
      });
    }
  }, [id]);

  const deleteMeeting = async () => {
    if (id) {
      const meetingDocRef = doc(db, 'meetings', id);
      try {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Are you sure you want to delete this meeting?')) {
          await deleteDoc(meetingDocRef);
          navigate(-1);
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <div>
      <EditIcon onClick={() => setActiveModal(true)} />
      <DeleteIcon onClick={deleteMeeting} />
      <StyledBooksBanner>
        {meeting?.books?.map(
          (book) =>
            book?.data?.volumeInfo && <BookListItem key={book.id} book={book} />
        )}
      </StyledBooksBanner>

      <MeetingForm
        open={activeModal}
        currentId={id}
        onClose={() => setActiveModal(false)}
      />
    </div>
  );
};
