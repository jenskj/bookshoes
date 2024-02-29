import { Welcome } from '@components';
import { useCurrentUserStore } from '../../hooks';
import { StyledPageTitle } from '../styles';
import { StyledWelcomeSection } from './styles';
import { ClubHome } from '@pages';

export const Home = () => {
  const { activeClub } = useCurrentUserStore();

  return (
    <>
      {!activeClub ? (
        <StyledWelcomeSection>
          <StyledPageTitle>Welcome</StyledPageTitle>
          <Welcome />
        </StyledWelcomeSection>
      ) : (
        <ClubHome />
      )}
    </>
  );
};
