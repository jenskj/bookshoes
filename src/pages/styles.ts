import { styled } from '@mui/material';

export const StyledPageTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  marginBottom: theme.spacing(2),
}));

export const StyledPageSection = styled('section')(({ theme }) => ({
  display: 'grid',
}));
