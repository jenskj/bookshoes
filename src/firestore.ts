import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
const API_KEY = import.meta.env.VITE_FIRESTORE_API ?? '';

const app = initializeApp({
  apiKey: API_KEY,
  authDomain: 'bookshoesfb.firebaseapp.com',
  projectId: 'bookshoesfb',
  storageBucket: 'bookshoesfb.appspot.com',
  messagingSenderId: '499374635021',
  appId: '1:499374635021:web:b727626120719fb729bd44',
  databaseURL:
    'https://bookshoesfb-default-rtdb.europe-west1.firebasedatabase.app/',
});

export let auth = getAuth(app);
export let db = getFirestore(app);
export let functions = getFunctions(app);

// eslint-disable-next-line no-restricted-globals
if (location.hostname === 'localhost') {
  // Reset instances
  auth = getAuth();
  db = getFirestore();
  functions = getFunctions();
  // Connect to emulators
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
