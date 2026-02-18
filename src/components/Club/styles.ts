import { styled } from '@mui/material';
import { UIButton } from '@components/ui';

export const StyledClubCard = styled('div')(({ theme }) => ({
  display: 'grid',
  justifyItems: 'stretch',
  alignItems: 'start',
  backgroundColor: theme.palette.background.paper,
  height: '100%',
  gridTemplateRows: 'auto 1fr auto',
  gap: theme.spacing(2),
  padding: theme.spacing(2, 1.5),
  borderRadius: 3,
  boxShadow: theme.shadows[4],
}));
export const StyledTop = styled('div')(({ theme }) => ({
  display: 'grid',
  justifyItems: 'center',
  gap: theme.spacing(1),
}));

export const StyledClubName = styled('h2')(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

export const StyledMiddle = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  justifyItems: 'center',
}));

export const StyledText = styled('p')(({ theme }) => ({
  margin: `0 ${theme.spacing(1)}`,
  textAlign: 'center',
  overflowWrap: 'anywhere',
}));

export const StyledMembersInfo = styled('div')(({ theme }) => ({}));
export const StyledBottom = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  justifyItems: 'stretch',
  textAlign: 'center',
}));
export const StyledCTA = styled(UIButton)(() => ({
  width: '100%',
}));

export const StyledModalClubForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));
