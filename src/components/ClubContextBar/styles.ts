import { alpha, styled } from '@mui/material/styles';
import { UIButton } from '@components/ui';
import { Link } from 'react-router-dom';

export const StyledContextBar = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(2),
  borderRadius: 10,
  border: `1px solid ${alpha(theme.palette.divider, 0.95)}`,
  background: `linear-gradient(
      132deg,
      ${alpha(theme.palette.primary.main, 0.14)} 0%,
      ${alpha(theme.palette.background.paper, 0.98)} 24%,
      ${alpha(theme.palette.background.paper, 0.96)} 100%
    )`,
  boxShadow:
    '0 12px 28px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
}));

export const StyledContextTop = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  gap: theme.spacing(1.25),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    alignItems: 'start',
  },
}));

export const StyledContextTitle = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.25),
}));

export const StyledContextHeading = styled('p')(({ theme }) => ({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: theme.palette.primary.main,
}));

export const StyledCurrentClub = styled('strong')(({ theme }) => ({
  display: 'block',
  fontSize: '0.95rem',
  color: theme.palette.text.primary,
  lineHeight: 1.3,
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const StyledContextActions = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'center',
  justifyContent: 'flex-end',

  [theme.breakpoints.down('md')]: {
    justifyContent: 'flex-start',
  },
}));

export const StyledGhostButton = styled(UIButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.5, 1),
  whiteSpace: 'nowrap',
  ':hover': {
    color: theme.palette.text.primary,
  },
}));

export const StyledClubSelector = styled('div')(({ theme }) => ({
  display: 'none',
  gap: theme.spacing(0.5),

  [theme.breakpoints.down('md')]: {
    display: 'grid',
  },
}));

export const StyledSelectorLabel = styled('label')(({ theme }) => ({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.7rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

export const StyledClubSelect = styled('select')(({ theme }) => ({
  appearance: 'none',
  borderRadius: 6,
  border: `1px solid ${theme.palette.divider}`,
  background: 'rgba(255, 255, 255, 0.03)',
  color: theme.palette.text.primary,
  fontSize: '0.9rem',
  padding: theme.spacing(1, 1.25),
  width: '100%',
  ':focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 1,
  },
  option: {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
  },
}));

export const StyledClubList = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  overflowX: 'auto',
  paddingBottom: theme.spacing(0.5),

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

interface StyledClubOptionProps {
  isActive: boolean;
}

export const StyledClubOption = styled(UIButton, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<StyledClubOptionProps>(({ theme, isActive }) => ({
  border: `1px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`,
  padding: theme.spacing(0.75, 1.2),
  color: isActive ? theme.palette.background.default : theme.palette.text.secondary,
  backgroundColor: isActive
    ? theme.palette.primary.main
    : alpha(theme.palette.background.default, 0.55),
  whiteSpace: 'nowrap',
  fontSize: '0.86rem',
  ':hover': {
    borderColor: theme.palette.primary.light,
    color: isActive ? theme.palette.background.default : theme.palette.text.primary,
  },
}));

export const StyledContextPrompt = styled('div')(({ theme }) => ({
  fontSize: '0.92rem',
  color: theme.palette.text.secondary,
}));

export const StyledContextLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
}));
