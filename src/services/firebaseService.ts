import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// ==================== AUTH SERVICES ====================

export const authServices = {
  // Kullanıcı kayıt
  register: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı giriş
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Çıkış yap
  logout: async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Mevcut kullanıcıyı al
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

// ==================== USER PROFILE SERVICES ====================

export const userService = {
  // Kullanıcı profili oluştur
  createProfile: async (userId: string, profileData: any) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        userId,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı profilini al
  getProfile: async (userId: string) => {
    try {
      const docSnapshot = await getDoc(doc(db, 'users', userId));

      if (!docSnapshot.exists()) {
        return { success: false, error: 'Profil bulunamadı' };
      }

      return { success: true, data: { id: docSnapshot.id, ...docSnapshot.data() } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı profilini güncelle
  updateProfile: async (profileId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'users', profileId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== FOOD SERVICES ====================

export const mealService = {
  // Yemek ekle
  addMeal: async (mealData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'foods'), {
        ...mealData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Tüm yemekleri al
  getAllMeals: async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'foods'), orderBy('createdAt', 'desc'))
      );
      const meals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: meals };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Satıcıya göre yemekleri al
  getMealsBySeller: async (sellerId: string) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'foods'),
          where('sellerId', '==', sellerId),
          orderBy('createdAt', 'desc')
        )
      );
      const meals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: meals };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Yemek güncelle
  updateMeal: async (mealId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'foods', mealId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Yemek sil
  deleteMeal: async (mealId: string) => {
    try {
      await deleteDoc(doc(db, 'foods', mealId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== ORDER SERVICES ====================

export const orderService = {
  // Sipariş oluştur
  createOrder: async (orderData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcının siparişlerini al
  getUserOrders: async (userId: string) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'orders'),
          where('buyerId', '==', userId),
          orderBy('createdAt', 'desc')
        )
      );
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: orders };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Satıcının siparişlerini al
  getSellerOrders: async (sellerId: string) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'orders'),
          where('sellerId', '==', sellerId),
          orderBy('createdAt', 'desc')
        )
      );
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: orders };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Sipariş durumunu güncelle
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== STORAGE SERVICES ====================

export const storageServices = {
  // Resim yükle
  uploadImage: async (uri: string, path: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reference = ref(storage, path);
      await uploadBytes(reference, blob);
      const downloadURL = await getDownloadURL(reference);
      return { success: true, url: downloadURL };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== REAL-TIME LISTENERS ====================

export const realtimeService = {
  // Yemekleri gerçek zamanlı dinle
  listenToMeals: (callback: (meals: any[]) => void) => {
    return onSnapshot(
      query(collection(db, 'foods'), orderBy('createdAt', 'desc')),
      (querySnapshot) => {
        const meals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(meals);
      }
    );
  },

  // Siparişleri gerçek zamanlı dinle
  listenToOrders: (userId: string, callback: (orders: any[]) => void) => {
    return onSnapshot(
      query(
        collection(db, 'orders'),
        where('buyerId', '==', userId),
        orderBy('createdAt', 'desc')
      ),
      (querySnapshot) => {
        const orders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(orders);
      }
    );
  }
};
