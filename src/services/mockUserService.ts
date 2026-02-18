import { apiClient } from '../api/apiClient';

export interface MockUserRecord {
  uid: string;
  email?: string;
  displayName?: string;
  username?: string;
  userType?: 'buyer' | 'seller' | 'both';
  allergicTo?: string[];
}

const parseAllergies = (value: unknown): string[] => {
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeUser = (user: any): MockUserRecord => ({
  ...user,
  allergicTo: parseAllergies(user?.allergicTo),
});

export const mockUserService = {
  async getUsers(): Promise<MockUserRecord[]> {
    return [];
  },

  async getUserByUid(uid?: string | null): Promise<MockUserRecord | null> {
    if (!uid) return null;
    const response = await apiClient.get(`/auth/me/${uid}`);
    if (response.status !== 200 || !response.data) return null;
    return normalizeUser(response.data);
  },

  async getUserByEmail(_email?: string | null): Promise<MockUserRecord | null> {
    // Email lookup endpoint does not exist in the API; callers should prefer uid-based reads.
    return null;
  },
};
