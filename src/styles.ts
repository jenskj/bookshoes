import { Button, styled } from '@mui/material';

export const StyledAppContainer = styled('div')(({ theme }) => ({
  maxWidth: theme.breakpoints.values.lg,
  backgroundColor: theme.palette.background.default,
  margin: 'auto',
}));

export const StyledLoginButton = styled(Button)(({ theme }) => ({
  boxShadow: 'none',
  border: '1px solid black',
}));

export const StyledHeader = styled('header')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.secondary.main,
  height: 50,
  border: '1px solid black',
  padding: `calc(${theme.spacing(1)} / 2)`,
}));

export const StyledLogo = styled('div')(({ theme }) => ({
  height: '100%',
  objectFit: 'cover',
  display: 'flex',
  alignItems: 'center',
  img: {
    height: '100%',
    marginRight: theme.spacing(1),
    border: '1px solid black', // consider making into variable
  },
}));
