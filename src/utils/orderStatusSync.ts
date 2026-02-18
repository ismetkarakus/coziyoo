import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncedOrderStatusKey = 'preparing' | 'ready' | 'onTheWay' | 'delivered';

export interface SyncedOrderStatus {
  orderId: string;
  statusKey: SyncedOrderStatusKey;
  updatedAt: string;
}

const STORAGE_KEY = 'synced_order_statuses_v1';

const parseSyncedStatuses = (value: string | null): Record<string, SyncedOrderStatus> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return {};
  } catch (error) {
    console.error('Failed to parse synced statuses:', error);
    return {};
  }
};

export const getSyncedOrderStatuses = async (): Promise<Record<string, SyncedOrderStatus>> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parseSyncedStatuses(raw);
};

export const getSyncedOrderStatus = async (orderId: string): Promise<SyncedOrderStatus | null> => {
  if (!orderId) return null;
  const all = await getSyncedOrderStatuses();
  return all[orderId] ?? null;
};

export const setSyncedOrderStatus = async (orderId: string, statusKey: SyncedOrderStatusKey): Promise<void> => {
  if (!orderId) return;

  const all = await getSyncedOrderStatuses();
  all[orderId] = {
    orderId,
    statusKey,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const getLatestSyncedOrderStatus = async (): Promise<SyncedOrderStatus | null> => {
  const all = await getSyncedOrderStatuses();
  const values = Object.values(all);
  if (values.length === 0) return null;

  return values.sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  })[0];
};
