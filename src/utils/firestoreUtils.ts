import {
  DocumentReference,
  Timestamp,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, firestore } from '../firestore';
import { MemberInfo, UserRole } from '../types';

export const addNewDocument = async (
  collectionName: string,
  body: Record<string, any>
) => {
  const collectionRef = firestore.collection(collectionName);
  const addedDate = new Date();
  return await collectionRef.add({ ...body, addedDate });
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
  try {
    await updateDoc(docRef, {
      ...body,
      modifiedDate: new Date(),
    });
  } catch (err) {
    alert(err);
  }
};

export const addNewClubMember = async (clubId: string, role?: UserRole) => {
  if (!auth.currentUser?.uid) {
    return;
  }
  const addedDate = new Date();
  const userReference = firestore.doc('users/' + auth.currentUser?.uid);
  const userDoc = await getDoc(userReference);

  const newMember = {
    ...userDoc.data(),
    addedDate,
    modifiedDate: '',
    role: role ? role : 'standard',
  };
  const membersRef = firestore
    .collection('clubs')
    .doc(clubId)
    .collection('members');

  const isMember = (await membersRef.get()).docs.some(
    (doc) => (doc.data() as MemberInfo).uid === auth.currentUser?.uid
  );

  if (!isMember) {
    try {
      await membersRef.add(newMember);
      updateDocument(
        'users',
        {
          memberships: arrayUnion(clubId),
          activeClub: firestore.doc('clubs/' + clubId),
        },
        auth.currentUser?.uid
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
