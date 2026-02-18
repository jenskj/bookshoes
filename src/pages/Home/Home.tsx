import { ClubHome } from './ClubHome';
import { useCurrentUserStore } from '@hooks';
import {
  StyledContextCallout,
  StyledContextCalloutAction,
  StyledContextCalloutTitle,
  StyledDashboardPage,
} from './styles';

export const Home = () => {
  const activeClub = useCurrentUserStore((state) => state.activeClub);

  return (
    <StyledDashboardPage>
      {!activeClub ? (
        <StyledContextCallout className="surface fade-up">
          <StyledContextCalloutTitle>No active club selected</StyledContextCalloutTitle>
          <p>
            Choose a club in the context bar to unlock your reading dashboard and
            discussion stream.
          </p>
          <StyledContextCalloutAction
            to="/clubs"
            className="focus-ring"
          >
            Browse Clubs
          </StyledContextCalloutAction>
        </StyledContextCallout>
      ) : (
        <ClubHome />
      )}
    </StyledDashboardPage>
  );
};
