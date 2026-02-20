import { apiClient } from '../api/apiClient';

export interface Category {
  id: string;
  nameTr: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

const normalizeText = (value: unknown): string =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toCategory = (item: any): Category => ({
  id: String(item?.id || ''),
  nameTr: String(item?.nameTr ?? item?.name_tr ?? ''),
  nameEn: String(item?.nameEn ?? item?.name_en ?? ''),
  sortOrder: Number(item?.sortOrder ?? item?.sort_order ?? 0),
  isActive: Boolean(item?.isActive ?? item?.is_active ?? true),
});

class CategoryService {
  async getCategories(activeOnly = true): Promise<Category[]> {
    try {
      const response = await apiClient.get<any[]>('/categories', {
        activeOnly: activeOnly ? 'true' : 'false',
      });
      if (response.status !== 200 || !Array.isArray(response.data)) return [];
      return response.data.map(toCategory).filter((item) => item.id && item.nameTr && item.nameEn);
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  }

  getDisplayName(category: Category, language: 'tr' | 'en'): string {
    return language === 'en' ? category.nameEn : category.nameTr;
  }

  resolveCategoryId(categories: Category[], value: string): string | null {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    const found = categories.find((category) => {
      return (
        normalizeText(category.id) === normalized ||
        normalizeText(category.nameTr) === normalized ||
        normalizeText(category.nameEn) === normalized
      );
    });
    return found?.id || null;
  }

  resolveCategoryNameTr(categories: Category[], value: string): string | null {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    const found = categories.find((category) => {
      return (
        normalizeText(category.id) === normalized ||
        normalizeText(category.nameTr) === normalized ||
        normalizeText(category.nameEn) === normalized
      );
    });
    return found?.nameTr || null;
  }
}

export const categoryService = new CategoryService();
