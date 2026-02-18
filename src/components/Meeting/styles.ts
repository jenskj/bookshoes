import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

export const StyledMeetingList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  position: 'relative',
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  overflowX: 'hidden',
}));

export const StyledLink = styled(Link)(({ theme }) => ({
  display: 'block',
  width: '100%',
  height: '100%',
  minWidth: 0,
  maxWidth: '100%',
  zIndex: 1,
  textAlign: 'initial',
}));

export const StyledMeetingContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: theme.spacing(1),
  position: 'relative',
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',

  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  },
}));
