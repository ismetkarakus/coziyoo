import { getMockDB, initMockDatabase } from './mockDb';

export const initDatabase = () => {
  initMockDatabase();
  console.log('✅ Native Mock DB Initialized (in-memory)');
};

export const getDB = () => getMockDB();
