
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

const firebaseConfig = {
    // apiKey: "AIzaSyBYBbYmTm5u3m6_ScKMSNIQBaj38wLViSMJA",
    apiKey: "AIzaSyBYYbTm5u3m6_ScKMSNIQBaj38wUYiSMJA",
    authDomain: "nishtha-b335b.firebaseapp.com",
    projectId: "nishtha-b335b",
    storageBucket: "nishtha-b335b.firebasestorage.app",
    messagingSenderId: "304997151098",
    appId: "1:304997151098:web:0967954acd0bcaed6c26c3",
    measurementId: "G-E75ZKK4F3K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
