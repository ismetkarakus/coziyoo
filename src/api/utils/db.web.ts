import { getRequestedDataMode, type DataMode } from './dataMode';
import { getSQLiteDB, initSQLiteDatabase } from './sqliteDb';

let activeMode: DataMode = 'sqlite';
let sqliteReady = false;

const initSQLite = (): void => {
  initSQLiteDatabase();
  activeMode = 'sqlite';
  sqliteReady = true;
  console.log('🌐 Web data layer initialized with SQLite DB (persistent)');
};

const isWebSQLiteSyncSupported = (): boolean => {
  return typeof SharedArrayBuffer !== 'undefined';
};

const isRemoteApiMode = (): boolean => {
  const apiMode = String(process.env.EXPO_PUBLIC_API_MODE || '').trim().toLowerCase();
  if (apiMode === 'remote') return true;
  if (apiMode === 'internal') return false;
  return Boolean(process.env.EXPO_PUBLIC_API_BASE_URL);
};

export const initDatabase = (): void => {
  getRequestedDataMode();

  if (!isWebSQLiteSyncSupported()) {
    if (isRemoteApiMode()) {
      // Remote API mode does not need local SQLite/SharedArrayBuffer.
      console.warn('⚠️ SharedArrayBuffer unavailable on web; skipping local SQLite because API mode is remote.');
      return;
    }
    throw new Error('Web runtime lacks SharedArrayBuffer required for SQLite sync mode in internal API mode.');
  }

  try {
    initSQLite();
  } catch (error) {
    console.error('❌ Web SQLite initialization failed:', error);
    throw error;
  }
};

export const getDB = () => {
  if (!sqliteReady) {
    throw new Error('Local SQLite DB is not initialized on web. Use remote API mode.');
  }
  return getSQLiteDB();
};

export const getDatabaseMode = (): DataMode => activeMode;
