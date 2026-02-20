import { ApiRequest, ApiResponse } from '../types';
import { foodModel } from '../models/foodModel';
import { categoryModel } from '../models/categoryModel';

const toTimestampPart = (date: Date): string => {
  return String(date.getTime());
};

const sanitizeIdPart = (value: string, fallback: string): string => {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return normalized || fallback;
};

const buildFoodIdBase = (cookId: string, createdAt: Date): string => {
  const normalizedCookId = sanitizeIdPart(cookId, 'unknown');
  const cookBase = normalizedCookId.replace(/_\d{10,13}(?:_\d+)?$/, '') || 'unknown';
  return `${cookBase}_${toTimestampPart(createdAt)}`;
};

const normalizeCategoryText = (value: string): string =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const resolveCategoryNameTr = async (value: string): Promise<string> => {
  const categories = await categoryModel.findAll(true);
  if (!categories.length) return 'Ana Yemek';
  const normalized = normalizeCategoryText(value);
  if (!normalized) return categories[0].nameTr || 'Ana Yemek';

  const match = categories.find((category) => {
    return (
      normalizeCategoryText(category.id) === normalized ||
      normalizeCategoryText(category.nameTr) === normalized ||
      normalizeCategoryText(category.nameEn) === normalized
    );
  });
  return match?.nameTr || categories[0].nameTr || 'Ana Yemek';
};

export const foodController = {
  getAll: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const foods = await foodModel.findAll();
      return { status: 200, data: foods };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  getById: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { id } = req.params;
      const food = await foodModel.findById(id);
      if (!food) return { status: 404, error: 'Food not found' };
      return { status: 200, data: food };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  create: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const foodData = req.body;
      const resolvedCategory = await resolveCategoryNameTr(String(foodData?.category || ''));
      const createdAtDate = new Date();
      const baseId = buildFoodIdBase(foodData?.cookId || '', createdAtDate);
      let nextId = foodData?.id || baseId;

      if (!foodData?.id) {
        let counter = 2;
        while (await foodModel.findById(nextId)) {
          nextId = `${baseId}_${counter}`;
          counter += 1;
        }
      }

      const newFood = {
        ...foodData,
        id: nextId,
        category: resolvedCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await foodModel.create(newFood);
      return { status: 201, data: newFood };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  update: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { id } = req.params;
      const current = await foodModel.findById(id);
      if (!current) return { status: 404, error: 'Food not found' };

      const payload = {
        ...current,
        ...(req.body || {}),
        id,
        category: await resolveCategoryNameTr(String(req.body?.category || current.category || '')),
        updatedAt: new Date().toISOString(),
      };
      await foodModel.update(id, payload);
      const updated = await foodModel.findById(id);
      return { status: 200, data: updated };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  remove: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { id } = req.params;
      const current = await foodModel.findById(id);
      if (!current) return { status: 404, error: 'Food not found' };
      await foodModel.delete(id);
      return { status: 200, data: { id } };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },
};
