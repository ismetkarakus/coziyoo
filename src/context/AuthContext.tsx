import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added import
import { auth } from '../config/firebase';
import { authService, UserData, getUserDataSafe } from '../services/authService'; // Added getUserDataSafe
import { router } from 'expo-router'; // Added router import

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  profileLoading: boolean; // Added profileLoading
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, userType: 'buyer' | 'seller' | 'both') => Promise<void>;
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
  const [authLoading, setAuthLoading] = useState(true); // Changed from loading
  const [profileLoading, setProfileLoading] = useState(false); // Added profileLoading
  
  // ✅ Süper akıllı loading - cache varsa anında bitir
  const loading = authLoading; // Derived loading state

  // handleAutoRedirect function
  const handleAutoRedirect = useCallback((data: UserData) => {
    console.log('🎯 Otomatik yönlendirme kontrol:', {
      userType: data.userType,
      uid: data.uid,
      email: data.email
    });
    
    // Satıcı mı kontrol et
    const isSeller = data.userType === 'seller' || (data as any).sellerEnabled === true; // Added (data as any) for sellerEnabled
    
    console.log('🔍 Satıcı kontrolü:', {
      userType_is_seller: data.userType === 'seller',
      sellerEnabled_is_true: (data as any).sellerEnabled === true,
      final_isSeller: isSeller
    });
    
    // ✅ Hızlı yönlendirme için setTimeout kullan
    setTimeout(() => {
      if (isSeller) {
        console.log('✅ SATICI olarak yönlendiriliyor → /(seller)/dashboard');
        try {
          router.replace('/(seller)/dashboard');
        } catch (error) {
          console.error('Seller dashboard yönlendirme hatası:', error);
          // Fallback olarak push dene
          router.push('/(seller)/dashboard');
        }
      } else {
        console.log('✅ ALICI olarak yönlendiriliyor → /(tabs)/');
        try {
          router.replace('/(tabs)/');
        } catch (error) {
          console.error('Buyer tabs yönlendirme hatası:', error);
          // Fallback olarak push dene
          router.push('/(tabs)/');
        }
      }
    }, 50); // 50ms sonra yönlendir (çok hızlı)
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
      
      setAuthLoading(false); // Changed setLoading to setAuthLoading
    });

    return unsubscribe;
  }, [handleAutoRedirect]); // Added handleAutoRedirect to dependency array

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true); // Changed setLoading to setAuthLoading
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

  const signUp = async (
    email: string, 
    password: string, 
    displayName: string, 
    userType: 'buyer' | 'seller' | 'both'
  ) => {
    setAuthLoading(true); // Changed setLoading to setAuthLoading
    try {
      await authService.signUp(email, password, displayName, userType);
    } catch (error) {
      setAuthLoading(false); // Changed setLoading to setAuthLoading
      throw error;
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
    profileLoading, // Added profileLoading
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
