import { Header, Landing, Layout } from '@components';
import {
  useAutoMarkReadBooks,
  useAuthBootstrap,
  useClubBooks,
  useClubMeetings,
  useClubMembers,
  useCurrentUserStore,
  usePresenceHeartbeat,
} from '@hooks';
import { Box, CircularProgress } from '@mui/material';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StyledAppContainer, StyledContent } from './styles';
import './styles/styles.scss';

const HomePage = lazy(() =>
  import('@pages/Home').then((module) => ({ default: module.Home }))
);
const MeetingsPage = lazy(() =>
  import('@pages/Meetings').then((module) => ({ default: module.Meetings }))
);
const MeetingDetailsPage = lazy(() =>
  import('@pages/Meetings').then((module) => ({
    default: module.MeetingDetails,
  }))
);
const BooksPage = lazy(() =>
  import('@pages/Books').then((module) => ({ default: module.Books }))
);
const BookDetailsPage = lazy(() =>
  import('@pages/Books').then((module) => ({ default: module.BookDetails }))
);
const ClubsPage = lazy(() =>
  import('@pages/Clubs').then((module) => ({ default: module.Clubs }))
);
const ClubDetailsPage = lazy(() =>
  import('@pages/Clubs').then((module) => ({ default: module.ClubDetails }))
);

const LoadingState = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="40vh"
    >
      <CircularProgress aria-label="Loading" />
    </Box>
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
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="meetings" element={<MeetingsPage />} />
                  <Route path="meetings/:id" element={<MeetingDetailsPage />} />
                  <Route path="books" element={<BooksPage />} />
                  <Route path="books/:id" element={<BookDetailsPage />} />
                  <Route path="clubs" element={<ClubsPage />} />
                  <Route path="clubs/:id" element={<ClubDetailsPage />} />
                </Route>
              </Routes>
            </Suspense>
          ) : (
            <Landing />
          )}
        </StyledContent>
      </BrowserRouter>
    </StyledAppContainer>
  );
};

export default App;
