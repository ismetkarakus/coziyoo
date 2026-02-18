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
  ingredients: string[];
  preparationTime: number;
  servingSize: number;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  extraData?: string;
  [key: string]: any;
}

const BASE_FIELDS = new Set([
  'id',
  'name',
  'description',
  'price',
  'cookName',
  'cookId',
  'category',
  'imageUrl',
  'ingredients',
  'preparationTime',
  'servingSize',
  'isAvailable',
  'rating',
  'reviewCount',
  'createdAt',
  'updatedAt',
  'extraData',
]);

const safeParseJson = <T>(value: unknown, fallback: T): T => {
  if (!value || typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeRow = (row: any): Food => {
  const ingredients = Array.isArray(row.ingredients)
    ? row.ingredients
    : safeParseJson<string[]>(row.ingredients, []);
  const extra = safeParseJson<Record<string, unknown>>(row.extraData, {});

  return {
    ...extra,
    ...row,
    ingredients,
    isAvailable: Boolean(row.isAvailable),
    price: Number(row.price || 0),
    preparationTime: Number(row.preparationTime || 0),
    servingSize: Number(row.servingSize || 0),
    rating: Number(row.rating || 0),
    reviewCount: Number(row.reviewCount || 0),
  } as Food;
};

const splitBaseAndExtra = (food: Record<string, any>) => {
  const base: Record<string, any> = {};
  const extra: Record<string, any> = {};

  Object.entries(food).forEach(([key, value]) => {
    if (BASE_FIELDS.has(key)) {
      base[key] = value;
    } else if (value !== undefined) {
      extra[key] = value;
    }
  });

  return { base, extra };
};

export const foodModel = {
  findAll: async (): Promise<Food[]> => {
    const db = getDB();
    const result = await db.getAllAsync('SELECT * FROM foods ORDER BY createdAt DESC');
    return result.map((row: any) => normalizeRow(row));
  },

  findById: async (id: string): Promise<Food | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM foods WHERE id = ?', [id]);
    if (!result) return null;
    return normalizeRow(result as any);
  },

  create: async (food: Food): Promise<void> => {
    const db = getDB();
    const { base, extra } = splitBaseAndExtra(food);

    await db.runAsync(
      `INSERT INTO foods (id, name, description, price, cookName, cookId, category, imageUrl, ingredients, extraData, preparationTime, servingSize, isAvailable, rating, reviewCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        base.id,
        base.name || '',
        base.description || '',
        Number(base.price || 0),
        base.cookName || '',
        base.cookId || '',
        base.category || '',
        base.imageUrl || '',
        JSON.stringify(Array.isArray(base.ingredients) ? base.ingredients : []),
        JSON.stringify(extra),
        Number(base.preparationTime || 0),
        Number(base.servingSize || 0),
        base.isAvailable ? 1 : 0,
        Number(base.rating || 0),
        Number(base.reviewCount || 0),
        base.createdAt,
        base.updatedAt,
      ]
    );
  },

  update: async (id: string, updates: Partial<Food>): Promise<void> => {
    const db = getDB();
    const current = await foodModel.findById(id);
    if (!current) return;

    const merged = { ...current, ...updates };
    const { base, extra } = splitBaseAndExtra(merged);

    await db.runAsync(
      `UPDATE foods
       SET name = ?, description = ?, price = ?, cookName = ?, cookId = ?, category = ?, imageUrl = ?, ingredients = ?, extraData = ?,
           preparationTime = ?, servingSize = ?, isAvailable = ?, rating = ?, reviewCount = ?, createdAt = ?, updatedAt = ?
       WHERE id = ?`,
      [
        base.name || '',
        base.description || '',
        Number(base.price || 0),
        base.cookName || '',
        base.cookId || '',
        base.category || '',
        base.imageUrl || '',
        JSON.stringify(Array.isArray(base.ingredients) ? base.ingredients : []),
        JSON.stringify(extra),
        Number(base.preparationTime || 0),
        Number(base.servingSize || 0),
        base.isAvailable ? 1 : 0,
        Number(base.rating || 0),
        Number(base.reviewCount || 0),
        base.createdAt,
        base.updatedAt,
        id,
      ]
    );
  },

  delete: async (id: string): Promise<void> => {
    const db = getDB();
    await db.runAsync('DELETE FROM foods WHERE id = ?', [id]);
  },
};
