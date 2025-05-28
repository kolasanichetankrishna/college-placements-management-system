
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbjYAEp_lsXK5TyHZl6u3BHzTFYyaSRaY",
  authDomain: "placement-management-1fe05.firebaseapp.com",
  projectId: "placement-management-1fe05",
  storageBucket: "placement-management-1fe05.firebasestorage.app",
  messagingSenderId: "349615112026",
  appId: "1:349615112026:web:c8937c82a93c78bc4abd63",
  measurementId: "G-MXG6VQ0CXD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
