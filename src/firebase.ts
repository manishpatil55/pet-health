import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJkLNrc9UucVTSXgiIpMYLt9WgCOTXNbQ",
  authDomain: "pet-health-c1cfd.firebaseapp.com",
  projectId: "pet-health-c1cfd",
  storageBucket: "pet-health-c1cfd.firebasestorage.app",
  messagingSenderId: "314804147988",
  appId: "1:314804147988:web:f4599372c5cc119cb1d401",
  measurementId: "G-L5S9M1J33K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
