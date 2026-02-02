import { getDB } from '../utils/db';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'buyer' | 'seller';
  message: string;
  messageType: 'text' | 'image' | 'order_update';
  timestamp: string;
  isRead: boolean;
  orderData?: any;
}

export const messageModel = {
  create: async (msg: Message): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO messages (id, chatId, senderId, senderName, senderType, message, messageType, timestamp, isRead, orderData)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        msg.id,
        msg.chatId,
        msg.senderId,
        msg.senderName,
        msg.senderType,
        msg.message,
        msg.messageType,
        msg.timestamp,
        msg.isRead ? 1 : 0,
        msg.orderData ? JSON.stringify(msg.orderData) : null
      ]
    );
  },

  findByChatId: async (chatId: string): Promise<Message[]> => {
    const db = getDB();
    const result = await db.getAllAsync('SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC', [chatId]);
    return result.map((row: any) => ({
      ...row,
      isRead: Boolean(row.isRead),
      orderData: row.orderData ? JSON.parse(row.orderData) : undefined
    }));
  }
};
