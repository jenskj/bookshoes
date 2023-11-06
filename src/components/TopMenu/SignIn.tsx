import { User, signInWithPopup } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { DocumentReference, doc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { auth, db, firestore } from '../../firestore';
import { useCurrentUserStore } from '../../hooks';
import { ClubInfo, FirestoreUser } from '../../types';
import { StyledSignInButton } from './styles';

interface SignInProps {
  setUser: (user?: User) => void;
}

export const SignIn = ({ setUser }: SignInProps) => {
  const usersRef = firestore.collection('users');
  const { setActiveClub } = useCurrentUserStore();

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        handleLogin();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleLogin = async () => {
    if (auth.currentUser?.uid) {
      const existingUserRef = firestore
        .collection('users')
        .doc(auth.currentUser?.uid);
      const existingUser = await existingUserRef.get();
      if (!existingUser.exists) {
        // If this is the first time the user logs in, save their information to firebase
        await usersRef.doc(auth.currentUser?.uid).set({
          addedDate: new Date(),
          displayName: auth.currentUser?.displayName || auth.currentUser?.email,
          photoURL: auth.currentUser?.photoURL,
        });
      } else {
        const users = (await firestore.collection('users').get()).docs;

        const newUser = users.find(
          (existingUser) => existingUser.id === auth.currentUser?.uid
        );
        if (newUser) {
          const currentUser = {
            docId: newUser.id,
            data: newUser.data(),
          } as FirestoreUser;
          if (currentUser.data.activeClub) {
            const clubRef = firestore
              .collection('clubs')
              .doc((currentUser.data.activeClub as DocumentReference).id);
            const newClub = clubRef.get();
            console.log((await newClub).data() as ClubInfo);
            setActiveClub((await newClub).data() as ClubInfo);
          }

          // To do: make into method that checks if a field has been changed, and then updates it if it has
          if (currentUser?.data.photoURL !== auth.currentUser.photoURL) {
            // Update the image if it has changed
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
        }
      }
    }
  };

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
