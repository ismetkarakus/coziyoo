import { getDB } from '../utils/db';

export interface CategoryRecord {
  id: string;
  nameTr: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const normalizeRow = (row: any): CategoryRecord => ({
  id: String(row.id || ''),
  nameTr: String(row.nameTr ?? row.name_tr ?? ''),
  nameEn: String(row.nameEn ?? row.name_en ?? ''),
  sortOrder: Number(row.sortOrder ?? row.sort_order ?? 0),
  isActive: Boolean(row.isActive ?? row.is_active ?? 1),
  createdAt: row.createdAt ?? row.created_at,
  updatedAt: row.updatedAt ?? row.updated_at,
});

export const categoryModel = {
  findAll: async (activeOnly = true): Promise<CategoryRecord[]> => {
    const db = getDB();
    const whereClause = activeOnly ? 'WHERE isActive = 1' : '';
    const rows = await db.getAllAsync(
      `SELECT id, nameTr, nameEn, sortOrder, isActive, createdAt, updatedAt
       FROM categories
       ${whereClause}
       ORDER BY sortOrder ASC, nameTr ASC`
    );
    return rows.map((row: any) => normalizeRow(row));
  },
};
