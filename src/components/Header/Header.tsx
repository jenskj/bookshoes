import { Link } from 'react-router-dom';
import { useCurrentUserStore } from '@hooks';
import { SignIn } from '../TopMenu/SignIn';
import { TopMenuButton } from '../TopMenu/TopMenuButton';
import {
  StyledHeaderInner,
  StyledHeaderShell,
  StyledLogoBlock,
  StyledTagline,
  StyledWordmark,
} from './styles';

export const Header = () => {
  const { currentUser } = useCurrentUserStore();

  return (
    <StyledHeaderShell>
      <StyledHeaderInner>
        <Link to="/" aria-label="Go to Bookshoes dashboard">
          <StyledLogoBlock>
            <StyledWordmark>Bookshoes</StyledWordmark>
            <StyledTagline>Read with intent</StyledTagline>
          </StyledLogoBlock>
        </Link>
        {!currentUser ? <SignIn /> : <TopMenuButton />}
      </StyledHeaderInner>
    </StyledHeaderShell>
  );
};
