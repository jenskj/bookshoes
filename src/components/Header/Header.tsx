import { Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { SignIn } from '../TopMenu/SignIn';
import { TopMenuButton } from '../TopMenu/TopMenuButton';
import {
  StyledHeader,
  StyledOverflowContainer,
  StyledLogo,
  StyledHeaderContainer,
  StyledActiveHeader,
  StyledInactiveHeader,
} from './styles';
import { Link } from 'react-router-dom';
import { useCurrentUserStore } from '../../hooks';

export const Header = () => {
  const { activeClub, currentUser } = useCurrentUserStore();
  const [clubHeader, setClubHeader] = useState<string>();

  useEffect(() => {
    // Set header in a separate state to avoid it glitching away when activeClub is set to undefined
    if (activeClub?.data.name) {
      setClubHeader(activeClub.data.name);
    } else {
      setTimeout(() => {
        setClubHeader('');
        // To do: make variable that matches the title animation
      }, 300);
    }
  }, [activeClub]);

  return (
    <Paper>
      <StyledHeader>
        <StyledOverflowContainer>
          <Link to="/" aria-label="home">
            <StyledLogo>
              {/* <MenuBookSharpIcon /> */}

              <StyledHeaderContainer activeClub={Boolean(activeClub)}>
                <StyledActiveHeader aria-hidden={!Boolean(activeClub)}>
                  {clubHeader}
                </StyledActiveHeader>
                <StyledInactiveHeader aria-hidden={Boolean(activeClub)}>
                  Bookmates
                </StyledInactiveHeader>
              </StyledHeaderContainer>
            </StyledLogo>
          </Link>
          {!currentUser ? <SignIn></SignIn> : <TopMenuButton />}
        </StyledOverflowContainer>
      </StyledHeader>
    </Paper>
  );
};
