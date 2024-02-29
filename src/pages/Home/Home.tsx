import { Welcome } from '@components';
import { useCurrentUserStore } from '../../hooks';
import { StyledPageTitle } from '../styles';
import { StyledHomeContainer, StyledWelcomeSection } from './styles';
import { ClubHome } from '@pages';

export const Home = () => {
  const { activeClub } = useCurrentUserStore();

  return (
    <StyledHomeContainer>
      {!activeClub ? (
        <StyledWelcomeSection>
          <StyledPageTitle>Welcome</StyledPageTitle>
          <Welcome />
        </StyledWelcomeSection>
      ) : (
        <ClubHome />
      )}
    </StyledHomeContainer>
  );
};
