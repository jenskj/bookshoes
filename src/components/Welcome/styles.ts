import { styled } from '@mui/material';

export const StyledActionsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  minHeight: 80,

  [theme.breakpoints.up('md')]: {
    minHeight: 120,
  },

  '> *': {
    flex: '1',
  },
}));
