import { styled } from '@mui/material';

export const StyledAppContainer = styled('div')(({ theme }) => ({
  maxWidth: theme.breakpoints.values.lg,
  height: '100%',
  backgroundColor: theme.palette.background.default,
  margin: 'auto',
}));

export const StyledContent = styled('div')(({ theme }) => ({
  height: '100%',
}));
