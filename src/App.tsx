import { Header } from '@components/Header/Header';
import { DefaultLandingRoute } from '@components/Navigation';
import {
  useAutoMarkReadBooks,
  useAuthBootstrap,
  useClubBooks,
  useClubMeetings,
  useClubMembers,
  useCurrentUserStore,
  usePresenceHeartbeat,
} from '@hooks';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StyledAppContainer, StyledContent } from './styles';
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

const LoadingState = () => {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
      }}
      aria-label="Loading"
    >
      <div className="mono">Loading…</div>
    </div>
  );
};

const App = () => {
  const { activeClub, currentUser } = useCurrentUserStore();
  const { authReady, userLoadedFromSession } = useAuthBootstrap();

  useClubBooks(activeClub?.docId);
  useClubMeetings(activeClub?.docId);
  useClubMembers(activeClub?.docId);
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
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingState />}>
              <LandingPage />
            </Suspense>
          )}
        </StyledContent>
      </BrowserRouter>
    </StyledAppContainer>
  );
};

export default App;
