import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StyledPage = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: '100%',
  minHeight: '100%',
  position: 'relative',
  padding: `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(
    8
  )} ${theme.spacing(2)}`,

  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
  },
}));

export const StyledNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  padding: `${theme.spacing(1)} 0`,
  gap: theme.spacing(1),
}));

export const StyledLink = styled(Link)(({ theme }) => ({
  display: 'inline-block',
  borderRadius: 3,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
}));
