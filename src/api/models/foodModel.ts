import { getDB } from '../utils/db';

export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  cookName: string;
  cookId: string;
  category: string;
  imageUrl: string;
  ingredients: string[]; // Stored as JSON string
  preparationTime: number;
  servingSize: number;
  isAvailable: boolean; // Stored as 0/1
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export const foodModel = {
  findAll: async (): Promise<Food[]> => {
    const db = getDB();
    const result = await db.getAllAsync('SELECT * FROM foods ORDER BY createdAt DESC');
    return result.map((row: any) => ({
      ...row,
      ingredients: JSON.parse(row.ingredients),
      isAvailable: Boolean(row.isAvailable)
    }));
  },

  findById: async (id: string): Promise<Food | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM foods WHERE id = ?', [id]);
    if (!result) return null;
    const row = result as any;
    return {
      ...row,
      ingredients: JSON.parse(row.ingredients),
      isAvailable: Boolean(row.isAvailable)
    };
  },

  create: async (food: Food): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO foods (id, name, description, price, cookName, cookId, category, imageUrl, ingredients, preparationTime, servingSize, isAvailable, rating, reviewCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        food.id,
        food.name,
        food.description,
        food.price,
        food.cookName,
        food.cookId,
        food.category,
        food.imageUrl,
        JSON.stringify(food.ingredients),
        food.preparationTime,
        food.servingSize,
        food.isAvailable ? 1 : 0,
        food.rating,
        food.reviewCount,
        food.createdAt,
        food.updatedAt
      ]
    );
  },

  update: async (id: string, updates: Partial<Food>): Promise<void> => {
    const db = getDB();
    const fields = Object.keys(updates).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
    const values = Object.keys(updates).filter(k => k !== 'id').map(k => {
      const val = (updates as any)[k];
      if (k === 'ingredients') return JSON.stringify(val);
      if (k === 'isAvailable') return val ? 1 : 0;
      return val;
    });
    
    if (fields.length === 0) return;

    await db.runAsync(`UPDATE foods SET ${fields} WHERE id = ?`, [...values, id]);
  },

  delete: async (id: string): Promise<void> => {
    const db = getDB();
    await db.runAsync('DELETE FROM foods WHERE id = ?', [id]);
  }
};
