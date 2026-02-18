import { styled } from '@mui/material';
import { StyledPageTitle } from '@pages/styles';

export const StyledMeetings = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  overflowX: 'hidden',
  '.swiper, .swiper-wrapper, .swiper-slide': {
    minWidth: 0,
    maxWidth: '100%',
  },
}));

export const StyledMeeting = styled('div')(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.primary.light,
  borderRadius: 5,
  minHeight: 175,
  height: '100%',
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  zIndex: 1,
  display: 'grid',

  '@media (hover: hover)': {
    ':hover': {
      img: {
        opacity: 0.7,
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
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: 160,
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
)<StyledBackgroundImageContainerProps>(({ theme, bookAmount }) => {
  const safeBookAmount = Math.max(bookAmount, 1);
  return {
    position: 'absolute',
    display: 'grid',
    gridTemplateColumns: `repeat(${safeBookAmount}, minmax(0, 1fr))`,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    gap: theme.spacing(1),
  };
});

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
  alignItems: 'flex-start',
  gap: theme.spacing(1),
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
  minWidth: 0,
}));

export const StyledMeetingBottom = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
  transition: 'opacity 300ms',
}));

export const StyledDate = styled('h2')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  fontSize: 'clamp(0.95rem, 2.9vw, 1.1rem)',
}));

export const StyledLocation = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  textTransform: 'capitalize',
  fontWeight: theme.typography.fontWeightBold,
  fontSize: 'clamp(0.78rem, 2.7vw, 0.95rem)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const StyledReadingList = styled('span')(() => ({
  display: '-webkit-box',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: 1.25,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
}));

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
    gap: theme.spacing(1.2),
    gridTemplateColumns:
      bookAmount > 1 ? 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' : '1fr',
  })
);
export const StyledHeader = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
  justifyItems: 'stretch',
}));

export const StyledTopHeader = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  width: '100%',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr auto',
    '> :first-of-type': {
      display: 'none',
    },
  },
}));

export const StyledTitleContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 0,
  gap: theme.spacing(1),

  [theme.breakpoints.down('sm')]: {
    justifyContent: 'flex-start',
  },
}));

export const StyledMeetingPageTitle = styled(StyledPageTitle)(({ theme }) => ({
  margin: `0 0 ${theme.spacing(0.5)} 0`,
}));

export const StyledDetailsLocation = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
  flexWrap: 'wrap',
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
  width: 'auto',
}));
