import { ApiRequest, ApiResponse } from '../types';
import { categoryModel } from '../models/categoryModel';

export const categoryController = {
  getAll: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const activeOnly = String(req.query?.activeOnly ?? 'true').toLowerCase() !== 'false';
      const categories = await categoryModel.findAll(activeOnly);
      return { status: 200, data: categories };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },
};
