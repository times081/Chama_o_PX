import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYZIt-SYc4-otvVs8hE3CoUn-gaFvzVZQ",
    authDomain: "chamaopx.firebaseapp.com",
    projectId: "chamaopx",
    storageBucket: "chamaopx.firebasestorage.app",
    messagingSenderId: "362104677197",
    appId: "1:362104677197:web:691901025ac08c6ed88d04",
    measurementId: "G-7LS6FTWHTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, addDoc, serverTimestamp, getDocs, query, orderBy };
