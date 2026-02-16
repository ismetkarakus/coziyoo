import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

import { mockData } from '@/src/mock/data';

interface DBInterface {
  execSync(sql: string): void;
  getAllAsync(sql: string, params?: any[]): Promise<any[]>;
  getFirstAsync(sql: string, params?: any[]): Promise<any | null>;
  runAsync(sql: string, params?: any[]): Promise<any>;
}

const DATABASE_NAME = 'coziyoo-test.db';

let sqliteDb: SQLiteDatabase | null = null;
const nowIso = (): string => new Date().toISOString();

const getDatabase = (): SQLiteDatabase => {
  if (!sqliteDb) {
    sqliteDb = openDatabaseSync(DATABASE_NAME);
  }
  return sqliteDb;
};

const createSchema = (db: SQLiteDatabase): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      displayName TEXT,
      userType TEXT,
      password TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      cookName TEXT,
      cookId TEXT,
      category TEXT,
      imageUrl TEXT,
      ingredients TEXT,
      preparationTime INTEGER,
      servingSize INTEGER,
      isAvailable INTEGER,
      rating REAL,
      reviewCount INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      foodId TEXT NOT NULL,
      buyerId TEXT NOT NULL,
      sellerId TEXT NOT NULL,
      quantity INTEGER,
      totalPrice REAL,
      status TEXT,
      deliveryAddress TEXT,
      orderDate TEXT,
      estimatedDeliveryTime TEXT
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY NOT NULL,
      buyerId TEXT NOT NULL,
      buyerName TEXT,
      sellerId TEXT NOT NULL,
      sellerName TEXT,
      orderId TEXT,
      foodId TEXT,
      foodName TEXT,
      lastMessage TEXT,
      lastMessageTime TEXT,
      lastMessageSender TEXT,
      buyerUnreadCount INTEGER,
      sellerUnreadCount INTEGER,
      isActive INTEGER,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      chatId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      senderName TEXT,
      senderType TEXT,
      message TEXT,
      messageType TEXT,
      timestamp TEXT,
      isRead INTEGER,
      orderData TEXT
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY NOT NULL,
      foodId TEXT NOT NULL,
      foodName TEXT,
      buyerId TEXT NOT NULL,
      buyerName TEXT,
      buyerAvatar TEXT,
      sellerId TEXT NOT NULL,
      sellerName TEXT,
      orderId TEXT,
      rating REAL,
      comment TEXT,
      images TEXT,
      helpfulCount INTEGER,
      reportCount INTEGER,
      isVerifiedPurchase INTEGER,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_foods_cookId ON foods(cookId);
    CREATE INDEX IF NOT EXISTS idx_orders_buyerId ON orders(buyerId);
    CREATE INDEX IF NOT EXISTS idx_orders_sellerId ON orders(sellerId);
    CREATE INDEX IF NOT EXISTS idx_chats_buyerId ON chats(buyerId);
    CREATE INDEX IF NOT EXISTS idx_chats_sellerId ON chats(sellerId);
    CREATE INDEX IF NOT EXISTS idx_messages_chatId ON messages(chatId);
    CREATE INDEX IF NOT EXISTS idx_reviews_foodId ON reviews(foodId);
  `);
};

const seedIfEmpty = (db: SQLiteDatabase): void => {
  const userCountRow = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM users');
  const userCount = Number(userCountRow?.count || 0);
  if (userCount > 0) return;

  db.withTransactionSync(() => {
    for (const user of mockData.users) {
      db.runSync(
        `INSERT INTO users (uid, email, displayName, userType, password, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.uid,
          user.email || '',
          user.displayName || '',
          user.userType || 'buyer',
          user.password || '',
          user.createdAt || nowIso(),
          user.updatedAt || nowIso(),
        ]
      );
    }

    for (const food of mockData.foods) {
      db.runSync(
        `INSERT INTO foods (id, name, description, price, cookName, cookId, category, imageUrl, ingredients, preparationTime, servingSize, isAvailable, rating, reviewCount, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          food.id,
          food.name,
          food.description || '',
          food.price ?? 0,
          food.cookName || '',
          food.cookId || '',
          food.category,
          food.imageUrl || '',
          JSON.stringify(food.ingredients || []),
          food.preparationTime ?? 0,
          food.servingSize ?? 0,
          food.isAvailable ? 1 : 0,
          food.rating ?? 0,
          food.reviewCount ?? 0,
          food.createdAt || nowIso(),
          food.updatedAt || nowIso(),
        ]
      );
    }

    for (const order of mockData.orders) {
      db.runSync(
        `INSERT INTO orders (id, foodId, buyerId, sellerId, quantity, totalPrice, status, deliveryAddress, orderDate, estimatedDeliveryTime)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          order.foodId,
          order.buyerId,
          order.sellerId,
          order.quantity,
          order.totalPrice,
          order.status,
          order.deliveryAddress,
          order.orderDate,
          order.estimatedDeliveryTime || null,
        ]
      );
    }

    for (const chat of mockData.chats) {
      db.runSync(
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
          chat.createdAt,
        ]
      );
    }

    for (const message of mockData.messages) {
      db.runSync(
        `INSERT INTO messages (id, chatId, senderId, senderName, senderType, message, messageType, timestamp, isRead, orderData)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.chatId,
          message.senderId,
          message.senderName,
          message.senderType,
          message.message,
          message.messageType,
          message.timestamp,
          message.isRead ? 1 : 0,
          message.orderData ? JSON.stringify(message.orderData) : null,
        ]
      );
    }

    for (const review of mockData.reviews) {
      db.runSync(
        `INSERT INTO reviews (id, foodId, foodName, buyerId, buyerName, buyerAvatar, sellerId, sellerName, orderId, rating, comment, images, helpfulCount, reportCount, isVerifiedPurchase, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          review.id,
          review.foodId,
          review.foodName,
          review.buyerId,
          review.buyerName,
          review.buyerAvatar || null,
          review.sellerId,
          review.sellerName,
          review.orderId || null,
          review.rating,
          review.comment,
          review.images ? JSON.stringify(review.images) : null,
          review.helpfulCount,
          review.reportCount,
          review.isVerifiedPurchase ? 1 : 0,
          review.createdAt,
          review.updatedAt,
        ]
      );
    }
  });
};

const mapRunResult = (result: {
  changes: number;
  lastInsertRowId: number;
}): { changes: number; lastInsertRowId: number } => ({
  changes: result.changes,
  lastInsertRowId: result.lastInsertRowId,
});

export const initSQLiteDatabase = (): void => {
  const db = getDatabase();
  createSchema(db);
  seedIfEmpty(db);
};

export const getSQLiteDB = (): DBInterface => {
  const db = getDatabase();
  return {
    execSync(sql: string): void {
      db.execSync(sql);
    },
    async getAllAsync(sql: string, params: any[] = []): Promise<any[]> {
      return db.getAllAsync(sql, params);
    },
    async getFirstAsync(sql: string, params: any[] = []): Promise<any | null> {
      return db.getFirstAsync(sql, params);
    },
    async runAsync(sql: string, params: any[] = []): Promise<any> {
      const result = await db.runAsync(sql, params);
      return mapRunResult(result);
    },
  };
};
