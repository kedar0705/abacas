
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDQOKOcCzVBlYvlfAtmdzSLB4ouBXMmGoo",
  authDomain: "abacas-67eba.firebaseapp.com",
  projectId: "abacas-67eba",
  storageBucket: "abacas-67eba.firebasestorage.app",
  messagingSenderId: "800560735781",
  appId: "1:800560735781:web:f408083d170babc84d41cc",
  measurementId: "G-RS3NJCLQNN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };