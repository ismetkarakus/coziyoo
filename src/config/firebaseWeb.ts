// Web versiyonu için Firebase config
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC1QUk6--ah0V1YfcnN3B7fU7r7D8nKpk",
  authDomain: "cazi-app.firebaseapp.com",
  projectId: "cazi-app",
  storageBucket: "cazi-app.firebasestorage.app",
  messagingSenderId: "729457681926",
  appId: "1:729457681926:web:31eddeb2b968d0e0a18587",
  measurementId: "G-50TS4KKHC1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;


