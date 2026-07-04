import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnrqISRt1-B7QmQah9i3f8-qj8bmLAQu8",
  authDomain: "coded-funds-prediction.firebaseapp.com",
  projectId: "coded-funds-prediction",
  storageBucket: "coded-funds-prediction.firebasestorage.app",
  messagingSenderId: "74680865102",
  appId: "1:74680865102:web:957bb9e510a63ef7458e1f",
  measurementId: "G-SM00C9DT3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };