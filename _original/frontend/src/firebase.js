import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database';
import { getFirestore, collection, getDocs, setDoc } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBTE6cK6iA_Yc4htWWF2tQlB5mc2w2tSg8",
  authDomain: "mejico-medspa-clinic.firebaseapp.com",
  projectId: "mejico-medspa-clinic",
  storageBucket: "mejico-medspa-clinic.appspot.com",
  messagingSenderId: "579870977112",
  appId: "1:579870977112:web:5a083a55b8b4864d89ae2d",
  measurementId: "G-VCGCWVBBZ3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const database = getDatabase(app);
const database = getFirestore(app);

export { auth, database, collection, getDocs };