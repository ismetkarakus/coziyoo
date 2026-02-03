import { getMockDB, initMockDatabase } from './mockDb';

export const initDatabase = () => {
  initMockDatabase();
  console.log('✅ Mock DB Initialized (in-memory)');
};

export const getDB = () => getMockDB();
