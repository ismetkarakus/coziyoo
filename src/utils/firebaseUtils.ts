// Firebase Utilities - Online/Offline yönetimi
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../config/firebase';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export class FirebaseUtils {
  private static isOnline = true;

  // Firebase'i online yap
  static async forceOnline(): Promise<boolean> {
    try {
      console.log('🔄 Forcing Firebase online...');
      
      // Önce offline yap, sonra online yap (reset)
      await disableNetwork(db);
      console.log('📴 Firebase disabled');
      
      // Kısa bekle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Online yap
      await enableNetwork(db);
      console.log('📶 Firebase enabled');
      
      this.isOnline = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to force Firebase online:', error);
      return false;
    }
  }

  // Firebase durumunu kontrol et
  static async checkConnection(): Promise<boolean> {
    try {
      // Basit bir test query
      const { doc, getDoc } = await import('firebase/firestore');
      const testDoc = doc(db, 'test', 'connection');
      
      const result = await Promise.race([
        getDoc(testDoc),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 3000)
        )
      ]);
      
      console.log('✅ Firebase connection test passed');
      this.isOnline = true;
      return true;
    } catch (error) {
      console.warn('⚠️ Firebase connection test failed:', error);
      this.isOnline = false;
      return false;
    }
  }

  // Online durumunu getir
  static getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Cache'i temizle ve yeniden bağlan
  static async resetConnection(): Promise<void> {
    try {
      console.log('🔄 Resetting Firebase connection...');
      
      // Network durumunu kontrol et
      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected && netState.isInternetReachable;
      
      if (!isConnected) {
        console.warn('📱 Device is offline, cannot reset Firebase connection');
        throw new Error('Cihaz offline durumda. İnternet bağlantınızı kontrol edin.');
      }
      
      // Web için cache temizle
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(window.localStorage);
        keys.forEach(key => {
          if (key.includes('firebase') || key.includes('firestore')) {
            window.localStorage.removeItem(key);
          }
        });
        console.log('🗑️ Firebase cache cleared');
      }
      
      // Bağlantıyı reset et
      await this.forceOnline();
      
    } catch (error) {
      console.error('❌ Failed to reset Firebase connection:', error);
      throw error;
    }
  }
}
