import { mockData } from '@/src/mock/data';

interface DBInterface {
  execSync(sql: string): void;
  getAllAsync(sql: string, params?: any[]): Promise<any[]>;
  getFirstAsync(sql: string, params?: any[]): Promise<any | null>;
  runAsync(sql: string, params?: any[]): Promise<any>;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const buildTables = () => ({
  users: clone(mockData.users),
  foods: mockData.foods.map(food => ({
    ...food,
    ingredients: JSON.stringify(food.ingredients),
    isAvailable: food.isAvailable ? 1 : 0
  })),
  orders: clone(mockData.orders),
  chats: mockData.chats.map(chat => ({
    ...chat,
    isActive: chat.isActive ? 1 : 0
  })),
  messages: mockData.messages.map(message => ({
    ...message,
    isRead: message.isRead ? 1 : 0,
    orderData: message.orderData ? JSON.stringify(message.orderData) : null
  })),
  reviews: mockData.reviews.map(review => ({
    ...review,
    images: review.images ? JSON.stringify(review.images) : null,
    isVerifiedPurchase: review.isVerifiedPurchase ? 1 : 0
  }))
});

class MockDB implements DBInterface {
  private tables: { [name: string]: any[] } = {};

  constructor(initial?: { [name: string]: any[] }) {
    this.reset(initial);
  }

  reset(initial?: { [name: string]: any[] }) {
    this.tables = initial ? clone(initial) : {};
  }

  execSync(sql: string) {
    const tableMatches = sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g);
    for (const match of tableMatches) {
      const tableName = match[1];
      if (!this.tables[tableName]) {
        this.tables[tableName] = [];
      }
    }
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

    if (sql.includes('ORDER BY orderDate DESC')) {
      results.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }

    if (sql.includes('ORDER BY lastMessageTime DESC')) {
      results.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    }

    if (sql.includes('ORDER BY timestamp ASC')) {
      results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
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
        }
      }
    } else if (sql.startsWith('UPDATE')) {
      const tableName = sql.match(/UPDATE (\w+)/i)?.[1];
      const setMatch = sql.match(/SET (.*) WHERE/i);
      const idField = sql.match(/WHERE (\w+) = \?/i)?.[1];
      if (tableName && setMatch && idField) {
        const setFields = setMatch[1].split(',').map(s => s.trim().split('=')[0].trim());
        const idValue = params[params.length - 1];
        const itemIndex = this.tables[tableName].findIndex(i => i[idField] === idValue);
        if (itemIndex > -1) {
          setFields.forEach((field, idx) => {
            this.tables[tableName][itemIndex][field] = params[idx];
          });
        }
      }
    } else if (sql.startsWith('DELETE')) {
      const tableName = sql.match(/FROM (\w+)/i)?.[1];
      const idField = sql.match(/WHERE (\w+) = \?/i)?.[1];
      if (tableName && idField) {
        const idValue = params[0];
        this.tables[tableName] = this.tables[tableName].filter(i => i[idField] !== idValue);
      }
    }
    return { lastInsertRowId: Date.now(), changes: 1 };
  }
}

let db: MockDB | null = null;

export const initMockDatabase = () => {
  if (!db) {
    db = new MockDB(buildTables());
  } else {
    db.reset(buildTables());
  }
};

export const getMockDB = () => {
  if (!db) initMockDatabase();
  return db as DBInterface;
};
