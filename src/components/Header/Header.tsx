import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUserStore } from '@hooks';
import { SignIn } from '../TopMenu/SignIn';
import { TopMenuButton } from '../TopMenu/TopMenuButton';
import {
  StyledActiveHeader,
  StyledHeader,
  StyledHeaderContainer,
  StyledInactiveHeader,
  StyledLogo,
  StyledOverflowContainer,
  StyledPaper,
} from './styles';

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
    <StyledPaper>
      <StyledHeader>
        <StyledOverflowContainer>
          <Link to="/" aria-label="home">
            <StyledLogo>
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
    </StyledPaper>
  );
};
