import { ApiRequest, ApiResponse } from '../types';
import { orderModel } from '../models/orderModel';

export const orderController = {
  create: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const orderData = req.body;
      await orderModel.create(orderData);
      return { status: 201, data: orderData };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  list: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { userId, type } = req.query;
      const orders = await orderModel.findByUserId(userId, type);
      return { status: 200, data: orders };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  updateStatus: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await orderModel.updateStatus(id, status);
      return { status: 200, data: { id, status } };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
};
