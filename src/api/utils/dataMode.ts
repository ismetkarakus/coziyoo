export type DataMode = 'sqlite';

const normalizeDataMode = (value?: string): DataMode | null => {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'sqlite') {
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
