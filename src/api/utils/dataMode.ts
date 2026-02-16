export type DataMode = 'sqlite' | 'mock';

const normalizeDataMode = (value?: string): DataMode | null => {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'sqlite' || normalized === 'mock') {
    return normalized;
  }
  return null;
};

export const getRequestedDataMode = (): DataMode => {
  const fromEnv = normalizeDataMode(process.env.EXPO_PUBLIC_DATA_MODE);
  if (fromEnv) return fromEnv;

  // Default to sqlite for a more realistic test environment.
  return 'sqlite';
};
