// --- Web Persistence Mock ---
// This file is used on the Web to avoid importing expo-sqlite and its native dependencies.
// It uses localStorage for persistence to allow full logic testing in the browser.

class WebDBMock {
  private tables: { [name: string]: any[] } = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      const data = localStorage.getItem('coziyoo_mock_db');
      if (data) this.tables = JSON.parse(data);
    } catch (e) {
      console.error('Web DB Load Error:', e);
    }
  }

  private save() {
    try {
      localStorage.setItem('coziyoo_mock_db', JSON.stringify(this.tables));
    } catch (e) {
      console.error('Web DB Save Error:', e);
    }
  }

  execSync(sql: string) {
    const tableMatches = sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g);
    for (const match of tableMatches) {
      const tableName = match[1];
      if (!this.tables[tableName]) {
        this.tables[tableName] = [];
      }
    }
    this.save();
  }

  async getAllAsync(sql: string, params: any[] = []) {
    const tableName = sql.match(/FROM (\w+)/i)?.[1];
    if (!tableName) return [];
    let results = [...(this.tables[tableName] || [])];

    if (sql.includes('WHERE')) {
      const whereMatch = sql.match(/WHERE (\w+) = \?/i);
      if (whereMatch && params.length > 0) {
        const field = whereMatch[1];
        results = results.filter(item => item[field] === params[0]);
      }
    }
    
    if (sql.includes('ORDER BY createdAt DESC')) {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results;
  }

  async getFirstAsync(sql: string, params: any[] = []) {
    const results = await this.getAllAsync(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async runAsync(sql: string, params: any[] = []) {
    if (sql.startsWith('INSERT')) {
      const tableName = sql.match(/INSERT INTO (\w+)/i)?.[1];
      if (tableName) {
        const colsMatch = sql.match(/\((.*?)\)/);
        if (colsMatch) {
          const cols = colsMatch[1].split(',').map(c => c.trim());
          const newItem: any = {};
          cols.forEach((col, i) => newItem[col] = params[i]);
          this.tables[tableName].push(newItem);
          this.save();
        }
      }
    } else if (sql.startsWith('UPDATE')) {
      const tableName = sql.match(/UPDATE (\w+)/i)?.[1];
      const idField = sql.match(/WHERE (\w+) = \?/i)?.[1];
      if (tableName && idField) {
          const idValue = params[params.length - 1];
          const itemIndex = this.tables[tableName].findIndex(i => i[idField] === idValue);
          if (itemIndex > -1) {
              console.log(`[Web DB] Item ${idValue} updated in ${tableName}`);
              this.save();
          }
      }
    } else if (sql.startsWith('DELETE')) {
        const tableName = sql.match(/FROM (\w+)/i)?.[1];
        const idField = sql.match(/WHERE (\w+) = \?/i)?.[1];
        if (tableName && idField) {
            const idValue = params[0];
            this.tables[tableName] = this.tables[tableName].filter(i => i[idField] !== idValue);
            this.save();
        }
    }
    return { lastInsertRowId: Date.now(), changes: 1 };
  }
}

const db = new WebDBMock();

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, email TEXT, displayName TEXT, userType TEXT, password TEXT, createdAt TEXT, updatedAt TEXT);
    CREATE TABLE IF NOT EXISTS foods (id TEXT PRIMARY KEY, name TEXT, description TEXT, price REAL, cookName TEXT, cookId TEXT, category TEXT, imageUrl TEXT, ingredients TEXT, preparationTime INTEGER, servingSize INTEGER, isAvailable INTEGER, rating REAL, reviewCount INTEGER, createdAt TEXT, updatedAt TEXT);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, foodId TEXT, buyerId TEXT, sellerId TEXT, quantity INTEGER, totalPrice REAL, status TEXT, deliveryAddress TEXT, orderDate TEXT, estimatedDeliveryTime TEXT);
    CREATE TABLE IF NOT EXISTS chats (id TEXT PRIMARY KEY, buyerId TEXT, buyerName TEXT, sellerId TEXT, sellerName TEXT, orderId TEXT, foodId TEXT, foodName TEXT, lastMessage TEXT, lastMessageTime TEXT, lastMessageSender TEXT, buyerUnreadCount INTEGER, sellerUnreadCount INTEGER, isActive INTEGER, createdAt TEXT);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, chatId TEXT, senderId TEXT, senderName TEXT, senderType TEXT, message TEXT, messageType TEXT, timestamp TEXT, isRead INTEGER, orderData TEXT);
    CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, foodId TEXT, foodName TEXT, buyerId TEXT, buyerName TEXT, buyerAvatar TEXT, sellerId TEXT, sellerName TEXT, orderId TEXT, rating REAL, comment TEXT, images TEXT, helpfulCount INTEGER, reportCount INTEGER, isVerifiedPurchase INTEGER, createdAt TEXT, updatedAt TEXT);
  `);
  console.log('🌐 Web Persistence Mock Initialized (localStorage)');
};

export const getDB = () => db;
