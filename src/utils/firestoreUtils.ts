import { doc, updateDoc } from 'firebase/firestore';
import { db, firestore } from '../firestore';

export const addNewDocument = async (
  collectionName: string,
  body: Record<string, any>
) => {
  const booksRef = firestore.collection(collectionName);
  const addedDate = new Date();
  await booksRef.add({ ...body, addedDate });
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
