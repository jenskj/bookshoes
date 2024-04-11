import {
  DocumentReference,
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firestore';
import { UserRole } from '../types';

export const addNewDocument = async (
  collectionName: string,
  body: Record<string, any>
) => {
  return await addDoc(collection(db, collectionName), body);
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    alert(err);
  }
};

export const updateDocument = async (
  collectionName: string,
  body: Record<string, any>,
  docId: string
) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...body,
    modifiedDate: Timestamp.now(),
  });
};

export const addNewClubMember = async (clubId: string, role?: UserRole) => {
  if (!auth.currentUser?.uid) {
    return;
  }
  const addedDate = Timestamp.now();
  const userReference = doc(db, 'users', auth.currentUser?.uid);
  const userDoc = await getDoc(userReference);

  const newMember = {
    ...userDoc.data(),
    addedDate,
    role: role ? role : 'standard',
  };
  const existingMemberQuery = query(
    collection(db, 'clubs/' + clubId + '/members'),
    where('uid', '==', auth.currentUser?.uid)
  );

  const isMember = (await getDocs(existingMemberQuery)).docs.some(
    (doc) => doc.data().uid === auth.currentUser?.uid
  );

  if (!isMember) {
    try {
      addNewDocument('clubs/' + clubId + '/members', newMember).then(
        async () => {
          if (auth?.currentUser?.uid) {
            updateDocument(
              'users',
              {
                memberships: arrayUnion(clubId),
                activeClub: doc(db, 'clubs', clubId),
                modifiedDate: Timestamp.now(),
              },
              auth.currentUser?.uid
            );
          }
        }
      );
    } catch (err) {
      alert(err);
    }
  } else {
    alert('Already a member');
  }
};

export const updateBookScheduledMeetings = (
  bookIds: string[],
  activeClubId: string,
  meetingId: string,
  timestamp?: Timestamp,
  remove = false
) => {
  bookIds.forEach(async (bookId) => {
    if (bookId) {
      const bookDocRef = doc(db, `clubs/${activeClubId}/books`, bookId);

      try {
        await updateDoc(bookDocRef, {
          modifiedDate: Timestamp.now(),
          scheduledMeetings: !remove
            ? arrayUnion(meetingId)
            : arrayRemove(meetingId),
        });
      } catch (err) {
        alert(err);
      }
    }
  });
};

export const getIdFromDocumentReference = (ref: DocumentReference) => {
  const refArray = ref.path.split('/');
  return refArray[refArray.length - 1];
};
