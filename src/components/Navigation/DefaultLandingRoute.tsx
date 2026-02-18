import { useCurrentUserStore } from '@hooks';
import { Navigate } from 'react-router-dom';

const tabToRoute = {
  home: '/home',
  meetings: '/meetings',
  books: '/books',
  clubs: '/clubs',
} as const;

export const DefaultLandingRoute = () => {
  const defaultLandingTab = useCurrentUserStore(
    (state) => state.settings.navigation.defaultLandingTab
  );
  return <Navigate to={tabToRoute[defaultLandingTab]} replace />;
};
