import { styled } from '@mui/material';
import { StyledPageTitle } from '@pages/styles';
import { StyledResetButton } from '@shared/styles';

export const StyledMeetings = styled('div')(({ theme }) => ({}));

export const StyledMeeting = styled('div')(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.primary.light,
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
  url: string;
}

export const StyledBackgroundImage = styled('div')<StyledBackgroundImageProps>(
  ({ theme, url }) => ({
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
      background: `url(${url}) no-repeat center center`,
      opacity: 0.2,
      transition: 'opacity 300ms',
      backgroundPosition: '0 10%',
      backgroundSize: 'cover',
    },
  })
);

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

// MeetingDetails styles
export const StyledMeetingDetailsPage = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

interface StyledBooksBannerProps {
  bookAmount: number;
}

export const StyledBooksBanner = styled('div')<StyledBooksBannerProps>(
  ({ theme, bookAmount }) => ({
    display: 'grid',
    gridGap: '1rem',

    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: `repeat(${
        bookAmount <= 1 ? 1 : 2
      }, minmax(65px, 1fr))`,
    },
  })
);
export const StyledHeader = styled('div')(({ theme }) => ({
  display: 'grid',
  justifyItems: 'center',
}));

export const StyledTopHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',

  '> *': {
    flex: 1,
  },
}));

export const StyledTitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexBasis: '50%',
  gap: theme.spacing(1),
}));

export const StyledMeetingPageTitle = styled(StyledPageTitle)(({ theme }) => ({
  margin: `0 0 ${theme.spacing(0.5)} 0`,
}));

export const StyledDetailsLocation = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledDateHeader = styled('h2')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    whiteSpace: 'nowrap',
  },
}));

export const StyledActions = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
}));
