import { styled } from '@mui/material';

export const StyledClubCard = styled('div')(({ theme }) => ({
  display: 'grid',
  justifyItems: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  height: '100%',
}));
export const StyledTop = styled('div')(({ theme }) => ({}));
export const StyledClubName = styled('div')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));
export const StyledBottom = styled('div')(({ theme }) => ({}));

export const StyledModalClubForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));
