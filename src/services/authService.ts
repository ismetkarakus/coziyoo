import { apiClient } from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  userType: 'buyer' | 'seller' | 'both';
  createdAt: Date;
}

interface MockAccount {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  userType: 'buyer' | 'seller' | 'both';
}

interface MockSession {
  uid: string;
  email: string;
  displayName: string;
  userType: 'buyer' | 'seller' | 'both';
}

const MOCK_SESSION_KEY = 'mock_session';
const MOCK_ACCOUNTS: MockAccount[] = [
  {
    uid: 'mock_buyer_1',
    email: 'test@cazi.com',
    password: '123456',
    displayName: 'Test Kullanıcı',
    userType: 'buyer',
  },
  {
    uid: 'mock_seller_1',
    email: 'satici@cazi.com',
    password: '123456',
    displayName: 'Test Satıcı',
    userType: 'seller',
  },
];

class AuthService {
  private currentUser: User | null = null;
  private async getLanguage(): Promise<'tr' | 'en'> {
    const stored = await AsyncStorage.getItem('userLanguage');
    return stored === 'en' ? 'en' : 'tr';
  }

  async signIn(email: string, password: string): Promise<{ user: User; userData: UserData }> {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.status !== 200) {
      const language = await this.getLanguage();
      throw new Error(response.error || (language === 'en' ? 'Sign in failed' : 'Giriş başarısız'));
    }
    
    const rawUserData = response.data;
    this.currentUser = {
      uid: rawUserData.uid,
      email: rawUserData.email,
      displayName: rawUserData.displayName
    };

    const userData: UserData = {
      uid: rawUserData.uid,
      email: rawUserData.email,
      displayName: rawUserData.displayName,
      userType: rawUserData.userType ?? 'buyer',
      createdAt: rawUserData.createdAt ? new Date(rawUserData.createdAt) : new Date()
    };
    
    await AsyncStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    await AsyncStorage.setItem(`user_${this.currentUser.uid}`, JSON.stringify(userData));
    return { user: this.currentUser, userData };
  }

  async signUp(email: string, password: string, displayName: string, userType: 'buyer' | 'seller' | 'both'): Promise<User> {
    const uid = `user_${Date.now()}`;
    const response = await apiClient.post('/auth/register', {
        uid,
        email,
        password,
        displayName,
        userType
    });
    
    if (response.status !== 201) {
      const language = await this.getLanguage();
      throw new Error(response.error || (language === 'en' ? 'Registration failed' : 'Kayıt başarısız'));
    }
    
    const userData = response.data ?? { uid, email, displayName, userType, createdAt: new Date().toISOString() };
    this.currentUser = {
        uid: userData.uid ?? uid,
        email: userData.email ?? email,
        displayName: userData.displayName ?? displayName
    };
    
    await AsyncStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    await AsyncStorage.setItem(`user_${this.currentUser.uid}`, JSON.stringify({
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      displayName: this.currentUser.displayName,
      userType,
      createdAt: userData.createdAt ?? new Date().toISOString(),
    }));
    return this.currentUser;
  }

  async signInWithMockCredentials(email: string, password: string): Promise<{ user: User; userData: UserData } | null> {
    const match = this.getMockAccount(email, password);
    if (!match) {
      return null;
    }

    const language = await this.getLanguage();
    const displayName = language === 'en'
      ? (match.userType === 'seller' ? 'Test Seller' : 'Test User')
      : match.displayName;

    const userData: UserData = {
      uid: match.uid,
      email: match.email,
      displayName,
      userType: match.userType,
      createdAt: new Date(),
    };

    const session: MockSession = {
      uid: match.uid,
      email: match.email,
      displayName,
      userType: match.userType,
    };

    await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    await AsyncStorage.setItem(`user_${match.uid}`, JSON.stringify(userData));

    const user = this.buildMockUser({ ...match, displayName });
    return { user, userData };
  }

  // Firebase tabanlı kayıt gerekiyorsa ayrı bir metot olarak eklenebilir.

  // Çıkış yap
  async signOut(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('auth_user');
      const storedUser = stored ? JSON.parse(stored) : null;
      const uid = this.currentUser?.uid || storedUser?.uid;

      await this.clearMockSession();
      await AsyncStorage.removeItem('auth_user');
      if (uid) {
        await AsyncStorage.removeItem(`user_${uid}`);
      }
    } catch (error: any) {
      console.warn('Sign out warning:', error);
    } finally {
      this.currentUser = null;
    }
  }

  async resetPassword(email: string): Promise<void> {
      // Mocked for local auth
      console.log('Password reset requested for:', email);
  }

  async getUserData(uid: string): Promise<UserData | null> {
    const response = await apiClient.get(`/auth/me/${uid}`);
    if (response.status !== 200 || !response.data) return null;
    
    return {
        ...response.data,
        createdAt: new Date(response.data.createdAt)
    };
  }

  async getMockSession(): Promise<{ user: User; userData: UserData } | null> {
    try {
      const raw = await AsyncStorage.getItem(MOCK_SESSION_KEY);
      if (!raw) {
        return null;
      }
      const session = JSON.parse(raw) as MockSession;
      const userData: UserData = {
        uid: session.uid,
        email: session.email,
        displayName: session.displayName,
        userType: session.userType,
        createdAt: new Date(),
      };

      const user = this.buildMockUser({
        uid: session.uid,
        email: session.email,
        password: '',
        displayName: session.displayName,
        userType: session.userType,
      });

      return { user, userData };
    } catch (error) {
      console.warn('Mock session load failed:', error);
      return null;
    }
  }

  async clearMockSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MOCK_SESSION_KEY);
    } catch (error) {
      console.warn('Mock session clear failed:', error);
    }
  }

  // Mevcut kullanıcı
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async loadStoredUser(): Promise<User | null> {
      const stored = await AsyncStorage.getItem('auth_user');
      if (stored) {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
      }
      return null;
  }

  private getMockAccount(email: string, password: string): MockAccount | null {
    const normalizedEmail = email.trim().toLowerCase();
    const match = MOCK_ACCOUNTS.find(
      account => account.email.toLowerCase() === normalizedEmail && account.password === password
    );
    return match ?? null;
  }

  private buildMockUser(account: MockAccount): User {
    const now = new Date();
    const mockUser = {
      uid: account.uid,
      email: account.email,
      displayName: account.displayName,
      photoURL: null,
      phoneNumber: null,
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: now.toISOString(),
        lastSignInTime: now.toISOString(),
      },
      providerData: [],
      refreshToken: 'mock_refresh_token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock_id_token',
      getIdTokenResult: async () => ({
        token: 'mock_id_token',
        expirationTime: now.toISOString(),
        authTime: now.toISOString(),
        issuedAtTime: now.toISOString(),
        signInProvider: 'password',
        claims: {},
      }),
      reload: async () => {},
      toJSON: () => ({
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
      }),
    };

    return mockUser as unknown as User;
  }
}

export const authService = new AuthService();
export const getUserDataSafe = async (uid: string) => authService.getUserData(uid);
