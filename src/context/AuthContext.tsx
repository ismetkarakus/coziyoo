import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authService, UserData } from '../services/authService';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock types and variables to fix "reds"
type User = any;
const onAuthStateChanged = (auth: any, callback: (user: any) => void) => {
  callback(null);
  return () => {};
};
const auth = {} as any;
const getUserDataSafe = async (...args: any[]) => null;
const handleAutoRedirect = (userData: any) => {
  if (!userData) return;
  const isSeller = userData.userType === 'seller' || userData.userType === 'both';
  router.replace(isSeller ? '/(seller)/dashboard' : '/(tabs)');
};

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, userType: 'buyer' | 'seller' | 'both') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshUserData = useCallback(async (uid: string) => {
      setProfileLoading(true);
      try {
          const data = await authService.getUserData(uid);
          if (data) {
              setUserData(data);
          }
      } catch (error) {
          console.error('Refresh user data error:', error);
      } finally {
          setProfileLoading(false);
      }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check for mock session (test accounts)
        const mockSession = await authService.getMockSession();
        if (mockSession) {
          setUser(mockSession.user);
          setUserData(mockSession.userData);
          // Let AuthGuard handle the redirect after state is set
          return;
        }
        
        // Then check for regular stored auth
        const storedUser = await authService.loadStoredUser();
        if (storedUser) {
          const userData = await authService.getUserData(storedUser.uid);
          if (userData) {
            setUser(storedUser);
            setUserData(userData);
            // Let AuthGuard handle the redirect after state is set
            return;
          }
        }
        
        setUser(null);
        setUserData(null);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
        setProfileLoading(false);
      }
    };
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      setUser(result.user);
      setUserData(result.userData);
      // State updates are async - wait for next tick before redirect
      setTimeout(() => handleAutoRedirect(result.userData), 0);
    } catch (error) {
      const mockSession = await authService.signInWithMockCredentials(email, password);
      if (mockSession) {
        setUser(mockSession.user);
        setUserData(mockSession.userData);
        // State updates are async - wait for next tick before redirect
        setTimeout(() => handleAutoRedirect(mockSession.userData), 0);
        return;
      }
      throw error;
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, userType: 'buyer' | 'seller' | 'both') => {
    setLoading(true);
    try {
      await authService.signUp(email, password, displayName, userType);
      await authService.signOut();
      setUser(null);
      setUserData(null);
      router.replace('/(auth)/sign-in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setUserData(null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const value = {
    user,
    userData,
    loading,
    profileLoading,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
