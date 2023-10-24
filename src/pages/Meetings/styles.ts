import { styled } from '@mui/material';
import { StyledResetButton } from '../../shared/styles';
import { Link } from 'react-router-dom';

export const StyledMeetingList = styled('div')(({ theme }) => ({
  textAlign: 'end',
  position: 'relative',
}));

export const StyledLink = styled(Link)(({ theme }) => ({
  zIndex: 1,
  textAlign: 'initial',
}));

export const StyledMeetingContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(1),
  position: 'relative',
}));

export const StyledMeeting = styled('div')(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.primary.main,
  borderRadius: 5,
  height: 175,
  zIndex: 1,

  ':hover': {
    img: {
      opacity: 0.7,
      // transform: 'scale(0.5)',
    },

    '#background-image': {
      '::after': {
        opacity: 1,
      },
    },

    // This is necessary as material/styled does not support component selectors for some reason
    '#meeting-header': {
      '::after': {
        opacity: 0.5,
      },
    },

    '#meeting-bottom': {
      opacity: 0,
    },
  },
}));

export const StyledMeetingContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
}));

interface StyledBackgroundImageContainerProps {
  bookAmount: number;
}

export const StyledBackgroundImageContainer = styled(
  'div'
)<StyledBackgroundImageContainerProps>(({ theme, bookAmount }) => ({
  position: 'absolute',
  display: 'grid',
  gridTemplateColumns: `repeat(${bookAmount}, minmax(92px, 1fr))`,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: '100%',
  gap: theme.spacing(1),
}));

interface StyledBackgroundImageProps {
  src: string;
}

export const StyledBackgroundImage = styled('div')<StyledBackgroundImageProps>(
  ({ theme, src }) => ({
    position: 'relative',
    width: '100%',
    transition: 'opacity 300ms, transform 300ms',
    zIndex: -1,

    '::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: `url(${src}) no-repeat center center`,
      opacity: 0.2,
      transition: 'opacity 300ms',
      backgroundPosition: '0 10%',
      backgroundSize: 'cover',
    },
  })
);

export const StyledAddNewButton = styled(StyledResetButton)(({ theme }) => ({
  position: 'sticky',
  backgroundColor: theme.palette.secondary.dark,
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  marginRight: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: 66,
  fontSize: 34,
  color: 'white',
  fontWeight: 'bold',
  top: `calc(100% - ${theme.spacing(8)})`,
  borderRadius: 5,
  zIndex: theme.zIndex.modal,
}));

export const StyledButtonWrapper = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}));

export const StyledMeetingForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const StyledMeetingFormHeader = styled('div')(({ theme }) => ({}));

export const StyledMeetingHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  justifyContent: 'space-between',
  padding: theme.spacing(1),

  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.background.paper,
    transition: 'opacity 300ms',
    opacity: 0,
    zIndex: -1,
  },
}));

export const StyledHeaderLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const StyledMeetingBottom = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  transition: 'opacity 300ms',
}));

export const StyledDate = styled('h2')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledLocation = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  textTransform: 'capitalize',
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledReadingList = styled('span')(({ theme }) => ({}));
