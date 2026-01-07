import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

// ==================== AUTH SERVICES ====================

export const authServices = {
  // Kullanıcı kayıt
  register: async (email: string, password: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı giriş
  login: async (email: string, password: string) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Çıkış yap
  logout: async () => {
    try {
      await auth().signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Mevcut kullanıcıyı al
  getCurrentUser: () => {
    return auth().currentUser;
  }
};

// ==================== USER PROFILE SERVICES ====================

export const userService = {
  // Kullanıcı profili oluştur
  createProfile: async (userId: string, profileData: any) => {
    try {
      await firestore().collection('users').add({
        userId,
        ...profileData,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı profilini al
  getProfile: async (userId: string) => {
    try {
      const querySnapshot = await firestore()
        .collection('users')
        .where('userId', '==', userId)
        .get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { success: true, data: { id: doc.id, ...doc.data() } };
      } else {
        return { success: false, error: 'Profil bulunamadı' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcı profilini güncelle
  updateProfile: async (profileId: string, updates: any) => {
    try {
      await firestore().collection('users').doc(profileId).update({
        ...updates,
        updatedAt: firestore.Timestamp.now()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// ==================== MEAL SERVICES ====================

export const mealService = {
  // Yemek ekle
  addMeal: async (mealData: any) => {
    try {
      const docRef = await firestore().collection('meals').add({
        ...mealData,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Tüm yemekleri al
  getAllMeals: async () => {
    try {
      const querySnapshot = await firestore()
        .collection('meals')
        .orderBy('createdAt', 'desc')
        .get();
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
      const querySnapshot = await firestore()
        .collection('meals')
        .where('sellerId', '==', sellerId)
        .orderBy('createdAt', 'desc')
        .get();
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
      await firestore().collection('meals').doc(mealId).update({
        ...updates,
        updatedAt: firestore.Timestamp.now()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Yemek sil
  deleteMeal: async (mealId: string) => {
    try {
      await firestore().collection('meals').doc(mealId).delete();
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
      const docRef = await firestore().collection('orders').add({
        ...orderData,
        createdAt: firestore.Timestamp.now(),
        updatedAt: firestore.Timestamp.now()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Kullanıcının siparişlerini al
  getUserOrders: async (userId: string) => {
    try {
      const querySnapshot = await firestore()
        .collection('orders')
        .where('buyerId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
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
      const querySnapshot = await firestore()
        .collection('orders')
        .where('sellerId', '==', sellerId)
        .orderBy('createdAt', 'desc')
        .get();
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
      await firestore().collection('orders').doc(orderId).update({
        status,
        updatedAt: firestore.Timestamp.now()
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
      const reference = storage().ref(path);
      await reference.putFile(uri);
      const downloadURL = await reference.getDownloadURL();
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
    return firestore()
      .collection('meals')
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const meals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(meals);
      });
  },

  // Siparişleri gerçek zamanlı dinle
  listenToOrders: (userId: string, callback: (orders: any[]) => void) => {
    return firestore()
      .collection('orders')
      .where('buyerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const orders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(orders);
      });
  }
};
