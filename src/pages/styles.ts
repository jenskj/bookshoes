import { styled } from '@mui/material';
import { Link } from 'react-router-dom';

export const StyledPage = styled('div')(({ theme }) => ({
  display: 'flex', // I would instinctively have made this a grid, but it doesn't work well with the swipers
  flexDirection: 'column',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  width: '100%',
  minHeight: '100%',
  position: 'relative',
  padding: theme.spacing(2, 2, 8),

  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  },
}));

export const StyledPageTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  textAlign: 'center',
  fontSize: `clamp(1.25rem, 3vw, ${theme.typography.h2.fontSize})`,
  margin: `0 auto ${theme.spacing(1)} auto`,
}));

export const StyledPageSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledSectionHeading = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  fontWeight: theme.typography.fontWeightBold,
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

export const StyledBookLink = styled(Link)(({ theme }) => ({
  width: 150,
}));


