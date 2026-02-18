import { styled } from '@mui/material/styles';

export const StyledContextBar = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(2),
  borderRadius: 10,
  border: `1px solid ${theme.palette.divider}`,
  background:
    'linear-gradient(130deg, rgba(197, 183, 88, 0.08), rgba(23, 27, 36, 0.95) 30%, rgba(23, 27, 36, 0.95))',
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
}));

export const StyledContextTop = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(1),
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
  fontSize: '0.95rem',
  color: theme.palette.text.primary,
}));

export const StyledContextActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

export const StyledGhostButton = styled('button')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  borderRadius: 4,
  padding: theme.spacing(0.5, 1),
  cursor: 'pointer',
  transition: 'border-color 150ms ease, color 150ms ease',
  ':hover': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
  },
}));

export const StyledClubList = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  overflowX: 'auto',
  paddingBottom: theme.spacing(0.5),
}));

interface StyledClubOptionProps {
  isActive: boolean;
}

export const StyledClubOption = styled('button', {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<StyledClubOptionProps>(({ theme, isActive }) => ({
  cursor: 'pointer',
  borderRadius: 4,
  border: `1px solid ${isActive ? theme.palette.primary.main : theme.palette.divider}`,
  padding: theme.spacing(0.75, 1.2),
  color: isActive ? theme.palette.background.default : theme.palette.text.secondary,
  backgroundColor: isActive ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.01)',
  whiteSpace: 'nowrap',
  fontSize: '0.86rem',
  transition: 'all 150ms ease',
  ':hover': {
    borderColor: theme.palette.primary.light,
    color: isActive ? theme.palette.background.default : theme.palette.text.primary,
  },
}));

export const StyledContextPrompt = styled('div')(({ theme }) => ({
  fontSize: '0.92rem',
  color: theme.palette.text.secondary,
}));

export const StyledContextLink = styled('a')(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
}));
