import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import {
  DocumentData,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookInfo, FirestoreBook, MeetingInfo } from '..';
import { MeetingForm } from '../../components';
import { BookStatusDetails } from '../../components/Book/BookStatusDetails';
import { db, firestore } from '../../firestore';
import { LocationNames } from '../../utils/LocationNames';
import {
  StyledActions,
  StyledBooksBanner,
  StyledDateHeader,
  StyledHeader,
  StyledLocation,
  StyledMeetingDetailsPage,
} from './styles';
import { formatDate } from '../../utils/formatDate';

export const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingInfo>();
  const [books, setBooks] = useState<FirestoreBook[]>([]);
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const theme = useTheme();
  const isSmallOrLess = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    if (id) {
      const docRef = doc(db, 'meetings', id);
      getDoc(docRef).then((res) => {
        setMeeting({ ...res.data() });
      });
      // Get books filtered based on their scheduledMeeting prop
      firestore.collection('books').onSnapshot((snapshot) => {
        const newBooks = snapshot.docs.map((doc: DocumentData) => ({
          docId: doc.id,
          data: doc.data() as BookInfo,
        })) as FirestoreBook[];
        setBooks(newBooks.filter((book) => book.data.scheduledMeeting === id));
      });
    }
  }, [id]);

  const deleteMeeting = async () => {
    if (id) {
      const meetingDocRef = doc(db, 'meetings', id);
      try {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Are you sure you want to delete this meeting?')) {
          await deleteDoc(meetingDocRef).then(() => {
            // Get all books scheduled for the current meeting
            const scheduledBooks = books.filter(
              (book) => book.data.scheduledMeeting === id
            );
            if (scheduledBooks?.length) {
              scheduledBooks.forEach(async (book) => {
                if (book?.docId) {
                  const booksDocRef = doc(db, 'books', book.docId);
                  try {
                    await updateDoc(booksDocRef, {
                      scheduledMeeting: '',
                      readStatus: 'candidate',
                    });
                  } catch (err) {
                    alert(err);
                  }
                }
              });
            }
          });
          navigate(-1);
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  return (
    <StyledMeetingDetailsPage>
      <StyledHeader>
        {/* Empty element necessary for evening the flex 1 assignment for bigger screens */}
        {isSmallOrLess && <div></div>}
        <StyledDateHeader>
          {meeting?.date
            ? `Meeting scheduled for ${formatDate(meeting.date)}`
            : 'No date scheduled yet'}
        </StyledDateHeader>
        <StyledActions>
          <Tooltip title="Edit meeting">
            <IconButton
              onClick={() => setActiveModal(true)}
              size={!isSmallOrLess ? 'small' : 'large'}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete meeting">
            <IconButton
              onClick={deleteMeeting}
              size={!isSmallOrLess ? 'small' : 'large'}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </StyledActions>
      </StyledHeader>
      <StyledLocation>{`Location: ${
        meeting?.location
          ? LocationNames[meeting.location as keyof typeof LocationNames]
          : 'unknown...'
      }`}</StyledLocation>
      <h3>Books:</h3>
      <StyledBooksBanner bookAmount={books?.length || 0}>
        {books?.map(
          (book) =>
            book?.data?.volumeInfo && (
              <BookStatusDetails
                key={book.docId}
                book={book}
                bookAmount={books.length}
              />
            )
        )}
      </StyledBooksBanner>

      <MeetingForm
        open={activeModal}
        currentId={id}
        onClose={() => setActiveModal(false)}
      />
    </StyledMeetingDetailsPage>
  );
};
