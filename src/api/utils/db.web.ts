import { getRequestedDataMode, type DataMode } from './dataMode';
import { getMockDB, initMockDatabase } from './mockDb';
import { getSQLiteDB, initSQLiteDatabase } from './sqliteDb';

let activeMode: DataMode = 'mock';

const initMock = (): void => {
  initMockDatabase();
  activeMode = 'mock';
  console.log('🌐 Web data layer initialized with mock JSON DB (in-memory)');
};

const initSQLite = (): void => {
  initSQLiteDatabase();
  activeMode = 'sqlite';
  console.log('🌐 Web data layer initialized with SQLite DB (persistent)');
};

const isWebSQLiteSyncSupported = (): boolean => {
  return typeof SharedArrayBuffer !== 'undefined';
};

export const initDatabase = (): void => {
  const requestedMode = getRequestedDataMode();
  if (requestedMode === 'mock') {
    initMock();
    return;
  }

  if (!isWebSQLiteSyncSupported()) {
    console.warn(
      '⚠️ Web runtime lacks SharedArrayBuffer; using mock DB. (SQLite remains available on native.)'
    );
    initMock();
    return;
  }

  try {
    initSQLite();
  } catch (error) {
    console.warn('⚠️ Web SQLite initialization failed, falling back to mock DB.');
    initMock();
  }
};

export const getDB = () => (activeMode === 'sqlite' ? getSQLiteDB() : getMockDB());

export const getDatabaseMode = (): DataMode => activeMode;
