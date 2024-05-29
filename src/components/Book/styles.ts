import { DialogContent, styled } from '@mui/material';
import { Link } from 'react-router-dom';

export const StyledBookCard = styled('div')(({ theme }) => ({
  borderRadius: 5,
  position: 'relative',
  display: 'flex',
  backgroundColor: theme.palette.primary.main,
  flexDirection: 'column',
  ':hover': {
    cursor: 'pointer',
  },
  height: '100%',
}));
export const StyledBookInfoContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  gridTemplateColumns: '1fr',
}));

export const StyledBookInfoTop = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-around',
  marginTop: theme.spacing(1),

  '& > *': {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
  },

  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    flexDirection: 'column',
  },
}));

export const StyledMiddleLeft = styled('div')(({ theme }) => ({
  display: 'grid',
}));

export const StyledBookInfoMiddle = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  gridTemplateColumns: '1fr 2fr',
}));

interface StyledBookImageContainerProps {
  bookAmount?: number;
}

export const StyledBookImageContainer = styled(
  'div'
)<StyledBookImageContainerProps>(({ theme, bookAmount = 1 }) => ({
  // This container is used on 'md' and up to set a specific height for the book images (to make sure they align neatly when positioned next to each other)
  maxWidth: bookAmount > 1 ? 225 : '100%',
  [theme.breakpoints.up('md')]: {
    height: bookAmount > 1 ? 225 : '100%',
  },
}));
export const StyledBookBulletinBoard = styled('div')(({ theme }) => ({}));

export const StyledBookInfoBottom = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

// BookCover
export const StyledBookCoverContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  borderRadius: 3,
  overflow: 'hidden',
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
}));

export const StyledBookCover = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

export const StyledBookDetailsHeader = styled('div')(({ theme }) => ({
  textAlign: 'center',
}));

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const StyledBookBanner = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 200,
}));
export const StyledBookInfoCard = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'grid',
  width: '100%',
  gap: theme.spacing(1),

  [theme.breakpoints.down('md')]: {
    height: '100%',
  },
}));

export const StyledBookDetails = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

export const StyledBookDescriptionContainer = styled('div')(() => ({}));
export const StyledBookDescription = styled('div')(({ theme }) => ({
  fontSize: '1rem',
  backgroundColor: theme.palette.background.paper,
}));

export const StyledBookStatusIcon = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: 3,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(0.2),
  svg: {
    color: theme.palette.primary.main,
  },
}));

export const StyledBookStatusDetails = styled('div')(({ theme }) => ({
  display: 'grid',
  backgroundColor: theme.palette.background.paper,
}));

export const StyledBookRatingContainer = styled('div')(({ theme }) => ({}));

export const StyledBookInfo = styled('div')(({ theme }) => ({
  flexDirection: 'column',
}));

export const StyledTitle = styled('h3')(({ theme }) => ({
  textAlign: 'center',
  width: '100%',
}));

export const StyledHr = styled('hr')(({ theme }) => ({
  border: '1px solid black',
  height: 1,
  backgroundColor: 'black',
  margin: theme.spacing(1, 0),
  width: '100%',
}));

export const StyledAuthor = styled('div')(({ theme }) => ({
  span: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

export const StyledInfoList = styled('div')(({ theme }) => ({}));

// BookHeader
export const StyledBookHeader = styled('div')(({ theme }) => ({}));

export const StyledBookTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledBookAuthor = styled('div')(() => ({
  fontSize: '1rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledScheduledMeetings = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledMeetingLinkDate = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const StyledMeetingLinkLocation = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

export const StyledMeetingLink = styled(Link)(({ theme }) => ({
  display: 'grid',
  textAlign: 'center',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  borderRadius: 5,
}));

