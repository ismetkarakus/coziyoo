import { apiClient } from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = any;

export interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  displayName: string;
  username?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  avatarUri?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  allergicTo?: string[];
  paymentCards?: Array<Record<string, unknown>>;
  sellerNickname?: string;
  sellerLocation?: string;
  sellerAddress?: string;
  sellerDescription?: string;
  sellerDeliveryDistance?: string;
  sellerSpecialties?: string[];
  identityFrontImage?: string;
  identityBackImage?: string;
  identityStatus?: string;
  identitySubmittedAt?: string;
  identityVerifiedAt?: string;
  identityRejectionReason?: string;
  bankName?: string;
  bankAccountHolderName?: string;
  bankIban?: string;
  bankAccountNumber?: string;
  complianceCouncilRegistered?: boolean;
  complianceHygieneCertificate?: boolean;
  complianceAllergensDeclared?: boolean;
  complianceHygieneRating?: boolean;
  complianceInsurance?: boolean;
  complianceTermsAccepted?: boolean;
  complianceApproved?: boolean;
  complianceData?: Record<string, unknown>;
  userType: 'buyer' | 'seller' | 'both';
  createdAt: Date;
}

export interface UserProfileUpdates {
  email?: string;
  fullName?: string;
  displayName?: string;
  username?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  avatarUri?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
  allergicTo?: string[];
  paymentCards?: Array<Record<string, unknown>>;
  sellerNickname?: string;
  sellerLocation?: string;
  sellerAddress?: string;
  sellerDescription?: string;
  sellerDeliveryDistance?: string;
  sellerSpecialties?: string[];
  identityFrontImage?: string;
  identityBackImage?: string;
  identityStatus?: string;
  identitySubmittedAt?: string | null;
  identityVerifiedAt?: string | null;
  identityRejectionReason?: string | null;
  bankName?: string;
  bankAccountHolderName?: string;
  bankIban?: string;
  bankAccountNumber?: string;
  complianceCouncilRegistered?: boolean;
  complianceHygieneCertificate?: boolean;
  complianceAllergensDeclared?: boolean;
  complianceHygieneRating?: boolean;
  complianceInsurance?: boolean;
  complianceTermsAccepted?: boolean;
  complianceApproved?: boolean;
  complianceData?: Record<string, unknown>;
}

interface MockAccount {
  uid: string;
  email: string;
  password: string;
  displayName: string;
  username?: string;
  userType: 'buyer' | 'seller' | 'both';
}

interface MockSession {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  userType: 'buyer' | 'seller' | 'both';
}

const MOCK_SESSION_KEY = 'mock_session';
const MOCK_ACCOUNTS: MockAccount[] = [];

class AuthService {
  private currentUser: User | null = null;
  private async getLanguage(): Promise<'tr' | 'en'> {
    const stored = await AsyncStorage.getItem('userLanguage');
    return stored === 'en' ? 'en' : 'tr';
  }

  private parseJsonField<T>(value: unknown, fallback: T): T {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value !== 'string') return value as T;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private parseBooleanField(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true';
    return false;
  }

  private normalizeUserData(rawUserData: any): UserData {
    return {
      uid: rawUserData.uid,
      email: rawUserData.email,
      fullName: rawUserData.fullName || undefined,
      displayName: rawUserData.displayName || rawUserData.fullName || '',
      username: rawUserData.username || undefined,
      phone: rawUserData.phone || undefined,
      birthDate: rawUserData.birthDate || undefined,
      gender: rawUserData.gender || undefined,
      avatarUri: rawUserData.avatarUri || undefined,
      addressLine1: rawUserData.addressLine1 || undefined,
      city: rawUserData.city || undefined,
      postcode: rawUserData.postcode || undefined,
      allergicTo: this.parseJsonField(rawUserData.allergicTo, [] as string[]),
      paymentCards: this.parseJsonField(rawUserData.paymentCards, [] as Array<Record<string, unknown>>),
      sellerNickname: rawUserData.sellerNickname || undefined,
      sellerLocation: rawUserData.sellerLocation || undefined,
      sellerAddress: rawUserData.sellerAddress || undefined,
      sellerDescription: rawUserData.sellerDescription || undefined,
      sellerDeliveryDistance: rawUserData.sellerDeliveryDistance || undefined,
      sellerSpecialties: this.parseJsonField(rawUserData.sellerSpecialties, [] as string[]),
      identityFrontImage: rawUserData.identityFrontImage || undefined,
      identityBackImage: rawUserData.identityBackImage || undefined,
      identityStatus: rawUserData.identityStatus || undefined,
      identitySubmittedAt: rawUserData.identitySubmittedAt || undefined,
      identityVerifiedAt: rawUserData.identityVerifiedAt || undefined,
      identityRejectionReason: rawUserData.identityRejectionReason || undefined,
      bankName: rawUserData.bankName || undefined,
      bankAccountHolderName: rawUserData.bankAccountHolderName || undefined,
      bankIban: rawUserData.bankIban || undefined,
      bankAccountNumber: rawUserData.bankAccountNumber || undefined,
      complianceCouncilRegistered: this.parseBooleanField(rawUserData.complianceCouncilRegistered),
      complianceHygieneCertificate: this.parseBooleanField(rawUserData.complianceHygieneCertificate),
      complianceAllergensDeclared: this.parseBooleanField(rawUserData.complianceAllergensDeclared),
      complianceHygieneRating: this.parseBooleanField(rawUserData.complianceHygieneRating),
      complianceInsurance: this.parseBooleanField(rawUserData.complianceInsurance),
      complianceTermsAccepted: this.parseBooleanField(rawUserData.complianceTermsAccepted),
      complianceApproved: this.parseBooleanField(rawUserData.complianceApproved),
      complianceData: this.parseJsonField(rawUserData.complianceData, {} as Record<string, unknown>),
      userType: rawUserData.userType ?? 'buyer',
      createdAt: rawUserData.createdAt ? new Date(rawUserData.createdAt) : new Date(),
    };
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
      displayName: rawUserData.displayName || rawUserData.fullName || ''
    };

    const userData = this.normalizeUserData(rawUserData);
    
    await AsyncStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    await AsyncStorage.setItem(`user_${this.currentUser.uid}`, JSON.stringify(userData));
    return { user: this.currentUser, userData };
  }

  async signUp(
    email: string,
    password: string,
    fullName: string,
    userType: 'buyer' | 'seller' | 'both',
    displayName?: string
  ): Promise<User> {
    const uid = `user_${Date.now()}`;
    const resolvedDisplayName = (displayName || fullName).trim();
    const resolvedFullName = fullName.trim();
    const response = await apiClient.post('/auth/register', {
        uid,
        email,
        password,
        fullName: resolvedFullName,
        displayName: resolvedDisplayName,
        userType
    });
    
    if (response.status !== 201) {
      const language = await this.getLanguage();
      throw new Error(response.error || (language === 'en' ? 'Registration failed' : 'Kayıt başarısız'));
    }
    
    const userData = response.data ?? {
      uid,
      email,
      fullName: resolvedFullName,
      displayName: resolvedDisplayName,
      userType,
      createdAt: new Date().toISOString(),
    };
    this.currentUser = {
        uid: userData.uid ?? uid,
        email: userData.email ?? email,
        displayName: userData.displayName ?? resolvedDisplayName
    };
    
    await AsyncStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    await AsyncStorage.setItem(`user_${this.currentUser.uid}`, JSON.stringify({
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      fullName: userData.fullName ?? resolvedFullName,
      displayName: this.currentUser.displayName,
      userType,
      createdAt: userData.createdAt ?? new Date().toISOString(),
    }));
    return this.currentUser;
  }

  async signInWithMockCredentials(email: string, password: string): Promise<{ user: User; userData: UserData } | null> {
    const match = this.getMockAccount(email, password);
    if (!match) return null;

    const language = await this.getLanguage();
    const displayName = language === 'en'
      ? (match.userType === 'seller' ? 'Test Seller' : 'Test User')
      : match.displayName;

    const userData: UserData = {
      uid: match.uid,
      email: match.email,
      displayName,
      username: match.username,
      userType: match.userType,
      createdAt: new Date(),
    };

    const session: MockSession = {
      uid: match.uid,
      email: match.email,
      displayName,
      username: match.username,
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

    return this.normalizeUserData(response.data);
  }

  async updateProfile(uid: string, updates: UserProfileUpdates): Promise<UserData> {
    const payload: Record<string, unknown> = { ...updates };
    if (Array.isArray(payload.paymentCards)) {
      payload.paymentCards = JSON.stringify(payload.paymentCards);
    }
    if (Array.isArray(payload.allergicTo)) {
      payload.allergicTo = JSON.stringify(payload.allergicTo);
    }
    if (Array.isArray(payload.sellerSpecialties)) {
      payload.sellerSpecialties = JSON.stringify(payload.sellerSpecialties);
    }
    if (payload.complianceData && typeof payload.complianceData === 'object') {
      payload.complianceData = JSON.stringify(payload.complianceData);
    }

    const response = await apiClient.put(`/auth/me/${uid}`, payload);
    if (response.status !== 200 || !response.data) {
      const language = await this.getLanguage();
      throw new Error(response.error || (language === 'en' ? 'Profile update failed' : 'Profil güncellenemedi'));
    }

    const userData = this.normalizeUserData(response.data);

    if (this.currentUser?.uid === uid) {
      this.currentUser = {
        ...this.currentUser,
        email: userData.email,
        displayName: userData.displayName,
      };
      await AsyncStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    }

    await AsyncStorage.setItem(`user_${uid}`, JSON.stringify(userData));
    return userData;
  }

  async getMockSession(): Promise<{ user: User; userData: UserData } | null> {
    if (MOCK_ACCOUNTS.length === 0) return null;
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
        username: session.username,
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
    if (MOCK_ACCOUNTS.length === 0) return null;
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
