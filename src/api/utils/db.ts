import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const openDB = () => {
  try {
    const database = SQLite.openDatabaseSync('coziyoo.db');
    console.log('✅ SQLite Database Opened: coziyoo.db');
    return database;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    return null;
  }
};

// Initial attempt
db = openDB();

export const initDatabase = () => {
  if (!db) db = openDB();
  if (!db) return;

  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, email TEXT, displayName TEXT, userType TEXT, password TEXT, createdAt TEXT, updatedAt TEXT);
      CREATE TABLE IF NOT EXISTS foods (id TEXT PRIMARY KEY, name TEXT, description TEXT, price REAL, cookName TEXT, cookId TEXT, category TEXT, imageUrl TEXT, ingredients TEXT, preparationTime INTEGER, servingSize INTEGER, isAvailable INTEGER, rating REAL, reviewCount INTEGER, createdAt TEXT, updatedAt TEXT);
      CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, foodId TEXT, buyerId TEXT, sellerId TEXT, quantity INTEGER, totalPrice REAL, status TEXT, deliveryAddress TEXT, orderDate TEXT, estimatedDeliveryTime TEXT);
      CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, buyerId TEXT, buyerName TEXT, sellerId TEXT, sellerName TEXT, orderId TEXT, foodId TEXT, foodName TEXT, lastMessage TEXT, lastMessageTime TEXT, lastMessageSender TEXT, buyerUnreadCount INTEGER, sellerUnreadCount INTEGER, isActive INTEGER, createdAt TEXT);
      CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, chatId TEXT, senderId TEXT, senderName TEXT, senderType TEXT, message TEXT, messageType TEXT, timestamp TEXT, isRead INTEGER, orderData TEXT);
      CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, foodId TEXT, foodName TEXT, buyerId TEXT, buyerName TEXT, buyerAvatar TEXT, sellerId TEXT, sellerName TEXT, orderId TEXT, rating REAL, comment TEXT, images TEXT, helpfulCount INTEGER, reportCount INTEGER, isVerifiedPurchase INTEGER, createdAt TEXT, updatedAt TEXT);
    `);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
  }
};

export const getDB = () => {
    if (!db) db = openDB();
    if (!db) throw new Error('Database not available');
    return db as any;
};
