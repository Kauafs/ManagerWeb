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
  apiKey: "Cadastre a sua :)",
  authDomain: "Cadastre a sua :)",
  projectId: "Cadastre a sua :)",
  storageBucket: "Cadastre a sua :)",
  messagingSenderId: "",
  appId: "Cadastre a sua :)",
  measurementId: "Cadastre a sua :)"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

