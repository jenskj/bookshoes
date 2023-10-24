import { Updates, Welcome } from '../../components';
import { StyledPageTitle } from '../styles';
import {
  StyledHomeContainer,
  StyledNewsSection,
  StyledWelcomeSection,
} from './styles';

export const Home = () => {
  return (
    <StyledHomeContainer>
      <StyledWelcomeSection>
        <StyledPageTitle>Welcome</StyledPageTitle>
        <Welcome />
      </StyledWelcomeSection>
      <StyledNewsSection>
        <StyledPageTitle>News</StyledPageTitle>
        <Updates />
      </StyledNewsSection>
    </StyledHomeContainer>
  );
};
