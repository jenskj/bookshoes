import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { getFirestore } from 'firebase/firestore';
const API_KEY = process.env.REACT_APP_FIRESTORE_API;

const app = firebase.initializeApp({
  apiKey: API_KEY,
  authDomain: 'bookshoesfb.firebaseapp.com',
  projectId: 'bookshoesfb',
  storageBucket: 'bookshoesfb.appspot.com',
  messagingSenderId: '499374635021',
  appId: '1:499374635021:web:b727626120719fb729bd44',
});
const db = getFirestore(app);

export { db };
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const analytics = firebase.analytics();
