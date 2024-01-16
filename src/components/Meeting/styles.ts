import { styled } from '@mui/material';
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
