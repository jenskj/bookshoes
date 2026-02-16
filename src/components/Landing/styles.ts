import { Box, styled } from '@mui/material';
import { StyledPageSection } from '@pages/styles';

export const StyledLandingRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(4),
  padding: theme.spacing(3, 2, 6),
  maxWidth: 560,
  margin: '0 auto',
  minHeight: '100%',
  backgroundColor: theme.palette.background.default,

  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4, 3, 8),
    gap: theme.spacing(5),
  },
}));

export const StyledLandingHero = styled('section')(({ theme }) => ({
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const StyledLandingTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.palette.text.primary,
}));

export const StyledLandingTagline = styled('p')(({ theme }) => ({
  ...theme.typography.body1,
  margin: 0,
  color: theme.palette.text.secondary,
  maxWidth: 320,
}));

export const StyledSignInWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

export const StyledWhatsNewSection = styled(StyledPageSection)(({ theme }) => ({
  width: '100%',
  '& > h2': {
    ...theme.typography.h3,
    fontWeight: theme.typography.fontWeightBold,
    margin: `0 0 ${theme.spacing(2)} 0`,
    textAlign: 'center',
  },
}));

export const StyledWhatsNewList = styled('ul')(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const StyledWhatsNewItem = styled('li')(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper ?? theme.palette.grey[50],
  border: `1px solid ${theme.palette.divider}`,
  '& strong': {
    display: 'block',
    marginBottom: theme.spacing(0.5),
    fontSize: theme.typography.body1.fontSize,
  },
  '& small': {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
  },
}));
