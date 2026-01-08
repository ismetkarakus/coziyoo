import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import NetInfo from '@react-native-community/netinfo';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  userType: 'buyer' | 'seller' | 'both';
  createdAt: Date;
}

class AuthService {
  // Kullanıcı girişi
  async signIn(email: string, password: string): Promise<User> {
    console.log('🔐 Attempting sign in with:', email);
    console.log('🔐 Auth object:', {
      hasAuth: !!auth,
      currentUser: auth?.currentUser,
      app: auth?.app?.name
    });
    
    try {
      // Auth durumunu kontrol et
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      // Email ve şifre validasyonu
      if (!email || !email.trim()) {
        throw new Error('E-posta adresi gerekli');
      }
      if (!password || password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalı');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('✅ Sign in successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign in error details:', {
        code: error.code,
        message: error.message,
        email: email,
        stack: error.stack
      });
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Kullanıcı kaydı
  async signUp(
    email: string, 
    password: string, 
    displayName: string, 
    userType: 'buyer' | 'seller'
  ): Promise<User> {
    try {
      // Firebase Auth'da kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Profil güncelle
      await updateProfile(user, { displayName });

      // Firestore'da kullanıcı verilerini kaydet
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName,
        userType,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Çıkış yap
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Çıkış yapılırken bir hata oluştu');
    }
  }

  // Şifre sıfırlama
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Kullanıcı verilerini getir
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      console.log('🔍 Fetching user data for:', uid);
      
      // Network durumunu kontrol et
      const netState = await NetInfo.fetch();
      const isConnected = netState.isConnected && netState.isInternetReachable;
      
      if (!isConnected) {
        console.warn('📱 Device is offline, returning mock data');
        return this.getMockUserData(uid);
      }
      
      // Firebase offline durumunu kontrol et
      try {
        const userDoc = await Promise.race([
          getDoc(doc(db, 'users', uid)),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 3000)
          )
        ]) as any;
        
        if (userDoc.exists()) {
          console.log('✅ User data found:', userDoc.data());
          return userDoc.data() as UserData;
        } else {
          console.log('❌ User document does not exist, creating mock data');
          return this.getMockUserData(uid);
        }
      } catch (timeoutError) {
        console.warn('⏰ Firebase request timeout, using mock data');
        return this.getMockUserData(uid);
      }
      
    } catch (error: any) {
      console.warn('⚠️ Firebase error, using mock data:', {
        code: error.code,
        message: error.message,
        uid: uid,
        isOnline: navigator.onLine
      });
      
      return this.getMockUserData(uid);
    }
  }

  // Mock kullanıcı verisi oluştur
  private getMockUserData(uid: string): UserData {
    return {
      uid: uid,
      email: 'test@cazi.com',
      displayName: 'Test Kullanıcı',
      userType: 'buyer',
      createdAt: new Date()
    };
  }

  // Mevcut kullanıcı
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Hata mesajlarını Türkçe'ye çevir
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '❌ Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.\n\n💡 Çözüm: Önce "Kayıt Ol" butonuna tıklayın.';
      case 'auth/wrong-password':
        return '❌ Hatalı şifre girdiniz.\n\n💡 Çözüm: Şifrenizi kontrol edin veya "Şifremi Unuttum" kullanın.';
      case 'auth/invalid-credential':
        return '❌ E-posta veya şifre hatalı!\n\n💡 Çözüm:\n• E-posta: test@cazi.com\n• Şifre: 123456\n\nVeya yeni hesap oluşturun.';
      case 'auth/email-already-in-use':
        return '❌ Bu e-posta adresi zaten kullanımda.\n\n💡 Çözüm: "Giriş Yap" butonunu kullanın.';
      case 'auth/weak-password':
        return '❌ Şifre çok zayıf.\n\n💡 Çözüm: En az 6 karakter kullanın.';
      case 'auth/invalid-email':
        return '❌ Geçersiz e-posta formatı.\n\n💡 Çözüm: Örnek: kullanici@email.com';
      case 'auth/too-many-requests':
        return '❌ Çok fazla hatalı deneme!\n\n💡 Çözüm: 5 dakika bekleyin ve tekrar deneyin.';
      case 'auth/network-request-failed':
        return '❌ İnternet bağlantı sorunu.\n\n💡 Çözüm: WiFi/mobil veri bağlantınızı kontrol edin.';
      case 'auth/configuration-not-found':
        return '❌ Firebase yapılandırma hatası.\n\n💡 Çözüm: Geliştirici ile iletişime geçin.';
      default:
        return `❌ Beklenmeyen hata: ${errorCode}\n\n💡 Çözüm: Uygulamayı yeniden başlatın veya geliştirici ile iletişime geçin.`;
    }
  }
}

export const authService = new AuthService();
