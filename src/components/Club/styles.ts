import { alpha, styled } from '@mui/material/styles';
import { UIButton } from '@components/ui';

export const StyledClubCard = styled('div')(({ theme }) => ({
  position: 'relative',
  overflow: 'visible',
  display: 'grid',
  justifyItems: 'stretch',
  alignItems: 'start',
  background: `linear-gradient(
    150deg,
    ${alpha(theme.palette.primary.light, 0.12)} 0%,
    ${alpha(theme.palette.background.paper, 0.96)} 54%,
    ${alpha(theme.palette.secondary.main, 0.14)} 100%
  )`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  height: 'auto',
  gridTemplateRows: 'auto 1fr auto',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.75),
  borderRadius: theme.spacing(2),
  boxShadow: `0 10px 18px ${alpha(theme.palette.common.black, 0.2)}`,
  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    background: `linear-gradient(
      90deg,
      ${alpha(theme.palette.primary.main, 0.9)} 0%,
      ${alpha(theme.palette.secondary.main, 0.9)} 100%
    )`,
  },
}));
export const StyledTop = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const StyledClubMonogram = styled('span')(({ theme }) => ({
  width: 42,
  height: 42,
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  fontSize: '1.1rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.primary.contrastText,
  backgroundColor: alpha(theme.palette.primary.main, 0.92),
  boxShadow: `0 0 0 1px ${alpha(theme.palette.common.black, 0.18)}`,
}));

export const StyledClubName = styled('h2')(({ theme }) => ({
  margin: 0,
  fontWeight: theme.typography.fontWeightBold,
  fontSize: '1.03rem',
  lineHeight: 1.25,
}));

export const StyledMiddle = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
}));

export const StyledText = styled('p')(({ theme }) => ({
  margin: 0,
  color: theme.palette.text.secondary,
  lineHeight: 1.45,
  overflowWrap: 'anywhere',
}));

export const StyledMembersInfo = styled('div')(({ theme }) => ({
  width: 'fit-content',
  fontSize: '0.72rem',
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  borderRadius: 999,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  padding: theme.spacing(0.35, 0.7),
}));
export const StyledBottom = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
}));
export const StyledCTA = styled(UIButton)(({ theme }) => ({
  borderColor: alpha(theme.palette.primary.main, 0.45),
  backgroundColor: alpha(theme.palette.background.default, 0.34),
  color: theme.palette.text.primary,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.14),
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

export const StyledModalClubForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));
