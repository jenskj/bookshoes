import { BookStatusDetails, CommentSection, MeetingForm } from '@components';
import { db } from '@firestore';
import { useBookStore, useCurrentUserStore } from '@hooks';
import { Edit } from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import {
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import { StyledSectionHeading } from '@pages/styles';
import { FirestoreBook, FirestoreMeeting, MeetingInfo } from '@types';
import { formatDate } from '@utils';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { MouseEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  StyledActions,
  StyledBooksBanner,
  StyledDetailsLocation,
  StyledHeader,
  StyledMeetingPageTitle,
  StyledTitleContainer,
  StyledTopHeader,
} from './styles';

export const MeetingDetails = () => {
  const { id } = useParams();
  const { activeClub } = useCurrentUserStore();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<FirestoreMeeting>();
  const { books } = useBookStore();
  const [meetingBooks, setMeetingBooks] = useState<FirestoreBook[]>([]);
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

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
        setMeeting({ docId: id, data: res.data() as MeetingInfo });
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
    <>
      <StyledHeader>
        <StyledTopHeader>
          {/* Ensures even positioning of top header elements */}
          <div></div>
          <StyledTitleContainer>
            {meeting?.data?.date ? (
              <>
                <ScheduleIcon />
                <StyledMeetingPageTitle>
                  {formatDate(meeting.data.date, true)}
                </StyledMeetingPageTitle>
              </>
            ) : (
              'No date scheduled yet'
            )}
          </StyledTitleContainer>
          <StyledActions>
            <Tooltip title="Options">
              <IconButton size="small" onClick={handleOpenUserMenu}>
                <MoreHorizIcon />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem disabled sx={{ paddingBottom: 0, textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  align="center"
                  sx={{ textTransform: 'uppercase' }}
                >
                  Meeting options
                </Typography>
              </MenuItem>
              <Divider />
              <div onClick={handleCloseUserMenu}>
                <MenuItem onClick={() => setActiveModal(true)}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Edit</Typography>
                </MenuItem>
              </div>
              <div onClick={handleCloseUserMenu}>
                <MenuItem onClick={deleteMeeting}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Delete</Typography>
                </MenuItem>
              </div>
            </Menu>
          </StyledActions>
        </StyledTopHeader>
        <StyledDetailsLocation>
          {meeting?.data.location?.remoteInfo ? (
            'Remote'
          ) : (
            <>
              <PlaceIcon />
              {meeting?.data.location?.user?.displayName || 'unknown...'}
            </>
          )}
        </StyledDetailsLocation>
      </StyledHeader>

      {meeting ? (
        <>
          <StyledSectionHeading>Comments</StyledSectionHeading>
          <CommentSection meetingId={id} />
        </>
      ) : null}

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
    </>
  );
};
