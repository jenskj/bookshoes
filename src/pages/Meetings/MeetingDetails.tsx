import { BookStatusDetails, CommentSection, MeetingForm } from '@components';
import { supabase } from '@lib/supabase';
import { useToast } from '@lib/ToastContext';
import { mapMeetingRow } from '@lib/mappers';
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
  Typography,
} from '@mui/material';
import { StyledSectionHeading } from '@pages/styles';
import { Book, Meeting, MeetingInfo } from '@types';
import { deleteMeeting, formatDate } from '@utils';
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
  const { showError } = useToast();
  const { activeClub } = useCurrentUserStore();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting>();
  const { books } = useBookStore();
  const [meetingBooks, setMeetingBooks] = useState<Book[]>([]);
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
  }, [id, activeClub]);

  useEffect(() => {
    setMeetingBooks(
      books.filter((book) => id && book.data.scheduledMeetings?.includes(id))
    );
  }, [books, id]);

  const updateMeeting = () => {
    if (!id) return;
    supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setMeeting(mapMeetingRow(data));
      });
  };

  const deleteMeeting = async () => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(activeClub!.docId, id);
        navigate(-1);
      } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const onClose = (changesSubmitted: boolean = false) => {
    setActiveModal(false);
    if (changesSubmitted) {
      updateMeeting();
    }
  };

  const meetingDate = meeting?.data?.date;
  const dateForFormat = meetingDate
    ? typeof meetingDate === 'string'
      ? meetingDate
      : (meetingDate as { seconds?: number })?.seconds
        ? new Date((meetingDate as { seconds: number }).seconds * 1000)
        : null
    : null;

  return (
    <>
      <StyledHeader>
        <StyledTopHeader>
          <div></div>
          <StyledTitleContainer>
            {dateForFormat ? (
              <>
                <ScheduleIcon />
                <StyledMeetingPageTitle>
                  {formatDate(dateForFormat, true)}
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
          {meeting?.data?.location?.remoteInfo ? (
            'Remote'
          ) : (
            <>
              <PlaceIcon />
              {meeting?.data?.location?.user?.displayName || 'unknown...'}
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

      {activeModal ? (
        <MeetingForm open={activeModal} currentId={id} onClose={onClose} />
      ) : null}
    </>
  );
};
