import { apiClient } from '../api/apiClient';

export interface Food {
  id?: string;
  name: string;
  cardSummary?: string;
  description: string;
  price: number;
  cookName: string;
  cookId: string;
  category: string;
  imageUrl: string;
  recipe?: string;
  ingredients: string[];
  preparationTime: number;
  servingSize: number;
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  sellerId?: string;
  sellerName?: string;
  country?: string;
  images?: string[];
  hasPickup?: boolean;
  hasDelivery?: boolean;
  availableDeliveryOptions?: ('pickup' | 'delivery')[];
  availableDates?: string;
  currentStock?: number;
  dailyStock?: number;
  deliveryFee?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  allergens?: string[];
  distance?: string;
  prepTime?: string;
  cookDescription?: string;
  favoriteCount?: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export interface Order {
  id?: string;
  foodId: string;
  foodName?: string;
  cookName?: string;
  cookId?: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  quantity: number;
  price?: number;
  totalPrice: number;
  deliveryType?: string;
  requestedDate?: string;
  requestedTime?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'seller_approved' | 'pending_seller_approval' | 'pending_buyer_approval' | 'rejected' | 'completed';
  trackingStatus?: string;
  deliveryAddress: string;
  paymentCompleted?: boolean;
  buyerApprovedAt?: Date;
  sellerApprovedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
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
      if (response.status !== 201 || !response.data) throw new Error(response.error || 'Yemek eklenemedi');
      return response.data.id;
    } catch (error) {
      console.error('Yemek eklenirken hata:', error);
      throw new Error('Yemek eklenemedi');
    }
  }

  async updateFood(foodId: string, updates: Partial<Food>): Promise<void> {
    try {
      const response = await apiClient.put(`/foods/${foodId}`, {
        ...updates,
        createdAt: updates.createdAt instanceof Date ? updates.createdAt.toISOString() : updates.createdAt,
        updatedAt: updates.updatedAt instanceof Date ? updates.updatedAt.toISOString() : updates.updatedAt,
      });
      if (response.status !== 200) throw new Error(response.error || 'Food update failed');
    } catch (error) {
      console.error('Yemek güncellenirken hata:', error);
      throw new Error('Yemek güncellenemedi');
    }
  }

  async deleteFood(foodId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/foods/${foodId}`);
      if (response.status !== 200) throw new Error(response.error || 'Food delete failed');
    } catch (error) {
      console.error('Yemek silinirken hata:', error);
      throw new Error('Yemek silinemedi');
    }
  }

  // Tüm yemekleri getirme
  async getAllFoods(): Promise<Food[]> {
    try {
      const response = await apiClient.get<any[]>('/foods');
      if (response.status !== 200 || !response.data) return [];
      
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
      if (response.status !== 200 || !response.data) return [];
      
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
      if (response.status !== 200 || !response.data) return [];
      
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
      if (response.status !== 200 || !response.data) return null;
      
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
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentCompleted: orderData.paymentCompleted ? 1 : 0,
        buyerApprovedAt: orderData.buyerApprovedAt ? orderData.buyerApprovedAt.toISOString() : null,
        sellerApprovedAt: orderData.sellerApprovedAt ? orderData.sellerApprovedAt.toISOString() : null,
      });
      if (response.status !== 201 || !response.data) throw new Error(response.error || 'Sipariş oluşturulamadı');
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
      if (response.status !== 200 || !response.data) return [];
      
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
      if (response.status !== 200 || !response.data) return [];
      
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

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      const response = await apiClient.put(`/orders/${orderId}`, {
        ...updates,
        paymentCompleted:
          typeof updates.paymentCompleted === 'boolean'
            ? (updates.paymentCompleted ? 1 : 0)
            : undefined,
        buyerApprovedAt: updates.buyerApprovedAt ? updates.buyerApprovedAt.toISOString() : updates.buyerApprovedAt,
        sellerApprovedAt: updates.sellerApprovedAt ? updates.sellerApprovedAt.toISOString() : updates.sellerApprovedAt,
        createdAt: updates.createdAt ? updates.createdAt.toISOString() : updates.createdAt,
        updatedAt: updates.updatedAt ? updates.updatedAt.toISOString() : updates.updatedAt,
      });
      if (response.status !== 200) throw new Error(response.error || 'Order update failed');
    } catch (error) {
      console.error('Order update error:', error);
      throw new Error('Order update failed');
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

  async decreaseStock(foodId: string, quantity: number): Promise<boolean> {
    try {
      // Mock implementation: always succeed
      console.log(`Mock stock decrease for ${foodId}: ${quantity}`);
      return true;
    } catch (error) {
      console.error('Stock decrease error:', error);
      return false;
    }
  }
}

export const foodService = new FoodService();
