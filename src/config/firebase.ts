// Firebase configuration for Expo
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';

// Firebase configuration - Updated for Authentication
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
let app;
let db;
let auth;
let storage;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  // Initialize services
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
  auth = getAuth(app);
  console.log('✅ Auth initialized');
  
  storage = getStorage(app);
  console.log('✅ Storage initialized');
  
  // Test auth configuration
  console.log('🔐 Auth config:', {
    currentUser: auth.currentUser,
    config: auth.config,
    app: auth.app.name
  });
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

export { db, auth, storage };
export default app;
