
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtnP3sLSvVLi2AVzf4luWUyZL55PPQmRM",
  authDomain: "zamhelper-240302.firebaseapp.com",
  projectId: "zamhelper-240302",
  storageBucket: "zamhelper-240302.firebasestorage.app",
  messagingSenderId: "666446126828",
  appId: "1:666446126828:web:a79602423003dc578ecfc9",
  measurementId: "G-H9R6FSXV0K"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);
