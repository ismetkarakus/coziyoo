import { getMockDB, initMockDatabase } from './mockDb';

export const initDatabase = () => {
  initMockDatabase();
  console.log('🌐 Web Mock DB Initialized (in-memory)');
};

export const getDB = () => getMockDB();
