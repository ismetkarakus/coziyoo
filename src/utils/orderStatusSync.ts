import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncedOrderStatusKey = 'preparing' | 'ready' | 'onTheWay' | 'delivered';

export interface SyncedOrderStatus {
  orderId: string;
  statusKey: SyncedOrderStatusKey;
  updatedAt: string;
}

const STORAGE_KEY = 'synced_order_statuses_v1';
const ORDERS_STORAGE_KEY = 'orders';

const normalizeStatusForOrders = (statusKey: SyncedOrderStatusKey): string => {
  switch (statusKey) {
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'onTheWay':
      return 'ready';
    case 'delivered':
      return 'completed';
    default:
      return 'preparing';
  }
};

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

const syncLegacyOrdersStatus = async (orderId: string, statusKey: SyncedOrderStatusKey): Promise<void> => {
  try {
    const rawOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (!rawOrders) return;

    const parsedOrders = JSON.parse(rawOrders);
    if (!Array.isArray(parsedOrders)) return;

    let changed = false;
    const normalizedStatus = normalizeStatusForOrders(statusKey);

    const updatedOrders = parsedOrders.map((order) => {
      const currentOrderId = order?.id ?? order?.orderId;
      if (currentOrderId !== orderId) {
        return order;
      }

      changed = true;
      return {
        ...order,
        status: normalizedStatus,
        trackingStatus: statusKey,
        updatedAt: new Date().toISOString(),
      };
    });

    if (changed) {
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    }
  } catch (error) {
    console.error('Failed to sync legacy orders status:', error);
  }
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
  await syncLegacyOrdersStatus(orderId, statusKey);
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
