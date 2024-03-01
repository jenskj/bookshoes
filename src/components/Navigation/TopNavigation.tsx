import { StyledNavigation } from '@components/Layout/styles';
import { useCurrentUserStore } from '@hooks';
import { Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

export const TopNavigation = () => {
  const { activeClub } = useCurrentUserStore();
  return (
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
  );
};
