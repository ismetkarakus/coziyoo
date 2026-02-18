import { ApiRequest, ApiResponse } from '../types';
import { foodModel } from '../models/foodModel';

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
      const newFood = {
        ...foodData,
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
