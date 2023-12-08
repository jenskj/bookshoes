import { styled } from '@mui/material';

export const StyledPageTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  marginBottom: theme.spacing(2),
}));

export const StyledPageSection = styled('section')(({ theme }) => ({
  display: 'grid',
  overflowX: 'hidden',
}));

export const StyledBookCarousel = styled('div')(({ theme }) => ({
  display: 'flex',
  overflowX: 'scroll',
  flexWrap: 'nowrap',
  gap: theme.spacing(1),
  overscrollBehaviorX: 'contain',
  scrollSnapType: 'inline mandatory',

  '> *': {
    scrollSnapAlign: 'start',
  },

  '::-webkit-scrollbar': {
    display: 'none',
  },
}));
