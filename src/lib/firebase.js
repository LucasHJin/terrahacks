import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCpescUdm8wa6G00HZ44Y0nJb2_vypO-kc",
  authDomain: "terrahacks-d83d4.firebaseapp.com",
  projectId: "terrahacks-d83d4",
  storageBucket: "terrahacks-d83d4.firebasestorage.app",
  messagingSenderId: "902560784624",
  appId: "1:902560784624:web:7dcd48e5f2e037fb60e235",
  measurementId: "G-W2JGHX11BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
