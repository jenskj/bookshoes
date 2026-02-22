import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

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

export const StyledRouteTransition = styled('div')(() => ({
  width: '100%',
  minWidth: 0,
}));
