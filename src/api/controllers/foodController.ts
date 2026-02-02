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
  }
};
