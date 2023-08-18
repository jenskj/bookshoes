import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StyledPage = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  width: '100%',
}));

export const StyledNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  margin: `${theme.spacing(1)} 0`,
  gap: theme.spacing(1),
}));

export const StyledLink = styled(Link)(({ theme }) => ({
  display: 'inline-block',
  borderRadius: 3,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
}));
