import { styled, Button } from '@mui/material';

export const StyledSignInButton = styled(Button)(({ theme }) => ({
  boxShadow: 'none',
  color: theme.palette.primary.main,
  border: 'none',
}));

export const StyledProfileImage = styled('img')(({ theme }) => ({
  width: theme.spacing(2),
  height: theme.spacing(2),
}));
