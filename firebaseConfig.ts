// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBLhCSQNP-2ik6ENOuDFJGF2dTMbVVi1A",
  authDomain: "managerweb-13f22.firebaseapp.com",
  projectId: "managerweb-13f22",
  storageBucket: "managerweb-13f22.firebasestorage.app",
  messagingSenderId: "307167653732",
  appId: "1:307167653732:web:25a335f4af279d66735471",
  measurementId: "G-SF2L87REJG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

