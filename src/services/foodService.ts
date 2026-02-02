import { apiClient } from '../api/apiClient';

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
      const response = await apiClient.post('/foods', {
          ...foodData,
          id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          rating: 0,
          reviewCount: 0
      });
      if (response.status !== 201) throw new Error(response.error);
      return response.data.id;
    } catch (error) {
      console.error('Yemek eklenirken hata:', error);
      throw new Error('Yemek eklenemedi');
    }
  }

  // Tüm yemekleri getirme
  async getAllFoods(): Promise<Food[]> {
    try {
      const response = await apiClient.get<any[]>('/foods');
      if (response.status !== 200) return [];
      
      return response.data.map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
      }));
    } catch (error) {
      console.error('Yemekler getirilirken hata:', error);
      return [];
    }
  }

  // Belirli bir satıcının yemeklerini getirme
  async getFoodsBySeller(sellerId: string): Promise<Food[]> {
    try {
      // For now we use the general list and filter, or we could add a route /foods/seller/:id
      const response = await apiClient.get<any[]>('/foods');
      if (response.status !== 200) return [];
      
      return response.data
        .filter(item => item.cookId === sellerId)
        .map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
      }));
    } catch (error) {
      console.error('Satıcı yemekleri getirilirken hata:', error);
      throw new Error('Satıcı yemekleri getirilemedi');
    }
  }

  // Kategoriye göre yemekleri getirme
  async getFoodsByCategory(category: string): Promise<Food[]> {
    try {
      const response = await apiClient.get<any[]>('/foods');
      if (response.status !== 200) return [];
      
      return response.data
        .filter(item => item.category === category && item.isAvailable)
        .map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
      }));
    } catch (error) {
      console.error('Kategori yemekleri getirilirken hata:', error);
      throw new Error('Kategori yemekleri getirilemedi');
    }
  }

  // Tek bir yemek getirme
  async getFoodById(foodId: string): Promise<Food | null> {
    try {
      const response = await apiClient.get(`/foods/${foodId}`);
      if (response.status !== 200) return null;
      
      return {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error('Yemek getirilirken hata:', error);
      throw new Error('Yemek getirilemedi');
    }
  }

  // Sipariş oluşturma
  async createOrder(orderData: Omit<Order, 'id' | 'orderDate'>): Promise<string> {
    try {
      const id = `order_${Date.now()}`;
      const response = await apiClient.post('/orders', {
        ...orderData,
        id,
        orderDate: new Date().toISOString()
      });
      if (response.status !== 201) throw new Error(response.error);
      return response.data.id;
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
      throw new Error('Sipariş oluşturulamadı');
    }
  }

  // Kullanıcının siparişlerini getirme
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get('/orders', { userId, type: 'buyer' });
      if (response.status !== 200) return [];
      
      return response.data.map((item: any) => ({
          ...item,
          orderDate: new Date(item.orderDate),
          estimatedDeliveryTime: item.estimatedDeliveryTime ? new Date(item.estimatedDeliveryTime) : undefined
      }));
    } catch (error) {
      console.error('Siparişler getirilirken hata:', error);
      throw new Error('Siparişler getirilemedi');
    }
  }

  // Satıcının siparişlerini getirme
  async getSellerOrders(sellerId: string): Promise<Order[]> {
    try {
      const response = await apiClient.get('/orders', { userId: sellerId, type: 'seller' });
      if (response.status !== 200) return [];
      
      return response.data.map((item: any) => ({
          ...item,
          orderDate: new Date(item.orderDate),
          estimatedDeliveryTime: item.estimatedDeliveryTime ? new Date(item.estimatedDeliveryTime) : undefined
      }));
    } catch (error) {
      console.error('Satıcı siparişleri getirilirken hata:', error);
      throw new Error('Satıcı siparişleri getirilemedi');
    }
  }

  // Sipariş durumu güncelleme
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const response = await apiClient.put(`/orders/${orderId}/status`, { status });
      if (response.status !== 200) throw new Error(response.error);
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      throw new Error('Sipariş durumu güncellenemedi');
    }
  }

  // Real-time listeners (Mocked for now with immediate call)
  subscribeToFoods(callback: (foods: Food[]) => void): () => void {
    this.getAllFoods().then(callback);
    return () => {};
  }

  subscribeToFood(foodId: string, callback: (food: Food | null) => void): () => void {
    this.getFoodById(foodId).then(callback);
    return () => {};
  }
}

export const foodService = new FoodService();
