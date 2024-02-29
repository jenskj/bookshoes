import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { StyledNavigation } from './styles';
import { Button, useMediaQuery, useTheme } from '@mui/material';
import { useCurrentUserStore } from '@hooks';
import { StyledBottomNavigation } from '../Navigation/StyledBottomNavigation';
import { StyledPage } from '@pages/styles';
export const Layout = () => {
  const { activeClub } = useCurrentUserStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <>
      {!isMobile ? <StyledNavigation>
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
      </StyledNavigation> : null}
      <StyledPage>
        <Outlet />
      </StyledPage>
      {isMobile && activeClub ? <StyledBottomNavigation /> : null}
    </>
  );
};
