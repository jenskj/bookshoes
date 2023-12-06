import {
  DocumentReference,
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

export const addNewClubMember = async (clubId: string, role?: UserRole) => {
  if (!auth.currentUser?.uid) {
    return;
  }
  const addedDate = new Date();
  const userReference = firestore.doc('users/' + auth.currentUser?.uid);
  const userDoc = await getDoc(userReference);

  const newMember = {
    addedDate,
    modifiedDate: '',
    user: { docId: userDoc.id, data: userDoc.data() },
    role: role ? role : 'standard',
  };
  const membersRef = firestore
    .collection('clubs')
    .doc(clubId)
    .collection('members');

  const isMember = (await membersRef.get()).docs.some(
    (doc) => (doc.data() as MemberInfo).user.docId === auth.currentUser?.uid
  );

  if (!isMember) {
    try {
      return await membersRef.add(newMember);
    } catch (err) {
      alert(err);
    }
  } else {
    alert('Already a member');
  }
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

export const getIdFromDocumentReference = (ref: DocumentReference) => {
  const refArray = ref.path.split('/');
  console.log(refArray[refArray.length - 1]);
  return refArray[refArray.length - 1];
};
