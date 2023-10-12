import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { StyledNavigation, StyledPage } from './styles';
import { Button } from '@mui/material';
export const Layout = () => {
  return (
    <>
      <StyledNavigation>
        <Button component={Link} to="/">Home</Button>
        <Button component={Link} to="/meetings">Meetings</Button>
        <Button component={Link} to="/books">Books</Button>
      </StyledNavigation>
      <StyledPage>
        <Outlet />
      </StyledPage>
    </>
  );
};
