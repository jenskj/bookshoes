import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Meetings } from './pages/Meetings/Meetings';
import './styles/styles.scss';

import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Layout, SignIn, TopMenuButton } from './components';
import { auth, firestore } from './firestore';
import { useUserStore } from './hooks';
import { useBookStore } from './hooks/useBookStore';
import { useMeetingStore } from './hooks/useMeetingStore';
import { Books } from './pages';
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

function App() {
  const [user, setUser] = useState<User | undefined>();
  const { setBooks } = useBookStore();
  const { setMeetings } = useMeetingStore();
  const { setUsers } = useUserStore();

  useEffect(() => {
    firestore.collection('books').onSnapshot((snapshot) => {
      const newBooks = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as BookInfo,
      })) as FirestoreBook[];
      setBooks(newBooks);
    });

    firestore.collection('meetings').onSnapshot((snapshot) => {
      const newMeetings = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as MeetingInfo,
      })) as FirestoreMeeting[];
      setMeetings(newMeetings);
    });

    firestore.collection('users').onSnapshot((snapshot) => {
      const newUsers = snapshot.docs.map((doc: DocumentData) => ({
        docId: doc.id,
        data: doc.data() as UserInfo,
      })) as FirestoreUser[];
      setUsers(newUsers);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              </Route>
            </Routes>
          </BrowserRouter>
        ) : null}
      </section>
    </StyledAppContainer>
  );
}

export default App;
