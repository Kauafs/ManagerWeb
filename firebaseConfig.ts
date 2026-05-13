// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "CADASTRE A SUA ;)",
  authDomain: "CADASTRE A SUA ;)",
  projectId: "CADASTRE A SUA ;)",
  storageBucket: "CADASTRE A SUA ;)",
  messagingSenderId: "CADASTRE A SUA ;)",
  appId: "CADASTRE A SUA ;)",
  measurementId: "CADASTRE A SUA ;)"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

