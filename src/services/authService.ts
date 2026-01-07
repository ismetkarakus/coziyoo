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

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  userType: 'buyer' | 'seller';
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
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful:', userCredential.user.uid);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign in error details:', {
        code: error.code,
        message: error.message,
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
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı verileri alınırken hata:', error);
      return null;
    }
  }

  // Mevcut kullanıcı
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Hata mesajlarını Türkçe'ye çevir
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı. Önce kayıt olun.';
      case 'auth/wrong-password':
        return 'Hatalı şifre. Lütfen şifrenizi kontrol edin.';
      case 'auth/invalid-credential':
        return 'E-posta veya şifre hatalı. Lütfen kontrol edin.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda';
      case 'auth/weak-password':
        return 'Şifre çok zayıf. En az 6 karakter olmalı';
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi formatı';
      case 'auth/too-many-requests':
        return 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin';
      case 'auth/network-request-failed':
        return 'İnternet bağlantınızı kontrol edin';
      default:
        return `Giriş hatası: ${errorCode}. Lütfen tekrar deneyin.`;
    }
  }
}

export const authService = new AuthService();
