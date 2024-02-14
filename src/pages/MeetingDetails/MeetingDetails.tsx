import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MeetingForm } from '../../components';
import { BookStatusDetails } from '../../components/Book/BookStatusDetails';
import { db } from '../../firestore';
import { useBookStore, useCurrentUserStore } from '../../hooks';
import { FirestoreBook, MeetingInfo } from '../../types';
import { formatDate } from '../../utils/formatDate';
import {
  StyledActions,
  StyledBooksBanner,
  StyledDateHeader,
  StyledHeader,
  StyledLocation,
  StyledMeetingDetailsPage,
} from './styles';

export const MeetingDetails = () => {
  const { id } = useParams();
  const { activeClub } = useCurrentUserStore();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingInfo>();
  const { books } = useBookStore();
  const [meetingBooks, setMeetingBooks] = useState<FirestoreBook[]>([]);
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const theme = useTheme();
  const isSmallOrLess = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    if (id && activeClub) {
      updateMeeting();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeClub]);

  useEffect(() => {
    setMeetingBooks(books.filter((book) => book.data.scheduledMeeting === id));
  }, [books, id]);

  const updateMeeting = () => {
    if (id) {
      const docRef = doc(db, `clubs/${activeClub?.docId}/meetings`, id);
      getDoc(docRef).then((res) => {
        setMeeting({ ...res.data() });
      });
    }
  };

  const deleteMeeting = async () => {
    if (id) {
      const meetingDocRef = doc(db, `clubs/${activeClub?.docId}/meetings`, id);
      try {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('Are you sure you want to delete this meeting?')) {
          await deleteDoc(meetingDocRef).then(() => {
            if (meetingBooks?.length) {
              meetingBooks.forEach(async (book) => {
                if (book?.docId) {
                  const booksDocRef = doc(
                    db,
                    `clubs/${activeClub?.docId}/books`,
                    book.docId
                  );
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

  const onClose = (changesSubmitted: boolean = false) => {
    setActiveModal(false);
    if (changesSubmitted) {
      updateMeeting();
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
          ? meeting.location
          : 'unknown...'
      }`}</StyledLocation>
      <h3>Books:</h3>
      <StyledBooksBanner bookAmount={meetingBooks?.length || 0}>
        {meetingBooks?.map(
          (book) =>
            book?.data?.volumeInfo && (
              <BookStatusDetails
                key={book.docId}
                book={book}
                bookAmount={meetingBooks.length}
              />
            )
        )}
      </StyledBooksBanner>

      <MeetingForm open={activeModal} currentId={id} onClose={onClose} />
    </StyledMeetingDetailsPage>
  );
};
