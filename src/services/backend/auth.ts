import { auth } from './config';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  phoneNumber: string | null;
  providerData: any[];
  metadata: any;
  getIdToken: () => Promise<string>;
}

export const signInWithEmailAndPassword = async (authObj: any, email: string, password: string) => {
  const mockUser: User = {
    uid: 'mock-user-uid',
    email: email,
    displayName: 'Mock User',
    photoURL: 'https://via.placeholder.com/150',
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    providerData: [],
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    getIdToken: async () => 'mock-jwt-token',
  };
  
  authObj.currentUser = mockUser;
  notifyListeners(authObj);
  
  return {
    user: mockUser,
    providerId: 'password',
    operationType: 'signIn',
  };
};

export const createUserWithEmailAndPassword = async (authObj: any, email: string, password: string) => {
  const mockUser: User = {
    uid: 'mock-user-' + Date.now(),
    email: email,
    displayName: null,
    photoURL: null,
    emailVerified: false,
    isAnonymous: false,
    phoneNumber: null,
    providerData: [],
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    getIdToken: async () => 'mock-jwt-token',
  };

  authObj.currentUser = mockUser;
  notifyListeners(authObj);

  return {
    user: mockUser,
    providerId: 'password',
    operationType: 'signUp',
  };
};

export const signOut = async (authObj: any) => {
  authObj.currentUser = null;
  notifyListeners(authObj);
  return Promise.resolve();
};

export const updateProfile = async (user: User, profile: { displayName?: string; photoURL?: string }) => {
  if (user) {
    if (profile.displayName !== undefined) user.displayName = profile.displayName;
    if (profile.photoURL !== undefined) user.photoURL = profile.photoURL;
  }
  return Promise.resolve();
};

export const sendPasswordResetEmail = async (authObj: any, email: string) => {
  console.log('Mock password reset email sent to:', email);
  return Promise.resolve();
};

export const onAuthStateChanged = (authObj: any, callback: (user: User | null) => void) => {
  authObj.listeners.push(callback);
  // Immediate callback
  callback(authObj.currentUser);
  
  return () => {
    authObj.listeners = authObj.listeners.filter((l: any) => l !== callback);
  };
};

export const getReactNativePersistence = (storage: any) => {
    return "MOCK_PERSISTENCE";
}

export const initializeAuth = (app: any, config: any) => {
    return auth;
}

export const getAuth = (app?: any) => {
    return auth;
}

function notifyListeners(authObj: any) {
  authObj.listeners.forEach((l: any) => l(authObj.currentUser));
}
