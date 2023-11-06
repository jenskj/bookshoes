import { Updates, Welcome } from '../../components';
import { useCurrentUserStore } from '../../hooks';
import { StyledPageTitle } from '../styles';
import {
  StyledHomeContainer,
  StyledNewsSection,
  StyledWelcomeSection,
} from './styles';

export const Home = () => {
  const { activeClub } = useCurrentUserStore();

  return (
    <StyledHomeContainer>
      {!activeClub && (
        <StyledWelcomeSection>
          <StyledPageTitle>Welcome</StyledPageTitle>
          <Welcome />
        </StyledWelcomeSection>
      )}
      <StyledNewsSection>
        <StyledPageTitle>News</StyledPageTitle>
        <Updates />
      </StyledNewsSection>
    </StyledHomeContainer>
  );
};
