// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_RW7n92cb8I9zUfsj1u0NDin2IMgjJI0",
  authDomain: "rickdudziak-c80bb.firebaseapp.com",
  projectId: "rickdudziak-c80bb",
  storageBucket: "rickdudziak-c80bb.firebasestorage.app",
  messagingSenderId: "234849264289",
  appId: "1:234849264289:web:3dd541af25280798b9c6e0",
  measurementId: "G-KW0JNC0018"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);