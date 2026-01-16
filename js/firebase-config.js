// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "PLAK_HIER_JE_API_KEY",
    authDomain: "PLAK_HIER_JE_PROJECT.firebaseapp.com",
    projectId: "PLAK_HIER_JE_PROJECT_ID",
    storageBucket: "PLAK_HIER_JE_PROJECT.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
