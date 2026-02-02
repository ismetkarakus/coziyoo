import { getDB } from '../utils/db';

export interface Chat {
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

export const chatModel = {
  create: async (chat: Chat): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO chats (id, buyerId, buyerName, sellerId, sellerName, orderId, foodId, foodName, lastMessage, lastMessageTime, lastMessageSender, buyerUnreadCount, sellerUnreadCount, isActive, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chat.id,
        chat.buyerId,
        chat.buyerName,
        chat.sellerId,
        chat.sellerName,
        chat.orderId || null,
        chat.foodId || null,
        chat.foodName || null,
        chat.lastMessage,
        chat.lastMessageTime,
        chat.lastMessageSender,
        chat.buyerUnreadCount,
        chat.sellerUnreadCount,
        chat.isActive ? 1 : 0,
        chat.createdAt
      ]
    );
  },

  findByUser: async (userId: string): Promise<Chat[]> => {
    const db = getDB();
    const result = await db.getAllAsync(
      'SELECT * FROM chats WHERE buyerId = ? OR sellerId = ? ORDER BY lastMessageTime DESC',
      [userId, userId]
    );
    return result.map((row: any) => ({
      ...row,
      isActive: Boolean(row.isActive)
    }));
  },

  findExisting: async (buyerId: string, sellerId: string): Promise<Chat | null> => {
    const db = getDB();
    const result = await db.getFirstAsync(
      'SELECT * FROM chats WHERE buyerId = ? AND sellerId = ?',
      [buyerId, sellerId]
    );
    if (!result) return null;
    return { ...result as any, isActive: Boolean((result as any).isActive) };
  },
  
  updateLastMessage: async (chatId: string, message: string, time: string, senderId: string): Promise<void> => {
      const db = getDB();
      await db.runAsync(
          `UPDATE chats SET lastMessage = ?, lastMessageTime = ?, lastMessageSender = ? WHERE id = ?`,
          [message, time, senderId, chatId]
      );
  }
};
