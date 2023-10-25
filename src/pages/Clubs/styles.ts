import { styled } from '@mui/material';

export const StyledClubsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
}));

export const StyledClubDetailsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));
