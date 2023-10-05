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
  padding: theme.spacing(1),
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
      background: theme.palette.background.paper,
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

  // Calculate background sizes based on the amount of book cover to be shown
  'div::after': {
    backgroundSize: `${1008 / bookAmount}px ${(1008 / bookAmount) * 2}px`,
  },
}));

interface StyledBackgrounImageProps {
  src: string;
}

export const StyledBackgroundImage = styled('div')<StyledBackgrounImageProps>(
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
  justifyContent: 'space-between',
  transition: 'background-color 300ms',
  padding: theme.spacing(1),
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
