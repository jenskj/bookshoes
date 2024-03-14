import { Button, Typography, styled } from '@mui/material';

export const StyledClubCard = styled('div')(({ theme }) => ({
  display: 'grid',
  justifyItems: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  height: '100%',
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

export const StyledText = styled(Typography)(({ theme }) => ({
  margin: `0 ${theme.spacing(1)}`,
}));

export const StyledMembersInfo = styled('div')(({ theme }) => ({}));
export const StyledBottom = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  justifyItems: 'center',
}));
export const StyledCTA = styled(Button)(({ theme }) => ({}));

export const StyledModalClubForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));
