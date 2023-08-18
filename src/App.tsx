import firebase from 'firebase/compat/app';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Meetings } from './pages/Meetings/Meetings';
import './styles/styles.scss';

import { Layout } from './components';
import { auth } from './firestore';
import { Books } from './pages';
import { MeetingDetails } from './pages/MeetingDetails/MeetingDetails';
import {
  StyledAppContainer,
  StyledHeader,
  StyledLoginButton,
  StyledLogo,
} from './styles';
import React from 'react';
function App() {
  // @ts-ignore
  const [user] = useAuthState(auth);

  function SignIn() {
    const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    };

    return (
      <>
        <StyledLoginButton
          variant="contained"
          size="small"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </StyledLoginButton>
      </>
    );
  }

  function SignOut() {
    return (
      auth.currentUser && (
        <StyledLoginButton
          variant="contained"
          size="small"
          onClick={() => auth.signOut()}
        >
          Sign Out
        </StyledLoginButton>
      )
    );
  }

  return (
    <StyledAppContainer>
      <StyledHeader>
        <StyledLogo>
          <img src={require('./assets/img/bookshoes.jpg')} alt="Bookshoes" />
          <h1>Bookshoes</h1>
        </StyledLogo>
        {user ? <SignOut /> : <SignIn />}
      </StyledHeader>

      <section>
        {user ? (
          <BrowserRouter>
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
