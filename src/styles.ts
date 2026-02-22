import { styled } from '@mui/material';

export const StyledAppContainer = styled('div')(({ theme }) => ({
  maxWidth: theme.breakpoints.values.xl,
  minHeight: '100%',
  background: 'transparent',
  margin: 'auto',
  position: 'relative',
}));

export const StyledContent = styled('div')(({ theme }) => ({
  minHeight: '100%',
  position: 'relative',
}));

export const StyledLoadingState = styled('div')(() => ({
  minHeight: '40vh',
  display: 'grid',
  placeItems: 'center',
}));
