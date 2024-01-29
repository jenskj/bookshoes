import { signInWithPopup } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { DocumentReference, doc, updateDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { auth, db, firestore } from '../../firestore';
import { useCurrentUserStore } from '../../hooks';
import { ClubInfo, FirestoreUser, UserInfo } from '../../types';
import { StyledSignInButton } from './styles';

export const SignIn = () => {
  // const [user, setUser] = useState<User | undefined>();
  const usersRef = firestore.collection('users');
  const { setActiveClub, setCurrentUser } = useCurrentUserStore();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (userState) => {
      if (userState) {
        if (auth.currentUser?.uid) {
          const existingUserRef = firestore
            .collection('users')
            .doc(auth.currentUser?.uid);
          const existingUser = await existingUserRef.get();
          if (!existingUser.exists) {
            // If this is the first time the user logs in, save their information to firebase
            await usersRef.doc(auth.currentUser?.uid).set({
              uid: auth.currentUser?.uid,
              email: auth.currentUser?.email,
              addedDate: new Date(),
              displayName:
                auth.currentUser?.displayName || auth.currentUser?.email,
              photoURL: auth.currentUser?.photoURL,
            });
          } else {
            const users = (await firestore.collection('users').get()).docs;

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
                const clubRef = firestore
                  .collection('clubs')
                  .doc((user.data.activeClub as DocumentReference).id);
                const newClub = clubRef.get();
                setActiveClub({
                  docId: (await newClub).id,
                  data: (await newClub).data() as ClubInfo,
                });
              }

              // To do: make into method that checks if a field has been changed, and then updates it if it has
              // Maybe look into the "merge" feature in firestore
              
              if (user?.data.photoURL !== auth.currentUser.photoURL) {
                // Update the image if it has changed
                if (user?.docId) {
                  const userDocRef = doc(db, 'users', user.docId);
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
