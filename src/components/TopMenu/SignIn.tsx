import { auth, db } from '@firestore';
import { useCurrentUserStore } from '@hooks';
import { ClubInfo, FirestoreUser, UserInfo } from '@types';
import { signInWithPopup } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import {
  DocumentReference,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useEffect } from 'react';
import { StyledSignInButton } from './styles';

export const SignIn = () => {
  const usersRef = collection(db, 'users');
  const { setActiveClub, setCurrentUser } = useCurrentUserStore();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (userState) => {
      if (userState) {
        if (auth.currentUser?.uid && db) {
          const userRef = doc(db, 'users', auth.currentUser?.uid);

          const existingUser = await getDoc(userRef);
          if (!existingUser.exists()) {
            try {
              // If this is the first time the user logs in, save their information to firebase
              const newUserInfo = {
                uid: auth.currentUser?.uid,
                email: auth.currentUser?.email,
                addedDate: Timestamp.now(),
                displayName:
                  auth.currentUser?.displayName || auth.currentUser?.email,
                photoURL: auth.currentUser?.photoURL,
              } as UserInfo;
              await setDoc(userRef, newUserInfo).then((res) => {
                if (auth.currentUser?.uid) {
                  setCurrentUser({
                    docId: auth.currentUser?.uid,
                    data: newUserInfo,
                  });
                }
              });
            } catch (err) {
              console.error(err);
            }
          } else {
            const users = (await getDocs(collection(db, 'users'))).docs;

            const newUser = users.find(
              (existingUser) => existingUser.id === auth.currentUser?.uid
            );
            if (newUser) {
              const user = {
                docId: newUser.id,
                data: newUser.data() as UserInfo,
              } as FirestoreUser;
              setCurrentUser(user);
              if (user.data.activeClub) {
                const clubRef = doc(
                  db,
                  'clubs',
                  (user.data.activeClub as DocumentReference).id
                );

                const newClub = getDoc(clubRef);
                setActiveClub({
                  docId: (await newClub).id,
                  data: (await newClub).data() as ClubInfo,
                });
              }

              // To do: make into method that checks if a field has been changed, and then updates it if it has
              // Maybe look into the "merge" feature in firestore

              if (
                !user?.data.photoURL ||
                user?.data.photoURL !== auth.currentUser.photoURL
              ) {
                // Update the image if it has changed
                if (user?.docId) {
                  const userDocRef = doc(db, 'users', user.docId);
                  try {
                    await updateDoc(userDocRef, {
                      modifiedDate: Timestamp.now(),
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
      } else {
        setCurrentUser(undefined);
        setActiveClub(undefined);
      }
    });

    return () => unsubscribeAuth();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error(error);
    });
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
