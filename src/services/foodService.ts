import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Food {
  id?: string;
  name: string;
  description: string;
  price: number;
  cookName: string;
  cookId: string;
  category: string;
  imageUrl: string;
  ingredients: string[];
  preparationTime: number;
  servingSize: number;
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id?: string;
  foodId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  orderDate: Date;
  estimatedDeliveryTime?: Date;
}

class FoodService {
  // Yemek ekleme (Satıcı)
  async addFood(foodData: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'foods'), {
        ...foodData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Yemek eklenirken hata:', error);
      throw new Error('Yemek eklenemedi');
    }
  }

  // Tüm yemekleri getirme
  async getAllFoods(): Promise<Food[]> {
    try {
      const q = query(
        collection(db, 'foods'),
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const foods: Food[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foods.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Food);
      });
      
      return foods;
    } catch (error) {
      console.error('Yemekler getirilirken hata:', error);
      throw new Error('Yemekler getirilemedi');
    }
  }

  // Belirli bir satıcının yemeklerini getirme
  async getFoodsBySeller(sellerId: string): Promise<Food[]> {
    try {
      const q = query(
        collection(db, 'foods'),
        where('cookId', '==', sellerId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const foods: Food[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foods.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Food);
      });
      
      return foods;
    } catch (error) {
      console.error('Satıcı yemekleri getirilirken hata:', error);
      throw new Error('Satıcı yemekleri getirilemedi');
    }
  }

  // Kategoriye göre yemekleri getirme
  async getFoodsByCategory(category: string): Promise<Food[]> {
    try {
      const q = query(
        collection(db, 'foods'),
        where('category', '==', category),
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const foods: Food[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foods.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Food);
      });
      
      return foods;
    } catch (error) {
      console.error('Kategori yemekleri getirilirken hata:', error);
      throw new Error('Kategori yemekleri getirilemedi');
    }
  }

  // Tek bir yemek getirme
  async getFoodById(foodId: string): Promise<Food | null> {
    try {
      const docRef = doc(db, 'foods', foodId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Food;
      }
      
      return null;
    } catch (error) {
      console.error('Yemek getirilirken hata:', error);
      throw new Error('Yemek getirilemedi');
    }
  }

  // Yemek güncelleme
  async updateFood(foodId: string, updates: Partial<Food>): Promise<void> {
    try {
      const docRef = doc(db, 'foods', foodId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Yemek güncellenirken hata:', error);
      throw new Error('Yemek güncellenemedi');
    }
  }

  // Yemek silme
  async deleteFood(foodId: string): Promise<void> {
    try {
      const docRef = doc(db, 'foods', foodId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Yemek silinirken hata:', error);
      throw new Error('Yemek silinemedi');
    }
  }

  // Sipariş oluşturma
  async createOrder(orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        orderDate: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
      throw new Error('Sipariş oluşturulamadı');
    }
  }

  // Kullanıcının siparişlerini getirme
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('buyerId', '==', userId),
        orderBy('orderDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          orderDate: data.orderDate.toDate(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate()
        } as Order);
      });
      
      return orders;
    } catch (error) {
      console.error('Siparişler getirilirken hata:', error);
      throw new Error('Siparişler getirilemedi');
    }
  }

  // Satıcının siparişlerini getirme
  async getSellerOrders(sellerId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        orderBy('orderDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          orderDate: data.orderDate.toDate(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate()
        } as Order);
      });
      
      return orders;
    } catch (error) {
      console.error('Satıcı siparişleri getirilirken hata:', error);
      throw new Error('Satıcı siparişleri getirilemedi');
    }
  }

  // Sipariş durumu güncelleme
  async updateOrderStatus(orderId: string, status: Order['status'], notificationCallback?: (orderId: string, status: string, buyerName: string, foodName: string) => Promise<void>): Promise<void> {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });

      // Send notification if callback is provided
      if (notificationCallback) {
        // Get order details for notification
        const orderDoc = await getDoc(docRef);
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          await notificationCallback(orderId, status, orderData.buyerName || 'Müşteri', orderData.foodName || 'Yemek');
        }
      }
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      throw new Error('Sipariş durumu güncellenemedi');
    }
  }

  // Stok güncelleme
  async updateFoodStock(foodId: string, newStock: number, lowStockCallback?: (foodName: string, currentStock: number) => Promise<void>): Promise<void> {
    try {
      const docRef = doc(db, 'foods', foodId);
      await updateDoc(docRef, { 
        currentStock: newStock,
        updatedAt: Timestamp.now()
      });

      // Send low stock notification if stock is low (less than 3) and callback is provided
      if (lowStockCallback && newStock > 0 && newStock <= 3) {
        const foodDoc = await getDoc(docRef);
        if (foodDoc.exists()) {
          const foodData = foodDoc.data();
          await lowStockCallback(foodData.name || 'Yemek', newStock);
        }
      }
    } catch (error) {
      console.error('Stok güncellenirken hata:', error);
      throw new Error('Stok güncellenemedi');
    }
  }

  // Stok azaltma (sipariş verildiğinde)
  async decreaseStock(foodId: string, quantity: number): Promise<boolean> {
    try {
      const foodRef = doc(db, 'foods', foodId);
      const foodSnap = await getDoc(foodRef);
      
      if (!foodSnap.exists()) {
        throw new Error('Yemek bulunamadı');
      }

      const currentStock = foodSnap.data().currentStock || 0;
      
      if (currentStock < quantity) {
        return false; // Yetersiz stok
      }

      await updateDoc(foodRef, {
        currentStock: currentStock - quantity,
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error('Stok azaltılırken hata:', error);
      throw new Error('Stok azaltılamadı');
    }
  }

  // Stok artırma (sipariş iptal edildiğinde)
  async increaseStock(foodId: string, quantity: number): Promise<void> {
    try {
      const foodRef = doc(db, 'foods', foodId);
      const foodSnap = await getDoc(foodRef);
      
      if (!foodSnap.exists()) {
        throw new Error('Yemek bulunamadı');
      }

      const currentStock = foodSnap.data().currentStock || 0;

      await updateDoc(foodRef, {
        currentStock: currentStock + quantity,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Stok artırılırken hata:', error);
      throw new Error('Stok artırılamadı');
    }
  }

  // Gerçek zamanlı yemek dinleyicisi
  subscribeToFoods(callback: (foods: Food[]) => void): () => void {
    const q = query(
      collection(db, 'foods'),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const foods: Food[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foods.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Food);
      });
      callback(foods);
    });
  }

  // Belirli bir yemek için gerçek zamanlı dinleyici
  subscribeToFood(foodId: string, callback: (food: Food | null) => void): () => void {
    const docRef = doc(db, 'foods', foodId);

    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const food: Food = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Food;
        callback(food);
      } else {
        callback(null);
      }
    });
  }
}

export const foodService = new FoodService();
