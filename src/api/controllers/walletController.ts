import { ApiRequest, ApiResponse } from '../types';
import { walletModel } from '../models/walletModel';

export const walletController = {
  getByUser: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { uid } = req.params;
      const wallet = await walletModel.findByUserId(uid);
      if (!wallet) return { status: 404, error: 'Wallet not found' };
      return { status: 200, data: wallet };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  upsert: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { uid } = req.params;
      const payload = req.body?.data;
      const data = typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});
      const wallet = await walletModel.upsert(uid, data);
      return { status: 200, data: wallet };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },
};
