import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StyledDashboardPage = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledContextCallout = styled('article')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.2),
  padding: theme.spacing(2.2),
  borderRadius: 10,
  p: {
    color: theme.palette.text.secondary,
  },
}));

export const StyledContextCalloutTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: '1.28rem',
}));

export const StyledContextCalloutAction = styled(Link)(({ theme }) => ({
  justifySelf: 'start',
  textDecoration: 'none',
  borderRadius: 4,
  border: `1px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.light,
  backgroundColor: 'rgba(197, 183, 88, 0.12)',
  padding: theme.spacing(0.6, 1.2),
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.75rem',
  transition: 'all 150ms ease',
  ':hover': {
    color: theme.palette.background.default,
    backgroundColor: theme.palette.primary.main,
  },
}));

export const StyledDashboardGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: '1.5fr 1fr',
    gridAutoRows: 'minmax(0, auto)',
  },
}));

export const StyledSectionCard = styled('article')(({ theme }) => ({
  borderRadius: 10,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  display: 'grid',
  gap: theme.spacing(1.25),
}));

export const StyledSectionHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  h2: {
    fontSize: '1.2rem',
  },
}));

export const StyledPrimaryAction = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.5, 0.9),
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.72rem',
  transition: 'all 150ms ease',
  ':hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.light,
  },
}));

export const StyledDataGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'minmax(150px, 180px) 1fr',
  },
}));

export const StyledValue = styled('strong')(({ theme }) => ({
  display: 'block',
  marginBottom: theme.spacing(0.4),
  fontSize: '1.1rem',
  color: theme.palette.text.primary,
}));

export const StyledMetaLabel = styled('p')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.87rem',
}));

export const StyledPaceNumbers = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.1),
  marginBottom: theme.spacing(0.8),
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: theme.palette.text.secondary,
}));

export const StyledPaceBar = styled('div')(({ theme }) => ({
  position: 'relative',
  height: 14,
  borderRadius: 999,
  overflow: 'hidden',
  backgroundColor: '#0e1118',
  border: `1px solid ${theme.palette.divider}`,
}));

interface StyledPaceFillProps {
  percentage: number;
  tone: 'group' | 'user';
}

export const StyledPaceFill = styled('div', {
  shouldForwardProp: (prop) => prop !== 'percentage' && prop !== 'tone',
})<StyledPaceFillProps>(({ percentage, tone, theme }) => ({
  position: 'absolute',
  inset: 0,
  width: `${percentage}%`,
  background:
    tone === 'group'
      ? 'linear-gradient(90deg, rgba(63, 111, 78, 0.9), rgba(63, 111, 78, 0.35))'
      : 'linear-gradient(90deg, rgba(197, 183, 88, 0.95), rgba(197, 183, 88, 0.5))',
  borderRight: `1px solid ${theme.palette.background.default}`,
  zIndex: tone === 'user' ? 2 : 1,
}));

export const StyledPaceLabel = styled('p')(({ theme }) => ({
  marginTop: theme.spacing(0.8),
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: theme.palette.text.secondary,
  '&[data-tone="ahead"]': {
    color: theme.palette.secondary.light,
  },
  '&[data-tone="behind"]': {
    color: '#dd9f81',
  },
  '&[data-tone="on pace"]': {
    color: theme.palette.primary.main,
  },
}));

export const StyledMilestoneRow = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
  padding: theme.spacing(0.9, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  ':last-of-type': {
    borderBottom: 'none',
  },
  span: {
    color: theme.palette.text.secondary,
    fontSize: '0.74rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  strong: {
    color: theme.palette.text.primary,
    textAlign: 'right',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'grid',
    gap: theme.spacing(0.4),
    strong: {
      textAlign: 'left',
    },
  },
}));

export const StyledNotesList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledNoteCard = styled('article')(({ theme }) => ({
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 1.2),
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  strong: {
    display: 'block',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.4),
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  p: {
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
  },
}));
