import { Header } from '@components/Header/Header';
import { AppErrorBoundary } from '@components/ErrorBoundary';
import { RouteTransition } from '@components/Layout';
import { DefaultLandingRoute } from '@components/Navigation';
import {
  useAutoMarkReadBooks,
  useAuthBootstrap,
  useClubBooks,
  useClubPresence,
  useClubMeetings,
  useClubMembers,
  useCurrentUserStore,
  usePresenceHeartbeat,
} from '@hooks';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StyledAppContainer, StyledContent, StyledLoadingState } from './styles';
import './styles/styles.scss';

const LandingPage = lazy(() =>
  import('@components/Landing/Landing').then((module) => ({
    default: module.Landing,
  }))
);
const LayoutShell = lazy(() =>
  import('@components/Layout/Layout').then((module) => ({
    default: module.Layout,
  }))
);
const HomePage = lazy(() =>
  import('@pages/Home/Home').then((module) => ({ default: module.Home }))
);
const SettingsPage = lazy(() =>
  import('@pages/Settings/Settings').then((module) => ({
    default: module.Settings,
  }))
);
const MeetingsPage = lazy(() =>
  import('@pages/Meetings/Meetings').then((module) => ({
    default: module.Meetings,
  }))
);
const MeetingDetailsPage = lazy(() =>
  import('@pages/Meetings/MeetingDetails').then((module) => ({
    default: module.MeetingDetails,
  }))
);
const BooksPage = lazy(() =>
  import('@pages/Books/Books').then((module) => ({ default: module.Books }))
);
const BookDetailsPage = lazy(() =>
  import('@pages/Books/BookDetails').then((module) => ({
    default: module.BookDetails,
  }))
);
const ClubsPage = lazy(() =>
  import('@pages/Clubs/Clubs').then((module) => ({ default: module.Clubs }))
);
const ClubDetailsPage = lazy(() =>
  import('@pages/Clubs/ClubDetails').then((module) => ({
    default: module.ClubDetails,
  }))
);
const ClubAdminPage = lazy(() =>
  import('@pages/Clubs/ClubAdmin').then((module) => ({
    default: module.ClubAdmin,
  }))
);
const NotFoundPage = lazy(() =>
  import('@pages/NotFound').then((module) => ({
    default: module.NotFound,
  }))
);

const LoadingState = () => {
  return (
    <StyledLoadingState aria-label="Loading">
      <div className="mono">Loading…</div>
    </StyledLoadingState>
  );
};

const App = () => {
  const activeClubDocId = useCurrentUserStore((state) => state.activeClub?.docId);
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const { authReady, userLoadedFromSession } = useAuthBootstrap();

  useClubBooks(activeClubDocId);
  useClubMeetings(activeClubDocId);
  useClubMembers(activeClubDocId);
  useClubPresence(activeClubDocId);
  useAutoMarkReadBooks();
  usePresenceHeartbeat();

  const isAppReady = authReady && userLoadedFromSession;

  return (
    <StyledAppContainer>
      <BrowserRouter
        basename={import.meta.env.BASE_URL.replace(/\/$/, '')}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Header />
        <StyledContent>
          {!isAppReady ? (
            <LoadingState />
          ) : currentUser ? (
            <AppErrorBoundary>
              <Suspense fallback={<LoadingState />}>
                <Routes>
                  <Route path="/" element={<LayoutShell />}>
                    <Route index element={<DefaultLandingRoute />} />
                    <Route path="home" element={<HomePage />} />
                    <Route path="meetings" element={<MeetingsPage />} />
                    <Route path="meetings/:id" element={<MeetingDetailsPage />} />
                    <Route path="books" element={<BooksPage />} />
                    <Route path="books/:id" element={<BookDetailsPage />} />
                    <Route path="clubs" element={<ClubsPage />} />
                    <Route path="clubs/:id" element={<ClubDetailsPage />} />
                    <Route path="clubs/:id/admin" element={<ClubAdminPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </AppErrorBoundary>
          ) : (
            <AppErrorBoundary>
              <Suspense fallback={<LoadingState />}>
                <RouteTransition transitionKey="landing">
                  <LandingPage />
                </RouteTransition>
              </Suspense>
            </AppErrorBoundary>
          )}
        </StyledContent>
      </BrowserRouter>
    </StyledAppContainer>
  );
};

export default App;
