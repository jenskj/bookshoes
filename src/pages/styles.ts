import { alpha, styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StyledPage = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  width: '100%',
  minHeight: '100%',
  position: 'relative',
  padding: theme.spacing(2, 2, 9),

  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2.5, 3, 3.5),
  },
}));

export const StyledPageTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  fontSize: `clamp(1.3rem, 3vw, ${theme.typography.h2.fontSize})`,
  margin: 0,
}));

export const StyledPageSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.95)}`,
  borderRadius: 10,
  padding: theme.spacing(2),
  background:
    `linear-gradient(
      158deg,
      ${alpha(theme.palette.common.white, 0.05)} 0%,
      ${alpha(theme.palette.common.white, 0.015)} 36%,
      transparent 70%
    ),
    linear-gradient(
      180deg,
      ${alpha(theme.palette.background.paper, 0.98)} 0%,
      ${alpha(theme.palette.background.paper, 0.9)} 100%
    )`,
  boxShadow:
    '0 12px 26px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
}));

export const StyledSectionHeading = styled('h3')(({ theme }) => ({
  ...theme.typography.h3,
  fontWeight: 600,
  color: theme.palette.text.primary,
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
