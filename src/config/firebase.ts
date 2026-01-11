// Firebase configuration for Expo
import { initializeApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
let app: any;
let db: any;
let auth: any;
let storage: any;

const initializeFirebase = async () => {
  try {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
    
    // Initialize services
    db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    // Initialize Auth with AsyncStorage persistence
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
    console.log('✅ Auth initialized with persistence');
    
    storage = getStorage(app);
    console.log('✅ Storage initialized');
    
    // Enable network for better development experience
    try {
      // Timeout ile network enable
      await Promise.race([
        enableNetwork(db),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network enable timeout')), 5000)
        )
      ]);
      console.log('✅ Firestore network enabled');
    } catch (error) {
      console.warn('⚠️ Firestore network enable failed (working in offline mode):', error);
      // Offline mode'da çalışmaya devam et
    }
    
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
};

// Initialize immediately
initializeFirebase();

export { db, auth, storage };
export default app;
