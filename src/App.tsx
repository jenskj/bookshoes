import { isBefore } from 'date-fns';
import { DocumentData, documentId } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout, SignIn, TopMenuButton } from './components';
import { auth, firestore } from './firestore';
import { useCurrentUserStore } from './hooks';
import { useBookStore } from './hooks/useBookStore';
import { useMeetingStore } from './hooks/useMeetingStore';
import { Books, ClubDetails, Clubs, Home } from './pages';
import { MeetingDetails } from './pages/MeetingDetails/MeetingDetails';
import { Meetings } from './pages/Meetings/Meetings';
import {
  StyledActiveHeader,
  StyledAppContainer,
  StyledHeader,
  StyledHeaderContainer,
  StyledInactiveHeader,
  StyledLogo,
  StyledOverflowContainer,
} from './styles';
import './styles/styles.scss';
import {
  BookInfo,
  ClubInfo,
  FirestoreBook,
  FirestoreClub,
  FirestoreMeeting,
  MeetingInfo,
  UserInfo,
} from './types';
import { getIdFromDocumentReference, updateDocument } from './utils';

const App = () => {
  const [dateChecked, setDateChecked] = useState<boolean>(false);
  const [clubHeader, setClubHeader] = useState<string>();
  const { books, setBooks } = useBookStore();
  const { meetings, setMeetings } = useMeetingStore();
  const {
    activeClub,
    currentUser,
    setCurrentUser,
    setActiveClub,
    setMembershipClubs,
  } = useCurrentUserStore();

  useEffect(() => {
    if (auth?.currentUser?.uid) {
      const unsubscribeUser = firestore
        .collection('users')
        .doc(auth.currentUser?.uid)
        .onSnapshot((snapshot) => {
          const newUser = {
            docId: snapshot.id,
            data: snapshot.data() as UserInfo,
          };
          if (newUser?.data) {
            setCurrentUser(newUser);
          }
        });

      return () => {
        unsubscribeUser();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) {
      const getData = async () => {
        const clubQuery = firestore
          .collection('clubs')
          // We only want member clubs
          .where(documentId(), 'in', currentUser?.data.memberships)
          .get();
        const membershipClubs: FirestoreClub[] = (await clubQuery).docs.map(
          (club) => {
            return { docId: club.id, data: club.data() as ClubInfo };
          }
        );
        setMembershipClubs(membershipClubs);
      };

      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (activeClub) {
      // Set global books state based on the active club
      const unsubscribeBooks = firestore
        .collection('clubs')
        .doc(activeClub?.docId)
        .collection('books')
        .onSnapshot((snapshot) => {
          const newBooks = snapshot.docs.map((doc: DocumentData) => ({
            docId: doc.id,
            data: doc.data() as BookInfo,
          })) as FirestoreBook[];
          setBooks(newBooks);
        });
      // Set global meetings state based on the active club
      const unsubscribeMeetings = firestore
        .collection('clubs')
        .doc(activeClub?.docId)
        .collection('meetings')
        .onSnapshot((snapshot) => {
          const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
            docId: doc.id,
            data: doc.data() as MeetingInfo,
          })) as FirestoreMeeting[];
          setMeetings(newMeetings);
        });

      // Set header in a separate state to avoid it glitching away when activeClub is set to undefined
      if (activeClub.data.name) {
        setClubHeader(activeClub.data.name);
      }

      return () => {
        unsubscribeBooks();
        unsubscribeMeetings();
      };
    } else {
      setBooks([]);
      setMeetings([]);

      // Remove club header after 300ms to avoid glitching
      setTimeout(() => {
        setClubHeader('');
        // To do: make variable that matches the title animation
      }, 300);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClub]);

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
            book?.data?.scheduledMeeting &&
            // And a firebase docId
            book.docId &&
            // And it has a scheduled meeting
            pastMeetings.includes(book?.data?.scheduledMeeting) &&
            // And it has "reading" as readStatus, push it to booksToUpdate
            book.data.readStatus === 'reading'
          ) {
            booksToUpdate.push(book.docId);
          }
        });
        if (booksToUpdate.length) {
          booksToUpdate.forEach((id) => {
            updateDocument(`clubs/${activeClub?.docId}/books`, { readStatus: 'read' }, id);
          });
        }
      }

      setDateChecked(true);
    }
  }, [meetings, books, dateChecked, activeClub]);

  useEffect(() => {
    if (
      currentUser?.data.activeClub &&
      getIdFromDocumentReference(currentUser.data.activeClub) !==
        activeClub?.docId
    ) {
      // If the currentUser gets a new active club, get the club from Firestore and set the activeClub state in Zustand
      const clubRef = firestore
        .collection('clubs')
        .doc(currentUser.data.activeClub.id);
      const newClub = clubRef.get();
      newClub.then((res) => {
        setActiveClub({ docId: res.id, data: res.data() as ClubInfo });
      });
    } else if (!currentUser?.data.activeClub) {
      // If the activeClub field not there, reset the activeClub state
      setActiveClub(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <StyledAppContainer>
      <StyledHeader>
        <StyledOverflowContainer>
          <StyledLogo>
            <img
              src={require('./assets/img/bookshoes-small.jpg')}
              alt="Bookshoes"
            />

            <StyledHeaderContainer activeClub={Boolean(activeClub)}>
              <StyledActiveHeader aria-hidden={!Boolean(activeClub)}>
                {clubHeader}
              </StyledActiveHeader>
              <StyledInactiveHeader aria-hidden={Boolean(activeClub)}>
                Bookmates
              </StyledInactiveHeader>
            </StyledHeaderContainer>
          </StyledLogo>
          {!currentUser ? <SignIn></SignIn> : <TopMenuButton />}
        </StyledOverflowContainer>
      </StyledHeader>

      <section>
        {currentUser ? (
          <BrowserRouter basename={`/${process.env.PUBLIC_URL}`}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="meetings" element={<Meetings />} />
                <Route path="/meetings/:id" element={<MeetingDetails />} />
                <Route path="books" element={<Books />} />
                <Route path="clubs" element={<Clubs />} />
                <Route path="/clubs/:id" element={<ClubDetails />} />
              </Route>
            </Routes>
          </BrowserRouter>
        ) : null}
      </section>
    </StyledAppContainer>
  );
};

export default App;
