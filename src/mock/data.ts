import users from './users.json';
import foods from './foods.json';
import orders from './orders.json';
import chats from './chats.json';
import messages from './messages.json';
import reviews from './reviews.json';

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  userType: 'buyer' | 'seller' | 'both';
  password: string;
  allergicTo?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MockFood {
  id: string;
  name: string;
  price: number;
  cookName: string;
  sellerName?: string;
  sellerId?: string;
  cookDescription?: string;
  cookId?: string;
  category: string;
  rating: number;
  reviewCount?: number;
  cardSummary?: string;
  description?: string;
  recipe?: string;
  country?: string;
  imageUrl?: string;
  images?: string[];
  ingredients?: string[];
  deliveryOptions?: {
    pickup: boolean;
    delivery: boolean;
  };
  preparationTime?: number;
  servingSize?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  distance?: string;
  hasPickup?: boolean;
  hasDelivery?: boolean;
  availableDeliveryOptions?: ('pickup' | 'delivery')[];
  availableDates?: string;
  currentStock?: number;
  dailyStock?: number;
  maxDeliveryDistance?: number;
  allergens?: string[];
  hygieneRating?: string;
  deliveryFee?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MockOrder {
  id: string;
  foodId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  orderDate: string;
  estimatedDeliveryTime?: string;
}

export interface MockChat {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  orderId?: string;
  foodId?: string;
  foodName?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSender: string;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface MockMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'buyer' | 'seller';
  message: string;
  messageType: 'text' | 'image' | 'order_update';
  timestamp: string;
  isRead: boolean;
  orderData?: Record<string, unknown>;
}

export interface MockReview {
  id: string;
  foodId: string;
  foodName: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerName: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
  helpfulCount: number;
  reportCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockUsers = users as MockUser[];
export const mockFoods = foods as MockFood[];
export const mockOrders = orders as MockOrder[];
export const mockChats = chats as MockChat[];
export const mockMessages = messages as MockMessage[];
export const mockReviews = reviews as MockReview[];

export const mockData = {
  users: mockUsers,
  foods: mockFoods,
  orders: mockOrders,
  chats: mockChats,
  messages: mockMessages,
  reviews: mockReviews
};
