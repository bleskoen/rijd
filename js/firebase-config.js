// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA5TSw1-_CIMCM1xHq0IgxGfqJs4VcnOVY",
  authDomain: "autorit.firebaseapp.com",
  projectId: "autorit",
  storageBucket: "autorit.firebasestorage.app",
  messagingSenderId: "491125877433",
  appId: "1:491125877433:web:a526e3f5a612bdf0588968",
  measurementId: "G-C2EFYS8JXL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
