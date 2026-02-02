import { getDB } from '../utils/db';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  userType: 'buyer' | 'seller' | 'both';
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export const userModel = {
  findById: async (uid: string): Promise<User | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM users WHERE uid = ?', [uid]);
    return result as User | null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    return result as User | null;
  },

  create: async (user: User): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO users (uid, email, displayName, userType, password, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.uid, user.email, user.displayName, user.userType, user.password || '', user.createdAt, user.updatedAt]
    );
  },

  update: async (uid: string, updates: Partial<User>): Promise<void> => {
    const db = getDB();
    const fields = Object.keys(updates).filter(k => k !== 'uid').map(k => `${k} = ?`).join(', ');
    const values = Object.keys(updates).filter(k => k !== 'uid').map(k => (updates as any)[k]);
    
    if (fields.length === 0) return;

    await db.runAsync(`UPDATE users SET ${fields} WHERE uid = ?`, [...values, uid]);
  }
};
