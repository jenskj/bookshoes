import { Header, Layout } from '@components';
import { auth, db } from '@firestore';
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
import { getIdFromDocumentReference, updateDocument } from '@utils';
import { isBefore } from 'date-fns';
import {
  getDatabase,
  onDisconnect,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
} from 'firebase/database';
import {
  DocumentData,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StyledAppContainer, StyledContent } from './styles';
import './styles/styles.scss';

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
    if (!auth?.currentUser) {
      return;
    }
    const unsubscribeUser = onSnapshot(
      doc(db, 'users', auth.currentUser?.uid),
      (snapshot) => {
        const newUser = {
          docId: snapshot.id,
          data: snapshot.data() as UserInfo,
        };
        if (newUser?.data) {
          setCurrentUser(newUser);
        }
      }
    );

    return () => {
      unsubscribeUser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser?.data.memberships?.length) {
        const getData = async () => {
          const clubQuery = query(
            collection(db, 'clubs'),
            // We only want member clubs
            where(documentId(), 'in', currentUser?.data.memberships)
          );
          const membershipClubs: FirestoreClub[] = (
            await getDocs(clubQuery)
          ).docs.map((club) => {
            return { docId: club.id, data: club.data() as ClubInfo };
          });
          setMembershipClubs(membershipClubs);
        };

        getData();
      }
    }

    if (
      currentUser?.data.activeClub &&
      getIdFromDocumentReference(currentUser.data.activeClub) !==
        activeClub?.docId
    ) {
      // If the currentUser gets a new active club, get the club from Firestore and set the activeClub state in Zustand
      const getSetAsyncClub = async () => {
        if (db && currentUser?.data?.activeClub?.id) {
          const clubRef = doc(db, 'clubs', currentUser.data.activeClub?.id);
          const newClub = await getDoc(clubRef);
          setActiveClub({
            docId: newClub.id,
            data: newClub.data() as ClubInfo,
          });
        }
      };
      getSetAsyncClub();
    } else if (!currentUser?.data.activeClub) {
      // If the activeClub field not there, reset the activeClub state
      setActiveClub(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (activeClub) {
      // Set global books state based on the active club
      const unsubscribeBooks = onSnapshot(
        query(
          collection(db, `clubs/${activeClub?.docId}/books`),
          orderBy('addedDate')
        ),
        (snapshot) => {
          const newBooks = snapshot.docs.map((doc: DocumentData) => ({
            docId: doc.id,
            data: doc.data() as BookInfo,
          })) as FirestoreBook[];
          setBooks(newBooks);
        }
      );

      // Set global meetings state based on the active club
      const unsubscribeMeetings = onSnapshot(
        collection(db, `clubs/${activeClub?.docId}/meetings`),
        (snapshot) => {
          const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
            docId: doc.id,
            data: doc.data() as MeetingInfo,
          })) as FirestoreMeeting[];
          setMeetings(newMeetings);
        }
      );

      // Set global members state based on the active club
      const unsubscribeMembers = onSnapshot(
        collection(db, `clubs/${activeClub?.docId}/members`),
        (snapshot) => {
          const newMembers = snapshot.docs.map((doc: DocumentData) => ({
            docId: doc.id,
            data: doc.data() as MemberInfo,
          })) as FirestoreMember[];
          setMembers(newMembers);
        }
      );

      return () => {
        unsubscribeBooks();
        unsubscribeMeetings();
        unsubscribeMembers();
      };
    } else {
      setBooks([]);
      setMeetings([]);
      setMembers([]);
    }
  }, [activeClub, setBooks, setMeetings, setMembers]);

  useEffect(() => {
    // Here we do a roundabout check to see if any books' reading status needs to be updated according to today's date
    if (activeClub && meetings?.length && books?.length && !dateChecked) {
      const pastMeetings: string[] = [];
      // Loop through all meeting, and if their dates are in the past, push their id's to pastMeetings
      meetings.forEach((meeting) => {
        if (
          meeting?.data?.date?.seconds &&
          // It is necessary to calculate milliseconds since toDate() function is not available at this time
          isBefore(new Date(meeting.data.date.seconds * 1000), Date.now())
        ) {
          pastMeetings.push(meeting.docId);
        }
      });

      if (pastMeetings?.length) {
        const booksToUpdate: string[] = [];
        books.forEach((book) => {
          if (
            // If the book has a meeting
            book?.data?.scheduledMeetings?.length &&
            // And a firebase docId
            book.docId &&
            // All scheduled meetings are in the past
            book.data.scheduledMeetings?.every((meetingId) =>
              pastMeetings.includes(meetingId)
            ) &&
            // And it has "reading" as readStatus, push it to booksToUpdate
            book.data.readStatus === 'reading'
          ) {
            booksToUpdate.push(book.docId);
          }
        });
        if (booksToUpdate.length) {
          booksToUpdate.forEach((id) => {
            updateDocument(
              `clubs/${activeClub?.docId}/books`,
              { readStatus: 'read' },
              id
            );
          });
        }
      }

      setDateChecked(true);
    }
  }, [meetings, books, dateChecked, activeClub]);

  useEffect(() => {
    /**
     * User presence system
     */
    // Add a listener and callback for when connections change for the current user.
    // Since I can connect from multiple devices or browser tabs, we store each connection instance separately
    // any time that connectionsRef's value is null (i.e. has no children) I am offline
    if (auth.currentUser?.uid === undefined) {
      return;
    }
    const db = getDatabase();
    const myConnectionsRef = ref(
      db,
      `users/${auth.currentUser?.uid}/connections`
    );

    // stores the timestamp of my last disconnect (the last time I was seen online)
    const lastOnlineRef = ref(db, `users/${auth.currentUser?.uid}/lastOnline`);

    const connectedRef = ref(db, '.info/connected');
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
        const con = push(myConnectionsRef);

        // When I disconnect, remove this device
        onDisconnect(con).remove();

        // Add this device to my connections list
        // this value could contain info about the device or a timestamp too
        set(con, true);

        // When I disconnect, update the last time I was seen online
        onDisconnect(lastOnlineRef).set(serverTimestamp());
      }
    });
  }, [auth.currentUser?.uid]);

  return (
    <StyledAppContainer>
      {/* To do: look into HashRouter as a better alternative for gh-pages */}
      <BrowserRouter basename={`/${process.env.PUBLIC_URL}`}>
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
