import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

export const StyledPage = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  width: '100%',
}));

export const StyledNavigation = styled('nav')({
  margin: '0 25%',
});
export const StyledNavigationList = styled('ul')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

export const StyledNavigationListItem = styled('li')(({ theme }) => ({
  // This needed?
}));

export const StyledLink = styled(Link)(({ theme }) => ({
  display: 'inline-block',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
}));
