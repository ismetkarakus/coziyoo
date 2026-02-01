
import { User } from './auth';

// Mock Auth Object
export const auth = {
  currentUser: null as User | null,
  app: { name: '[DEFAULT]' },
  listeners: [] as Array<(user: User | null) => void>,
};

// Mock DB Object
export const db = {
  type: 'mock-firestore',
};

// Mock Storage Object
export const storage = {
  type: 'mock-storage',
};
