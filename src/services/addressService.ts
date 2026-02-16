import { apiClient } from '../api/apiClient';

export interface AddressRecord {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

class AddressService {
  async list(userId: string): Promise<AddressRecord[]> {
    const response = await apiClient.get<AddressRecord[]>('/addresses', { userId });
    if (response.status !== 200 || !Array.isArray(response.data)) return [];
    return response.data;
  }

  async create(userId: string, payload: Omit<AddressRecord, 'id'>): Promise<AddressRecord | null> {
    const response = await apiClient.post<AddressRecord>('/addresses', {
      userId,
      title: payload.title,
      address: payload.address,
      isDefault: payload.isDefault,
    });
    if (response.status !== 201 || !response.data) return null;
    return response.data;
  }

  async setDefault(userId: string, addressId: string): Promise<boolean> {
    const response = await apiClient.put(`/addresses/${encodeURIComponent(addressId)}/default`, { userId });
    return response.status === 200;
  }

  async remove(userId: string, addressId: string): Promise<boolean> {
    const response = await apiClient.delete(
      `/addresses/${encodeURIComponent(addressId)}?userId=${encodeURIComponent(userId)}`
    );
    return response.status === 200;
  }
}

export const addressService = new AddressService();
