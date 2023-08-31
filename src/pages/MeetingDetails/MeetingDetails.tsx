import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MeetingInfo } from '..';
import { MeetingForm } from '../../components';
import { BookStatusDetails } from '../../components/Book/BookStatusDetails';
import { db } from '../../firestore';
import { LocationNames } from '../../utils/LocationNames';
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
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<MeetingInfo>();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const theme = useTheme();
  const isSmallOrLess = useMediaQuery(theme.breakpoints.up('md'));

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
    <StyledMeetingDetailsPage>
      <StyledHeader>
        {/* empty element necessary for evening the flex 1 assignment for bigger screens */}
        {isSmallOrLess && <div></div>}
        <StyledDateHeader>
          {meeting?.date
            ? `Meeting scheduled for ${meeting.date}`
            : 'No date scheduled yet'}
        </StyledDateHeader>
        <StyledActions>
          <Tooltip title="Edit meeting">
            <IconButton size={!isSmallOrLess ? 'small' : 'large'}>
              <EditIcon onClick={() => setActiveModal(true)} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete meeting">
            <IconButton size={!isSmallOrLess ? 'small' : 'large'}>
              <DeleteIcon onClick={deleteMeeting} />
            </IconButton>
          </Tooltip>
        </StyledActions>
      </StyledHeader>
      <StyledLocation>{`Location: ${
        meeting?.location
          ? LocationNames[meeting.location as keyof typeof LocationNames]
          : 'unknown...'
      }`}</StyledLocation>
      <StyledBooksBanner bookAmount={meeting?.books?.length || 0}>
        {meeting?.books?.map(
          (book) =>
            book?.data?.volumeInfo && (
              <BookStatusDetails key={book.docId} book={book} />
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
