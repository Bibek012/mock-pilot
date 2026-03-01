import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUytlefdgLtciOMjd6Aut0Zu5tx8j5UkU",
  authDomain: "mockpilot-a3378.firebaseapp.com",
  projectId: "mockpilot-a3378",
  storageBucket: "mockpilot-a3378.firebasestorage.app",
  messagingSenderId: "857367115763",
  appId: "1:857367115763:web:dc994d42edff605d660486",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Export appId
export const appId = firebaseConfig.projectId;