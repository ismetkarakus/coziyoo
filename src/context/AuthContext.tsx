import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authService, UserData, User } from '../services/authService';
import { router } from 'expo-router';

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
      const storedUser = await authService.loadStoredUser();
      if (storedUser) {
        setUser(storedUser);
        await refreshUserData(storedUser.uid);
      }
      setLoading(false);
    };
    initAuth();
  }, [refreshUserData]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
      await refreshUserData(user.uid);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, userType: 'buyer' | 'seller' | 'both') => {
    setLoading(true);
    try {
      const user = await authService.signUp(email, password, displayName, userType);
      setUser(user);
      await refreshUserData(user.uid);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setUserData(null);
    router.replace('/(auth)/sign-in');
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
