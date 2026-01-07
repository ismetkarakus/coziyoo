import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

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
  // Chat oluşturma veya mevcut chat'i getirme
  async getOrCreateChat(
    buyerId: string, 
    buyerName: string, 
    sellerId: string, 
    sellerName: string,
    orderId?: string,
    foodId?: string,
    foodName?: string
  ): Promise<string> {
    try {
      // Önce mevcut chat var mı kontrol et
      const q = query(
        collection(db, 'chats'),
        where('buyerId', '==', buyerId),
        where('sellerId', '==', sellerId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Mevcut chat varsa ID'sini döndür
        return querySnapshot.docs[0].id;
      }
      
      // Yeni chat oluştur
      const chatData = {
        buyerId,
        buyerName,
        sellerId,
        sellerName,
        orderId: orderId || null,
        foodId: foodId || null,
        foodName: foodName || null,
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageSender: '',
        buyerUnreadCount: 0,
        sellerUnreadCount: 0,
        isActive: true,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      throw new Error('Chat oluşturulamadı');
    }
  }

  // Mesaj gönderme
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderType: 'buyer' | 'seller',
    message: string,
    messageType: 'text' | 'image' | 'order_update' = 'text',
    orderData?: ChatMessage['orderData']
  ): Promise<string> {
    try {
      // Mesajı ekle
      const messageData = {
        chatId,
        senderId,
        senderName,
        senderType,
        message,
        messageType,
        timestamp: serverTimestamp(),
        isRead: false,
        orderData: orderData || null
      };
      
      const messageRef = await addDoc(collection(db, 'messages'), messageData);
      
      // Chat'i güncelle
      const chatRef = doc(db, 'chats', chatId);
      const updateData: any = {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderId
      };
      
      // Okunmamış mesaj sayısını artır
      if (senderType === 'buyer') {
        updateData.sellerUnreadCount = await this.incrementUnreadCount(chatId, 'seller');
      } else {
        updateData.buyerUnreadCount = await this.incrementUnreadCount(chatId, 'buyer');
      }
      
      await updateDoc(chatRef, updateData);
      
      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Mesaj gönderilemedi');
    }
  }

  // Okunmamış mesaj sayısını artırma
  private async incrementUnreadCount(chatId: string, userType: 'buyer' | 'seller'): Promise<number> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        const currentCount = userType === 'buyer' ? 
          (data.buyerUnreadCount || 0) : 
          (data.sellerUnreadCount || 0);
        return currentCount + 1;
      }
      
      return 1;
    } catch (error) {
      console.error('Error incrementing unread count:', error);
      return 1;
    }
  }

  // Kullanıcının chat'lerini getirme
  async getUserChats(userId: string, userType: 'buyer' | 'seller'): Promise<Chat[]> {
    try {
      const field = userType === 'buyer' ? 'buyerId' : 'sellerId';
      const q = query(
        collection(db, 'chats'),
        where(field, '==', userId),
        where('isActive', '==', true),
        orderBy('lastMessageTime', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const chats: Chat[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as Chat);
      });
      
      return chats;
    } catch (error) {
      console.error('Error getting user chats:', error);
      throw new Error('Chat\'ler getirilemedi');
    }
  }

  // Chat mesajlarını getirme
  async getChatMessages(chatId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ChatMessage);
      });
      
      return messages.reverse(); // Eskiden yeniye sırala
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw new Error('Mesajlar getirilemedi');
    }
  }

  // Real-time mesaj dinleyicisi
  onMessagesUpdate(chatId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as ChatMessage);
      });
      callback(messages);
    });
  }

  // Real-time chat dinleyicisi
  onChatsUpdate(userId: string, userType: 'buyer' | 'seller', callback: (chats: Chat[]) => void) {
    const field = userType === 'buyer' ? 'buyerId' : 'sellerId';
    const q = query(
      collection(db, 'chats'),
      where(field, '==', userId),
      where('isActive', '==', true),
      orderBy('lastMessageTime', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const chats: Chat[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          ...data,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as Chat);
      });
      callback(chats);
    });
  }

  // Mesajları okundu olarak işaretle
  async markMessagesAsRead(chatId: string, userId: string, userType: 'buyer' | 'seller'): Promise<void> {
    try {
      // Mesajları okundu olarak işaretle
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      const batch = [];
      
      querySnapshot.forEach((doc) => {
        batch.push(updateDoc(doc.ref, { isRead: true }));
      });
      
      await Promise.all(batch);
      
      // Chat'teki okunmamış sayısını sıfırla
      const chatRef = doc(db, 'chats', chatId);
      const updateField = userType === 'buyer' ? 'buyerUnreadCount' : 'sellerUnreadCount';
      await updateDoc(chatRef, { [updateField]: 0 });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Mesajlar okundu olarak işaretlenemedi');
    }
  }

  // Sipariş durumu mesajı gönderme
  async sendOrderUpdateMessage(
    chatId: string,
    orderId: string,
    status: string,
    foodName: string,
    senderId: string,
    senderName: string,
    senderType: 'buyer' | 'seller'
  ): Promise<void> {
    const statusMessages = {
      pending: 'Sipariş onay bekliyor',
      approved: 'Sipariş onaylandı',
      preparing: 'Sipariş hazırlanıyor',
      ready: 'Sipariş hazır',
      completed: 'Sipariş tamamlandı',
      cancelled: 'Sipariş iptal edildi'
    };
    
    const message = `${foodName} - ${statusMessages[status as keyof typeof statusMessages] || 'Durum güncellendi'}`;
    
    await this.sendMessage(
      chatId,
      senderId,
      senderName,
      senderType,
      message,
      'order_update',
      { orderId, status, foodName }
    );
  }

  // Chat'i deaktif etme
  async deactivateChat(chatId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, { isActive: false });
    } catch (error) {
      console.error('Error deactivating chat:', error);
      throw new Error('Chat deaktif edilemedi');
    }
  }
}

export const chatService = new ChatService();
