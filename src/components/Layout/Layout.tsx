import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { StyledNavigation, StyledPage } from './styles';
import { Button } from '@mui/material';
import { useCurrentUserStore } from '../../hooks';
export const Layout = () => {
  const { activeClub } = useCurrentUserStore();
  return (
    <>
      <StyledNavigation>
        <Button component={Link} to="/">
          Home
        </Button>
        {activeClub ? (
          <>
            <Button component={Link} to="/meetings">
              Meetings
            </Button>
            <Button component={Link} to="/books">
              Books
            </Button>
          </>
        ) : null}
        <Button component={Link} to="/clubs">
          Clubs
        </Button>
      </StyledNavigation>
      <StyledPage>
        <Outlet />
      </StyledPage>
    </>
  );
};
