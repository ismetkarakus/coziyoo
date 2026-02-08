import users from '../mock/users.json';

export interface MockUserRecord {
  uid: string;
  email?: string;
  displayName?: string;
  userType?: 'buyer' | 'seller' | 'both';
  allergicTo?: string[];
}

const cloneUsers = (items: MockUserRecord[]) =>
  items.map(item => ({
    ...item,
    allergicTo: item.allergicTo ? [...item.allergicTo] : undefined,
  }));

export const mockUserService = {
  async getUsers(): Promise<MockUserRecord[]> {
    return cloneUsers(users as MockUserRecord[]);
  },
  async getUserByUid(uid?: string | null): Promise<MockUserRecord | null> {
    if (!uid) return null;
    const all = await this.getUsers();
    return all.find(user => user.uid === uid) || null;
  },
  async getUserByEmail(email?: string | null): Promise<MockUserRecord | null> {
    if (!email) return null;
    const normalized = email.toLowerCase();
    const all = await this.getUsers();
    return all.find(user => (user.email || '').toLowerCase() === normalized) || null;
  },
};
