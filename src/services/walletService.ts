import { apiClient } from '../api/apiClient';

export const walletService = {
  async getWalletByUserId(uid: string): Promise<{ userId: string; data: string; updatedAt: string } | null> {
    const response = await apiClient.get(`/wallets/${uid}`);
    if (response.status !== 200 || !response.data) return null;
    return response.data as { userId: string; data: string; updatedAt: string };
  },

  async saveWalletByUserId(uid: string, data: any): Promise<void> {
    const response = await apiClient.put(`/wallets/${uid}`, { data });
    if (response.status !== 200) {
      throw new Error(response.error || 'Wallet save failed');
    }
  },
};
