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
  background: theme.palette.primary.main,
  borderRadius: 5,
  height: 175,
  padding: theme.spacing(1),
}));

export const StyledMeetingContent = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
}));

export const StyledBackgroundImageContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: '100%',
  gap: theme.spacing(1),
  transition: 'gap 300ms',

  ':hover': {
    img: {
      opacity: 0.7,
    },

    [theme.breakpoints.up('md')]: {
      gap: theme.spacing(6),
      img: {
        transform: 'scale(120%)',
      },
    },
  },
}));

export const StyledBackgroundImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxWidth: 80,
  height: 'auto',
  transition: 'opacity 300ms, transform 300ms',
  opacity: 0.2,
}));

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
  alignItems: 'center',
}));

export const StyledMeetingBottom = styled('div')(({ theme }) => ({}));

export const StyledDate = styled('h2')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledLocation = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  textTransform: 'capitalize',
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledReadingList = styled('span')(({ theme }) => ({}));
