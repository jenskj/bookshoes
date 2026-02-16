import { Header, Landing, Layout } from '@components';
import { supabase } from '@lib/supabase';
import {
  useBookStore,
  useClubBooks,
  useClubMeetings,
  useClubMembers,
  useCurrentUserStore,
  useMeetingStore,
} from '@hooks';
import {
  BookDetails,
  Books,
  ClubDetails,
  Clubs,
  Home,
  MeetingDetails,
  Meetings,
} from '@pages';
import { Club, UserInfo } from '@types';
import { mapClubRow } from '@lib/mappers';
import { parseDate, updateBook } from '@utils';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StyledAppContainer, StyledContent } from './styles';
import './styles/styles.scss';

const App = () => {
  const [dateChecked, setDateChecked] = useState<boolean>(false);
  const { books } = useBookStore();
  const { meetings } = useMeetingStore();
  const {
    activeClub,
    currentUser,
    setCurrentUser,
    setActiveClub,
    setMembershipClubs,
  } = useCurrentUserStore();

  useClubBooks(activeClub?.docId);
  useClubMeetings(activeClub?.docId);
  useClubMembers(activeClub?.docId);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!session?.user) return;
      const uid = session.user.id;
      const { data: userRow } = await supabase.from('users').select('*').eq('id', uid).single();
      if (userRow) {
        setCurrentUser({
          docId: uid,
          data: {
            uid,
            email: (userRow.email as string) ?? '',
            displayName: (userRow.display_name as string) ?? '',
            photoURL: (userRow.photo_url as string) ?? '',
            activeClub: userRow.active_club_id as string | undefined,
            memberships: (userRow.memberships as string[]) ?? [],
          } as UserInfo,
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('users').select('*').eq('id', session.user.id).single().then(({ data: userRow }) => {
          if (userRow) {
            setCurrentUser({
              docId: session.user.id,
              data: {
                uid: session.user.id,
                email: (userRow.email as string) ?? '',
                displayName: (userRow.display_name as string) ?? '',
                photoURL: (userRow.photo_url as string) ?? '',
                activeClub: userRow.active_club_id as string | undefined,
                memberships: (userRow.memberships as string[]) ?? [],
              } as UserInfo,
            });
          }
        });
      }
    }).finally(() => {
      // Clear URL hash after auth init. A leftover hash (e.g. from OAuth redirect #access_token=...)
      // makes Supabase treat the next load as a callback; if that handling fails it never runs
      // _recoverAndRefresh(), so the session in localStorage is never loaded → user appears logged out.
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  useEffect(() => {
    if (currentUser?.data.memberships?.length) {
      supabase
        .from('clubs')
        .select('*')
        .in('id', currentUser.data.memberships)
        .then(({ data: clubs }) => {
          const mapped: Club[] = (clubs ?? []).map((c) => mapClubRow(c));
          setMembershipClubs(mapped);
        });
    }
  }, [currentUser?.data.memberships, setMembershipClubs]);

  useEffect(() => {
    if (currentUser?.data.activeClub && currentUser.data.activeClub !== activeClub?.docId) {
      supabase
        .from('clubs')
        .select('*')
        .eq('id', currentUser.data.activeClub)
        .single()
        .then(({ data: club }) => {
          if (club) {
            setActiveClub(mapClubRow(club));
          }
        });
    } else if (!currentUser?.data.activeClub) {
      setActiveClub(undefined);
    }
  }, [currentUser?.data.activeClub, activeClub?.docId, setActiveClub]);

  useEffect(() => {
    if (activeClub && meetings?.length && books?.length && !dateChecked) {
      const pastMeetings: string[] = [];
      meetings.forEach((meeting) => {
        const date = parseDate(meeting?.data?.date);
        if (date && isBefore(date, Date.now())) {
          pastMeetings.push(meeting.docId);
        }
      });

      if (pastMeetings?.length) {
        const booksToUpdate: string[] = [];
        books.forEach((book) => {
          if (
            book?.data?.scheduledMeetings?.length &&
            book.docId &&
            book.data.scheduledMeetings?.every((mid) => pastMeetings.includes(mid)) &&
            book.data.readStatus === 'reading'
          ) {
            booksToUpdate.push(book.docId);
          }
        });
        booksToUpdate.forEach((id) => {
          updateBook(activeClub.docId, id, { readStatus: 'read' });
        });
      }
      setDateChecked(true);
    }
  }, [meetings, books, dateChecked, activeClub]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user?.id) return;

      const updatePresence = () => {
        supabase.from('user_presence').upsert({
          user_id: user.id,
          last_online_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      };

      updatePresence();
      interval = setInterval(updatePresence, 30000);
    });
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

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
          {currentUser ? (
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="meetings" element={<Meetings />} />
                <Route path="meetings/:id" element={<MeetingDetails />} />
                <Route path="books" element={<Books />} />
                <Route path="books/:id" element={<BookDetails />} />
                <Route path="clubs" element={<Clubs />} />
                <Route path="clubs/:id" element={<ClubDetails />} />
              </Route>
            </Routes>
          ) : (
            <Landing />
          )}
        </StyledContent>
      </BrowserRouter>
    </StyledAppContainer>
  );
};

export default App;
