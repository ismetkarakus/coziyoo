import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService, UserData } from '../services/authService';
import { FirebaseUtils } from '../utils/firebaseUtils';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, userType: 'buyer' | 'seller') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase optimizasyonu geçici olarak devre dışı
    console.log('⚡ Skipping Firebase optimization for speed');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', {
        user: user ? `${user.email} (${user.uid})` : 'No user',
        emailVerified: user?.emailVerified,
        isAnonymous: user?.isAnonymous
      });
      setUser(user);
      
      if (user) {
        // Hızlı fallback - Firestore'a gitmeden önce temel bilgileri set et
        const fallbackData = {
          uid: user.uid,
          email: user.email || 'test@cazi.com',
          displayName: user.displayName || 'Test Kullanıcı',
          userType: 'buyer' as const,
          createdAt: new Date()
        };
        
        setUserData(fallbackData);
        console.log('⚡ Quick user data set, loading full data in background...');
        
        // Arka planda tam veriyi yükle
        authService.getUserData(user.uid).then(data => {
          if (data) {
            setUserData(data);
            console.log('✅ Full user data loaded');
          }
        }).catch(error => {
          console.warn('⚠️ Failed to load full user data, keeping fallback:', error);
        });
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    userType: 'buyer' | 'seller'
  ) => {
    setLoading(true);
    try {
      await authService.signUp(email, password, displayName, userType);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

