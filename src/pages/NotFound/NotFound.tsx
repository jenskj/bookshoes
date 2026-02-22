import {
  StyledContextCallout,
  StyledContextCalloutAction,
  StyledDashboardPage,
} from '@pages/Home/styles';

export const NotFound = () => {
  return (
    <StyledDashboardPage>
      <StyledContextCallout className="surface">
        <h2>Page not found</h2>
        <p>The page you requested does not exist or has moved.</p>
        <StyledContextCalloutAction to="/home" className="focus-ring">
          Go to dashboard
        </StyledContextCalloutAction>
      </StyledContextCallout>
    </StyledDashboardPage>
  );
};
