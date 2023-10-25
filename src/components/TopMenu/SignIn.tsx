import { User, signInWithPopup } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { auth, db, firestore } from '../../firestore';
import { useUserStore } from '../../hooks';
import { StyledSignInButton } from './styles';

interface SignInProps {
  user?: User;
  setUser: (user?: User) => void;
}

export const SignIn = ({ user, setUser }: SignInProps) => {
  const { users } = useUserStore();
  const usersRef = firestore.collection('users');

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

  useEffect(() => {
    if (auth.currentUser) {
      const fetchData = async () => {
        if (
          !users.length ||
          !users.some((existingUser) => existingUser.docId === auth.currentUser?.uid)
        ) {
          // If this is the first time the user logs in, save their information to firebase

          await usersRef.doc(auth.currentUser?.uid).set({
            addedDate: new Date(),
            photoURL: auth.currentUser?.photoURL,
          });
          console.log('new user added');
        } else if (
          !users.some(
            (existingUser) => existingUser.data.photoURL === auth.currentUser?.photoURL
          )
        ) {
          // Update the image if it has changed
          const currentUser = users.find(
            (existingUser) => existingUser.docId === auth.currentUser?.uid
          );
          if (currentUser?.docId) {
            const userDocRef = doc(db, 'users', currentUser.docId);
            try {
              await updateDoc(userDocRef, {
                modifiedDate: new Date(),
                photoURL: auth.currentUser?.photoURL,
              });
            } catch (err) {
              alert(err);
            }
          }
        }
      };
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, auth.currentUser]);

  return (
    <StyledSignInButton
      // To do: Add styles to styled component instead
      size="small"
      onClick={signInWithGoogle}
    >
      Sign in with Google
    </StyledSignInButton>
  );
};
