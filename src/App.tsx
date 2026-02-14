import { Header, Layout } from '@components';
import { supabase } from '@lib/supabase';
import { useBookStore, useCurrentUserStore, useMeetingStore } from '@hooks';
import {
  BookDetails,
  Books,
  ClubDetails,
  Clubs,
  Home,
  MeetingDetails,
  Meetings,
} from '@pages';
import {
  BookInfo,
  ClubInfo,
  FirestoreBook,
  FirestoreClub,
  FirestoreMeeting,
  FirestoreMember,
  MeetingInfo,
  MemberInfo,
  UserInfo,
} from '@types';
import { updateDocument } from '@utils';
import { isBefore } from 'date-fns';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StyledAppContainer, StyledContent } from './styles';
import './styles/styles.scss';

function mapBookRow(row: Record<string, unknown>): FirestoreBook {
  return {
    docId: row.id as string,
    data: {
      id: row.google_id,
      volumeInfo: {
        title: row.title,
        authors: (row.authors as string[]) ?? [],
        imageLinks: row.image_thumbnail ? { thumbnail: row.image_thumbnail as string } : undefined,
        description: row.description,
        pageCount: (row.page_count as number) ?? 0,
        averageRating: row.average_rating,
        ratingsCount: row.ratings_count,
        publishedDate: row.published_date,
        publisher: row.publisher,
      },
      readStatus: row.read_status as BookInfo['readStatus'],
      addedDate: row.added_at as string,
      inactive: row.inactive as boolean,
      googleId: row.google_id as string,
      scheduledMeetings: (row.scheduled_meetings as string[]) ?? [],
      ratings: (row.ratings as BookInfo['ratings']) ?? [],
      progressReports: (row.progress_reports as BookInfo['progressReports']) ?? [],
    } as BookInfo,
  };
}

function mapMeetingRow(row: Record<string, unknown>): FirestoreMeeting {
  return {
    docId: row.id as string,
    data: {
      date: row.date as string,
      location: {
        address: row.location_address,
        lat: row.location_lat,
        lng: row.location_lng,
        remoteInfo: {
          link: row.remote_link,
          password: row.remote_password,
        },
      },
      comments: (row.comments as MeetingInfo['comments']) ?? [],
    } as MeetingInfo,
  };
}

function mapMemberRow(row: Record<string, unknown>, user?: Record<string, unknown>): FirestoreMember {
  const u = user ?? row;
  return {
    docId: row.id as string,
    data: {
      uid: u.user_id as string,
      displayName: (u.display_name as string) ?? '',
      photoURL: (u.photo_url as string) ?? '',
      role: (row.role as MemberInfo['role']) ?? 'standard',
    } as MemberInfo,
  };
}

const App = () => {
  const [dateChecked, setDateChecked] = useState<boolean>(false);
  const { books, setBooks } = useBookStore();
  const { meetings, setMeetings } = useMeetingStore();
  const {
    activeClub,
    currentUser,
    setCurrentUser,
    setActiveClub,
    setMembers,
    setMembershipClubs,
  } = useCurrentUserStore();

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
          const mapped: FirestoreClub[] = (clubs ?? []).map((c) => ({
            docId: c.id,
            data: {
              name: c.name,
              isPrivate: c.is_private ?? false,
              tagline: c.tagline,
              description: c.description,
            } as ClubInfo,
          }));
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
            setActiveClub({
              docId: club.id,
              data: {
                name: club.name,
                isPrivate: club.is_private ?? false,
                tagline: club.tagline,
                description: club.description,
              } as ClubInfo,
            });
          }
        });
    } else if (!currentUser?.data.activeClub) {
      setActiveClub(undefined);
    }
  }, [currentUser?.data.activeClub, activeClub?.docId, setActiveClub]);

  useEffect(() => {
    if (activeClub) {
      const channel = supabase
        .channel(`club-${activeClub.docId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'books', filter: `club_id=eq.${activeClub.docId}` },
          () => {
            supabase
              .from('books')
              .select('*')
              .eq('club_id', activeClub.docId)
              .order('added_at', { ascending: true })
              .then(({ data }) => {
                setBooks((data ?? []).map(mapBookRow));
              });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'meetings', filter: `club_id=eq.${activeClub.docId}` },
          () => {
            supabase
              .from('meetings')
              .select('*')
              .eq('club_id', activeClub.docId)
              .then(({ data }) => {
                setMeetings((data ?? []).map(mapMeetingRow));
              });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'club_members', filter: `club_id=eq.${activeClub.docId}` },
          async () => {
            const { data: membersData } = await supabase.from('club_members').select('*').eq('club_id', activeClub.docId);
            const membersList = membersData ?? [];
            if (membersList.length === 0) {
              setMembers([]);
              return;
            }
            const userIds = membersList.map((m: Record<string, unknown>) => m.user_id as string);
            const { data: usersData } = await supabase.from('users').select('id, display_name, photo_url').in('id', userIds);
            const usersMap = new Map((usersData ?? []).map((u: Record<string, unknown>) => [u.id, u]));
            const members: FirestoreMember[] = membersList.map((m: Record<string, unknown>) => {
              const u = usersMap.get(m.user_id as string) ?? {};
              return mapMemberRow(m, { user_id: m.user_id, display_name: u.display_name, photo_url: u.photo_url });
            });
            setMembers(members);
          }
        )
        .subscribe();

      supabase
        .from('books')
        .select('*')
        .eq('club_id', activeClub.docId)
        .order('added_at', { ascending: true })
        .then(({ data }) => setBooks((data ?? []).map(mapBookRow)));

      supabase
        .from('meetings')
        .select('*')
        .eq('club_id', activeClub.docId)
        .then(({ data }) => setMeetings((data ?? []).map(mapMeetingRow)));

      supabase
        .from('club_members')
        .select('*')
        .eq('club_id', activeClub.docId)
        .then(async ({ data: membersData }) => {
          const membersList = membersData ?? [];
          if (membersList.length === 0) {
            setMembers([]);
            return;
          }
          const userIds = membersList.map((m: Record<string, unknown>) => m.user_id as string);
          const { data: usersData } = await supabase.from('users').select('id, display_name, photo_url').in('id', userIds);
          const usersMap = new Map((usersData ?? []).map((u: Record<string, unknown>) => [u.id, u]));
          const members: FirestoreMember[] = membersList.map((m: Record<string, unknown>) => {
            const u = usersMap.get(m.user_id as string) ?? {};
            return mapMemberRow(m, { user_id: m.user_id, display_name: u.display_name, photo_url: u.photo_url });
          });
          setMembers(members);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setBooks([]);
      setMeetings([]);
      setMembers([]);
    }
  }, [activeClub, setBooks, setMeetings, setMembers]);

  useEffect(() => {
    if (activeClub && meetings?.length && books?.length && !dateChecked) {
      const pastMeetings: string[] = [];
      meetings.forEach((meeting) => {
        const d = meeting?.data?.date;
        const date = typeof d === 'string' ? new Date(d) : d?.seconds ? new Date(d.seconds * 1000) : null;
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
          updateDocument(`clubs/${activeClub.docId}/books`, { readStatus: 'read' }, id);
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
          ) : null}
        </StyledContent>
      </BrowserRouter>
    </StyledAppContainer>
  );
};

export default App;
