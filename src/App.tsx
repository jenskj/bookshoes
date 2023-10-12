import firebase from 'firebase/compat/app';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Meetings } from './pages/Meetings/Meetings';
import './styles/styles.scss';

import { useTheme } from '@mui/material';
import { User, getAuth, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { Layout } from './components';
import { Books } from './pages';
import { MeetingDetails } from './pages/MeetingDetails/MeetingDetails';
import {
  StyledAppContainer,
  StyledHeader,
  StyledLoginButton,
  StyledLogo,
} from './styles';
function App() {
  const auth = getAuth();
  const [user, setUser] = useState<User | undefined>();
  const theme = useTheme();

  function SignIn() {
    const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          setUser(result.user);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    return (
      <>
        <StyledLoginButton
          // Add styles to styled component instead

          style={{ color: theme.palette.background.default, border: 'none' }}
          size="small"
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </StyledLoginButton>
      </>
    );
  }

  function SignOut() {
    const onSignOut = () => {
      auth.signOut();
      setUser(undefined);
    };
    return (
      auth.currentUser && (
        <StyledLoginButton
          // Add styles to styled component instead
          style={{ color: theme.palette.background.default, border: 'none' }}
          size="small"
          onClick={onSignOut}
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
          <img
            src={require('./assets/img/bookshoes-small.jpg')}
            alt="Bookshoes"
          />
          <h1>Bookshoes</h1>
        </StyledLogo>
        {user ? <SignOut /> : <SignIn />}
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
