import { Updates } from '../../components';
import { StyledPageTitle } from '../styles';
import { StyledNewsSection } from './styles';

export const Home = () => {
  return (
    <StyledNewsSection>
      <StyledPageTitle>News</StyledPageTitle>
      <Updates />
    </StyledNewsSection>
  );
};
