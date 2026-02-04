import { apiClient } from '../api/apiClient';

export interface ChatMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'buyer' | 'seller';
  message: string;
  messageType: 'text' | 'image' | 'order_update';
  timestamp: Date;
  isRead: boolean;
  orderData?: {
    orderId: string;
    status: string;
    foodName: string;
  };
}

export interface Chat {
  id?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  orderId?: string;
  foodId?: string;
  foodName?: string;
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender: string;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  isActive: boolean;
  createdAt: Date;
}

class ChatService {
  async getOrCreateChat(buyerId: string, buyerName: string, sellerId: string, sellerName: string, orderId?: string, foodId?: string, foodName?: string): Promise<string> {
    try {
      const id = `chat_${Date.now()}`;
      const response = await apiClient.post('/chats', {
          id, buyerId, buyerName, sellerId, sellerName, orderId, foodId, foodName,
          lastMessage: '', lastMessageTime: new Date().toISOString(), lastMessageSender: '',
          buyerUnreadCount: 0, sellerUnreadCount: 0, isActive: true, createdAt: new Date().toISOString()
      });
      if (response.status !== 200 && response.status !== 201) throw new Error(response.error || 'Chat oluşturulamadı');
      return response.data?.id || id;
    } catch (error) {
      console.error('Chat oluşturma hatası:', error);
      throw new Error('Chat oluşturulamadı');
    }
  }

  async sendMessage(chatId: string, senderId: string, senderName: string, senderType: 'buyer' | 'seller', message: string, messageType: 'text' | 'image' | 'order_update' = 'text', orderData?: ChatMessage['orderData']): Promise<string> {
    try {
      const id = `msg_${Date.now()}`;
      const messageData = {
          id, chatId, senderId, senderName, senderType, message, messageType,
          timestamp: new Date().toISOString(), isRead: false, orderData
      };
      const response = await apiClient.post(`/chats/${chatId}/messages`, messageData);
      if (response.status !== 201) throw new Error(response.error || 'Mesaj gönderilemedi');
      return id;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw new Error('Mesaj gönderilemedi');
    }
  }

  async getUserChats(userId: string, userType: 'buyer' | 'seller'): Promise<Chat[]> {
    try {
      const response = await apiClient.get('/chats', { userId });
      if (response.status !== 200 || !response.data) return [];
      
      return response.data.map((item: any) => ({
          ...item,
          lastMessageTime: new Date(item.lastMessageTime),
          createdAt: new Date(item.createdAt)
      }));
    } catch (error) {
      console.error('Chatleri getirme hatası:', error);
      return [];
    }
  }

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get(`/chats/${chatId}/messages`);
      if (response.status !== 200 || !response.data) return [];
      
      return response.data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Mesajları getirme hatası:', error);
      return [];
    }
  }

  // Real-time listener simülasyonu
  onMessagesUpdate(chatId: string, callback: (messages: ChatMessage[]) => void) {
    this.getChatMessages(chatId).then(callback);
    return () => {};
  }

  onChatsUpdate(userId: string, userType: 'buyer' | 'seller', callback: (chats: Chat[]) => void) {
    this.getUserChats(userId, userType).then(callback);
    return () => {};
  }

  async markMessagesAsRead(chatId: string, userId: string, userType: 'buyer' | 'seller'): Promise<void> {
      // Mock implementation for local DB
      console.log('Marking as read:', chatId);
  }

  async sendOrderUpdateMessage(
    chatId: string,
    orderId: string,
    status: string,
    foodName: string,
    senderId: string,
    senderName: string,
    senderType: 'buyer' | 'seller'
  ): Promise<string> {
    const message = `${foodName} sipariş durumu: ${status}`;
    return this.sendMessage(chatId, senderId, senderName, senderType, message, 'order_update', {
      orderId,
      status,
      foodName,
    });
  }
}

export const chatService = new ChatService();
