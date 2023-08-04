import './styles/styles.scss';
import firebase from 'firebase/compat/app';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Meetings } from './pages/Meetings/Meetings';

import { auth } from './firestore';
import { Layout } from './components';
import { Books } from './pages';
import { StyledHeader } from './styles';
import { MeetingDetails } from './pages/MeetingDetails/MeetingDetails';

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
        <button className="sign-in" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      </>
    );
  }

  function SignOut() {
    return (
      auth.currentUser && (
        <button className="sign-out" onClick={() => auth.signOut()}>
          Sign Out
        </button>
      )
    );
  }

  return (
    <>
      <StyledHeader>
        <h1>Books/hoes</h1>
        <SignOut />
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
        ) : (
          <SignIn />
        )}
      </section>
    </>
  );
}

export default App;
