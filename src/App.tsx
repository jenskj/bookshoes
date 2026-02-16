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
import { Club, User, UserInfo } from '@types';
import { mapClubRow } from '@lib/mappers';
import { parseDate, updateBook } from '@utils';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { StyledAppContainer, StyledContent } from './styles';
import './styles/styles.scss';

const App = () => {
  const [dateChecked, setDateChecked] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  /** True only after we've set currentUser from a session (getSession or onAuthStateChange). Stops showing Routes from rehydrated user before session is ready. */
  const [userLoadedFromSession, setUserLoadedFromSession] =
    useState<boolean>(false);
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

  // Fallback: stop spinning after 2.5s so we never show an infinite loader.
  useEffect(() => {
    const fallback = setTimeout(() => {
      setAuthReady(true);
      setUserLoadedFromSession(true);
    }, 2500);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        const signOutEvent =
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_OUT' ||
          (event as string) === 'TOKEN_REVOKED';
        if (signOutEvent) {
          setCurrentUser(undefined);
          setActiveClub(undefined);
          setUserLoadedFromSession(true);
        }
        return;
      }
      const uid = session.user.id;
      // Don't await: the users fetch can hang after refresh. Fire it and unstick UI; when it completes we update.
      setUserLoadedFromSession(true);
      supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single()
        .then(({ data: userRow }) => {
          const membershipsFromUser =
            (userRow?.memberships as string[] | undefined) ?? [];
          if (userRow) {
            setCurrentUser({
              docId: uid,
              data: {
                uid,
                email: (userRow.email as string) ?? '',
                displayName: (userRow.display_name as string) ?? '',
                photoURL: (userRow.photo_url as string) ?? '',
                activeClub: userRow.active_club_id as string | undefined,
                memberships: membershipsFromUser,
              } as UserInfo,
            });
          } else {
            setCurrentUser({
              docId: uid,
              data: {
                uid,
                email: session.user.email ?? '',
                displayName:
                  (session.user.user_metadata?.full_name as string) ??
                  session.user.email ??
                  '',
                photoURL:
                  (session.user.user_metadata?.avatar_url as string) ?? '',
                memberships: [],
              } as UserInfo,
            });
          }
          const loadClubsByIds = (clubIds: string[]) => {
            if (clubIds.length === 0) return;
            supabase
              .from('clubs')
              .select('*')
              .in('id', clubIds)
              .then(({ data: clubs }) => {
                setMembershipClubs((clubs ?? []).map((c) => mapClubRow(c)));
              });
          };
          if (membershipsFromUser.length > 0) {
            loadClubsByIds(membershipsFromUser);
          } else {
            supabase
              .from('club_members')
              .select('club_id')
              .eq('user_id', uid)
              .then(({ data: rows }) => {
                const ids = (rows ?? [])
                  .map((r) => r.club_id as string)
                  .filter(Boolean);
                if (ids.length > 0) {
                  const prev = useCurrentUserStore.getState().currentUser;
                  if (prev?.docId === uid) {
                    setCurrentUser({
                      ...prev,
                      data: { ...prev.data, memberships: ids } as UserInfo,
                    });
                  }
                  loadClubsByIds(ids);
                }
              });
          }
        }, () => {});
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setAuthReady(true);
        // before we render Routes and run data hooks (books/meetings/members).
        if (typeof window !== 'undefined' && window.location.hash) {
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          );
        }
        if (!session?.user) return;
        void Promise.resolve().then(() => {
          supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: userRow }) => {
              const membershipsFromUser =
                (userRow?.memberships as string[] | undefined) ?? [];
              const activeClubId = userRow?.active_club_id as string | undefined;
              const uid = session.user.id;
              const initialUser: User = userRow
              ? {
                  docId: uid,
                  data: {
                    uid,
                    email: (userRow.email as string) ?? '',
                    displayName: (userRow.display_name as string) ?? '',
                    photoURL: (userRow.photo_url as string) ?? '',
                    activeClub: activeClubId,
                    memberships: membershipsFromUser,
                  } as UserInfo,
                }
              : {
                  docId: uid,
                  data: {
                    uid,
                    email: session.user.email ?? '',
                    displayName:
                      (session.user.user_metadata?.full_name as string) ??
                      session.user.email ??
                      '',
                    photoURL:
                      (session.user.user_metadata?.avatar_url as string) ?? '',
                    memberships: [],
                  } as UserInfo,
                };
              setCurrentUser(initialUser);
              setUserLoadedFromSession(true);

              const loadClubsByIds = (clubIds: string[]) => {
                if (clubIds.length === 0) return;
                supabase
                  .from('clubs')
                  .select('*')
                  .in('id', clubIds)
                  .then(({ data: clubs }) => {
                    setMembershipClubs((clubs ?? []).map((c) => mapClubRow(c)));
                  });
              };
              if (membershipsFromUser.length > 0) {
                loadClubsByIds(membershipsFromUser);
              } else {
                supabase
                  .from('club_members')
                  .select('club_id')
                  .eq('user_id', uid)
                  .then(({ data: rows }) => {
                    const ids = (rows ?? [])
                      .map((r) => r.club_id as string)
                      .filter(Boolean);
                    if (ids.length > 0) {
                      setCurrentUser({
                        ...initialUser,
                        data: {
                          ...initialUser.data,
                          memberships: ids,
                        } as UserInfo,
                      });
                      loadClubsByIds(ids);
                    }
                  });
              }
            });
        });
      })
      .catch(() => {
        setCurrentUser(undefined);
        setActiveClub(undefined);
        setUserLoadedFromSession(true);
        setAuthReady(true);
      })
      .finally(() => setAuthReady(true));

    return () => subscription.unsubscribe();
  }, [setCurrentUser, setActiveClub, setMembershipClubs]);

  // Refetch current user from server when app loads (so memberships/activeClub are never stale from persist).
  useEffect(() => {
    if (!currentUser?.docId) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user || session.user.id !== currentUser.docId) return;
      supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data: userRow }) => {
          if (!userRow) return;
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
        });
    });
  }, [currentUser?.docId, setCurrentUser]);

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
    if (
      currentUser?.data.activeClub &&
      currentUser.data.activeClub !== activeClub?.docId
    ) {
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
            book.data.scheduledMeetings?.every((mid) =>
              pastMeetings.includes(mid)
            ) &&
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
          {!authReady || !userLoadedFromSession ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="40vh"
            >
              <CircularProgress aria-label="Loading" />
            </Box>
          ) : currentUser ? (
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
