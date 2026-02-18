import { getRequestedDataMode, type DataMode } from './dataMode';
import { getSQLiteDB, initSQLiteDatabase } from './sqliteDb';

let activeMode: DataMode = 'sqlite';

const initSQLite = (): void => {
  initSQLiteDatabase();
  activeMode = 'sqlite';
  console.log('✅ Data layer initialized with SQLite DB (persistent)');
};

export const initDatabase = (): void => {
  getRequestedDataMode();
  try {
    initSQLite();
  } catch (error) {
    console.error('❌ SQLite initialization failed:', error);
    throw error;
  }
};

export const getDB = () => getSQLiteDB();

export const getDatabaseMode = (): DataMode => activeMode;
