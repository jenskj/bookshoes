import { styled } from '@mui/material';

export const StyledClubsSectionsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledMemberSection = styled('div')(({ theme }) => ({}));
export const StyledNewSection = styled('div')(({ theme }) => ({}));

export const StyledClubsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gridAutoRows: 'minmax(150px, 1fr)',
  gap: theme.spacing(2),
}));

export const StyledClubDetailsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));
