import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { StyledPageSection } from '@pages/styles';
import { StyledResetButton } from '@shared/styles';
import { Link } from 'react-router-dom';

export const StyledBooks = styled('div')(({ theme }) => ({}));

export const StyledBookContainer = styled('div')(({ theme }) => ({
  margin: '0 auto',
  borderRadius: 4,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gridGap: '1rem',
}));

export const StyledModalCloseButton = styled('button')(({ theme }) => ({
  padding: '0.5rem',
  backgroundColor: 'white',
  fontSize: '1rem',
  position: 'absolute',
  left: theme.spacing(1),
}));

export const StyledModalHeader = styled('header')(({ theme }) => ({
  marginBottom: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0),
}));

export const StyledModalHeaderTop = styled('div')(({ theme }) => ({
  width: '100%',
}));

export const StyledBookStatus = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: theme.spacing(2),
}));

export const StyledSearchForm = styled('form')(({ theme }) => ({
  position: 'relative',
  '> input': {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: '0 1rem',
    outline: 0,
    margin: -3,
    left: 3,
  },
}));

export const StyledSearchButton = styled(StyledResetButton)(({ theme }) => ({
  position: 'absolute',
  top: '25%',
  right: theme.spacing(-1),
}));

export const StyledBookshelfTop = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

export const StyledTopLeft = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const StyledStatusSelect = styled('select')(({ theme }) => ({
  display: 'flex',
}));

// BookDetails
export const StyledBookDetails = styled('div')(({ theme }) => ({}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  maxWidth: 200,
}));

export const StyledHeaderContainer = styled('div')(({ theme }) => ({
  justifyContent: 'space-between',
  display: 'flex',
  gap: theme.spacing(2),
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

export const StyledBookDetailsMiddle = styled(StyledPageSection)(
  ({ theme }) => ({
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: '1fr 1fr',
    },
  })
);
