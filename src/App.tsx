import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Meetings } from './pages/Meetings/Meetings';
import './styles/styles.scss';
import { isBefore } from 'date-fns';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Layout, SignIn, TopMenuButton } from './components';
import { auth, firestore } from './firestore';
import { useUserStore } from './hooks';
import { useBookStore } from './hooks/useBookStore';
import { useMeetingStore } from './hooks/useMeetingStore';
import { Books, ClubDetails, Clubs, Home } from './pages';
import { MeetingDetails } from './pages/MeetingDetails/MeetingDetails';
import { StyledAppContainer, StyledHeader, StyledLogo } from './styles';
import {
  BookInfo,
  FirestoreBook,
  FirestoreMeeting,
  FirestoreUser,
  MeetingInfo,
  UserInfo,
} from './types';
import { updateDocument } from './utils';

function App() {
  const [user, setUser] = useState<User | undefined>();
  const [dateChecked, setDateChecked] = useState<boolean>(false);
  const { books, setBooks } = useBookStore();
  const { meetings, setMeetings } = useMeetingStore();
  const { setUsers } = useUserStore();

  useEffect(() => {
    const unsubscribeBooks = firestore
      .collection('books')
      .onSnapshot((snapshot) => {
        const newBooks = snapshot.docs.map((doc: DocumentData) => ({
          docId: doc.id,
          data: doc.data() as BookInfo,
        })) as FirestoreBook[];
        setBooks(newBooks);
      });

    const unsubscribeMeetings = firestore
      .collection('meetings')
      .onSnapshot((snapshot) => {
        const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
          docId: doc.id,
          data: doc.data() as MeetingInfo,
        })) as FirestoreMeeting[];
        setMeetings(newMeetings);
      });

    const unsubscribeUsers = firestore
      .collection('users')
      .onSnapshot((snapshot) => {
        const newUsers = snapshot.docs.map((doc: DocumentData) => ({
          docId: doc.id,
          data: doc.data() as UserInfo,
        })) as FirestoreUser[];
        setUsers(newUsers);
      });

    return () => {
      unsubscribeBooks();
      unsubscribeMeetings();
      unsubscribeUsers();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Here we do a roundabout check to see if any books' reading status needs to be updated according to today's date
    if (meetings?.length && books?.length && !dateChecked) {
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
            updateDocument('books', { readStatus: 'read' }, id);
          });
        }
      }

      setDateChecked(true);
    }
  }, [meetings, books, dateChecked]);

  const signOut = () => {
    auth.signOut();
    setUser(undefined);
  };
  return (
    <StyledAppContainer>
      <StyledHeader>
        <StyledLogo>
          <img
            src={require('./assets/img/bookshoes-small.jpg')}
            alt="Bookshoes"
          />
          <h1>Bookshoes</h1>
        </StyledLogo>
        {!user ? (
          <SignIn user={user} setUser={setUser}></SignIn>
        ) : (
          <TopMenuButton onSignOut={signOut} />
        )}
      </StyledHeader>

      <section>
        {user ? (
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
}

export default App;
