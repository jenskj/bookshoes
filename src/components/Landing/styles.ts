import { styled } from '@mui/material/styles';

export const StyledLandingRoot = styled('main')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(3, 2, 5),
  maxWidth: 1180,
  margin: '0 auto',
  width: '100%',
}));

export const StyledLandingHero = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  background:
    'radial-gradient(circle at 0 0, rgba(197, 183, 88, 0.1), transparent 32%), linear-gradient(160deg, rgba(255,255,255,0.03), rgba(20,24,33,0.96))',
  boxShadow: '0 20px 36px rgba(0, 0, 0, 0.32)',
  padding: theme.spacing(2.5),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1.2fr 1fr',
    padding: theme.spacing(3),
  },
}));

export const StyledLandingTitle = styled('h2')(({ theme }) => ({
  fontSize: 'clamp(2rem, 5vw, 3.4rem)',
  lineHeight: 1.02,
  marginBottom: theme.spacing(1.2),
}));

export const StyledLandingSubline = styled('p')(({ theme }) => ({
  maxWidth: 560,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  fontSize: '1rem',
}));

export const StyledVisualBlock = styled('div')(({ theme }) => ({
  minHeight: 280,
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(1.2),
  alignSelf: 'stretch',
  '> span': {
    border: `1px solid ${theme.palette.divider}`,
    background:
      'linear-gradient(180deg, rgba(197, 183, 88, 0.22), rgba(23, 27, 36, 0.95))',
    boxShadow: '0 10px 18px rgba(0, 0, 0, 0.34)',
    '&:nth-of-type(1)': {
      transform: 'translateY(28px)',
    },
    '&:nth-of-type(2)': {
      transform: 'translateY(4px)',
    },
    '&:nth-of-type(3)': {
      transform: 'translateY(40px)',
    },
  },
}));

export const StyledLandingStats = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

export const StyledLandingStat = styled('div')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(1.1, 1.4),
  fontSize: '0.8rem',
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: theme.palette.text.secondary,
}));

export const StyledHowItWorks = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.2),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
}));

export const StyledHowItem = styled('article')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 10,
  padding: theme.spacing(2),
  display: 'grid',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(23, 27, 36, 0.78)',
  h3: {
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
  },
  p: {
    color: theme.palette.text.secondary,
  },
}));

export const StyledLandingTease = styled('section')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  backgroundColor: 'rgba(23, 27, 36, 0.85)',
  padding: theme.spacing(2.2),
}));

export const StyledLandingMock = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  justifyItems: 'center',
  p: {
    color: theme.palette.text.secondary,
  },
}));

export const StyledMockPhone = styled('div')(({ theme }) => ({
  width: 'min(360px, 100%)',
  borderRadius: 26,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.6),
  display: 'grid',
  gap: theme.spacing(1),
  background:
    'linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(18, 21, 30, 0.95) 100%)',
}));

export const StyledMockNote = styled('div')(({ theme }) => ({
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  strong: {
    display: 'block',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.4),
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.76rem',
  },
  p: {
    color: theme.palette.text.primary,
  },
}));

export const StyledMockSpoiler = styled(StyledMockNote)(({ theme }) => ({
  filter: 'blur(3px)',
  opacity: 0.75,
  transition: 'filter 260ms ease, opacity 260ms ease',
  ':hover': {
    filter: 'blur(0)',
    opacity: 1,
  },
}));
