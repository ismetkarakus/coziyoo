import { apiClient } from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  userType: 'buyer' | 'seller' | 'both';
  createdAt: Date;
}

// Mock User object to satisfy components expecting a Firebase-like User object
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class AuthService {
  private currentUser: User | null = null;

  async signIn(email: string, password: string): Promise<User> {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.status !== 200) throw new Error(response.error || 'Giriş başarısız');
    
    const userData = response.data;
    this.currentUser = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName
    };
    
    await AsyncStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    return this.currentUser;
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
    
    if (response.status !== 201) throw new Error(response.error || 'Kayıt başarısız');
    
    const userData = response.data;
    this.currentUser = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName
    };
    
    await AsyncStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem('auth_user');
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
}

export const authService = new AuthService();
export const getUserDataSafe = async (uid: string) => authService.getUserData(uid);
