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
    const fetchData = async () => {
      if (user) {
        if (!users.some((existingUser) => existingUser.data.id === user.uid)) {
          // If this is the first time the user logs in, save their information to firebase
          await usersRef.add({
            addedDate: new Date(),
            id: user.uid,
            photoURL: user.photoURL,
          });
        } else if (
          !users.some(
            (existingUser) => existingUser.data.photoURL === user.photoURL
          )
        ) {
          const currentUser = users.find(
            (existingUser) => existingUser.data.id === user.uid
          );
          if (currentUser?.docId) {
            const userDocRef = doc(db, 'users', currentUser.docId);
            try {
              await updateDoc(userDocRef, {
                modifiedDate: new Date(),
                photoURL: user.photoURL,
              });
            } catch (err) {
              alert(err);
            }
          }
        }
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
