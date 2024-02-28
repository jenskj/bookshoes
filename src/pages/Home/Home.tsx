import { Welcome } from '@components';
import { useCurrentUserStore } from '../../hooks';
import { StyledPageTitle } from '../styles';
import { ClubHome } from './ClubHome';
import { StyledHomeContainer, StyledWelcomeSection } from './styles';

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
