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
        setProfileLoading(true); // Start profile loading
        const cacheKey = `user_${user.uid}`; // Define cacheKey

        // Hızlı fallback - Firestore'a gitmeden önce temel bilgileri set et
        const fallbackData: UserData = { // Added type assertion
          uid: user.uid,
          email: user.email || 'test@cazi.com',
          displayName: user.displayName || 'Test Kullanıcı',
          userType: 'buyer', // Default to buyer
          createdAt: new Date()
        };
        
        setUserData(fallbackData);
        console.log('⚡ Quick user data set, loading full data in background...');
        
        // Cache'den hızlıca yükle (eğer varsa)
        const cached = await AsyncStorage.getItem(cacheKey);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log('📦 Cache den yuklenen veri:', {
            userType: parsed.userType,
            sellerEnabled: parsed.sellerEnabled,
            email: parsed.email,
            uid: parsed.uid
          });
          
          setUserData(parsed); // Hemen göster
          setProfileLoading(false); // ✅ Cache varsa hemen loading'i bitir
          console.log('⚡ Cache hızlı yüklendi, loading bitti');
          
          // ✅ Cache ile hemen yönlendirme yap
          handleAutoRedirect(parsed);
        }
        
        // ✅ Firestore'u arka planda güncelle (blocking yapmadan)
        getUserDataSafe(user.uid, 800) // 0.8 saniye timeout, used user.uid instead of firebaseUser.uid
          .then(async (freshData) => {
            if (freshData) {
              setUserData(freshData);
              await AsyncStorage.setItem(cacheKey, JSON.stringify(freshData));
              console.log('🔥 Firestore arka planda güncellendi');
              
              // Eğer cache yoktu, şimdi yönlendir
              if (!cached) {
                setProfileLoading(false);
                handleAutoRedirect(freshData);
              }
            }
          })
          .catch((error) => {
            console.log('Firestore arka plan hatası (normal):', error);
            // Cache yoksa ve Firestore de başarısızsa
            if (!cached) {
              setProfileLoading(false);
            }
          });
        
        // Eğer cache yoksa, çok kısa süre bekle
        if (!cached) {
          setTimeout(() => {
            setProfileLoading(false);
            console.log('⏰ Timeout ile loading bitti');
          }, 500); // 0.5 saniye max bekleme
        }
      } else {
        const mockSession = await authService.getMockSession();
        if (mockSession) {
          setUser(mockSession.user);
          setUserData(mockSession.userData);
          setProfileLoading(false);
          handleAutoRedirect(mockSession.userData);
        } else {
          setUserData(null);
          setProfileLoading(false); // Reset profile loading when user logs out
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [refreshUserData]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
    } catch (error) {
      const mockSession = await authService.signInWithMockCredentials(email, password);
      if (mockSession) {
        setUser(mockSession.user);
        setUserData(mockSession.userData);
        setProfileLoading(false);
        setAuthLoading(false);
        handleAutoRedirect(mockSession.userData);
        return;
      }
      setAuthLoading(false); // Changed setLoading to setAuthLoading
      throw error;
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
