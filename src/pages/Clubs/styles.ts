import { styled } from '@mui/material';
import { StyledPageTitle } from '../styles';

export const StyledClubs = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  overflowX: 'hidden',
}));

export const StyledClubsHeaderActions = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  padding: theme.spacing(1.25),
  borderRadius: 10,
  border: `1px solid ${theme.palette.primary.main}`,
  background: `linear-gradient(
    135deg,
    rgba(197, 183, 88, 0.16) 0%,
    rgba(63, 111, 78, 0.12) 100%
  )`,
  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.16)',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
  '> button': {
    padding: theme.spacing(0.95, 1.5),
    fontSize: '0.82rem',
    letterSpacing: '0.1em',
    minWidth: 180,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      minWidth: 0,
    },
  },
}));

export const StyledClubsHeaderTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: '1rem',
}));

export const StyledClubsHeaderHint = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.palette.text.secondary,
  fontSize: '0.88rem',
}));

export const StyledClubsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: theme.spacing(1),
  alignItems: 'start',
  position: 'relative',
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  '> a': {
    display: 'block',
    width: '100%',
    height: 'auto',
    minWidth: 0,
    maxWidth: '100%',
    zIndex: 1,
    textAlign: 'initial',
    color: 'inherit',
    textDecoration: 'none',
  },
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  },
}));

export const StyledClubDetailsContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledClubDetailsHeader = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledHeaderTop = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: theme.spacing(1),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    '> button': {
      width: '100%',
    },
  },
}));

export const StyledClubsPageTitle = styled(StyledPageTitle)(({ theme }) => ({
  marginBottom: 0,
}));

export const StyledSectionCard = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.25),
  padding: theme.spacing(1.5),
  borderRadius: 10,
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
}));

export const StyledSectionTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: '1rem',
}));

export const StyledActionRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

export const StyledMemberList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledMemberRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const StyledMemberMeta = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.35),
}));

export const StyledMemberRole = styled('span')(({ theme }) => ({
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: theme.palette.text.secondary,
}));

export const StyledInviteCode = styled('code')(({ theme }) => ({
  fontSize: '0.78rem',
  padding: theme.spacing(0.25, 0.5),
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: 6,
}));

export const StyledRequestList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const StyledRequestRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(1),
}));

export const StyledMuted = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
}));

export const StyledAdminGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const StyledAdminSectionFields = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.25),
  '> .MuiFormControl-root, > .MuiTextField-root': {
    width: '100%',
  },
  '> .MuiFormControlLabel-root': {
    margin: 0,
  },
}));
