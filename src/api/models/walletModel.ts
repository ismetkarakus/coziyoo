import { getDB } from '../utils/db';

export interface WalletRecord {
  userId: string;
  data: string;
  updatedAt: string;
}

export const walletModel = {
  findByUserId: async (userId: string): Promise<WalletRecord | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM wallets WHERE userId = ?', [userId]);
    return result as WalletRecord | null;
  },

  upsert: async (userId: string, data: string): Promise<WalletRecord> => {
    const db = getDB();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO wallets (userId, data, updatedAt)
       VALUES (?, ?, ?)
       ON CONFLICT(userId) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt`,
      [userId, data, now]
    );
    return { userId, data, updatedAt: now };
  },
};
