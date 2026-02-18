import { getDB } from '../utils/db';

export interface Order {
  id: string;
  foodId: string;
  foodName?: string;
  cookName?: string;
  cookId?: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  quantity: number;
  price?: number;
  totalPrice: number;
  deliveryType?: string;
  requestedDate?: string;
  requestedTime?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'seller_approved' | 'pending_seller_approval' | 'pending_buyer_approval' | 'rejected' | 'completed';
  trackingStatus?: string;
  deliveryAddress: string;
  paymentCompleted?: number;
  buyerApprovedAt?: string;
  sellerApprovedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  orderDate: string;
  estimatedDeliveryTime?: string;
}

export const orderModel = {
  create: async (order: Order): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO orders (
        id, foodId, foodName, cookName, cookId, buyerId, buyerName, sellerId, quantity, price, totalPrice,
        deliveryType, requestedDate, requestedTime, status, trackingStatus, deliveryAddress, paymentCompleted,
        buyerApprovedAt, sellerApprovedAt, createdAt, updatedAt, orderDate, estimatedDeliveryTime
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.foodId,
        order.foodName || '',
        order.cookName || '',
        order.cookId || '',
        order.buyerId,
        order.buyerName || '',
        order.sellerId,
        order.quantity,
        Number(order.price ?? 0),
        order.totalPrice,
        order.deliveryType || '',
        order.requestedDate || '',
        order.requestedTime || '',
        order.status,
        order.trackingStatus || '',
        order.deliveryAddress,
        Number(order.paymentCompleted ?? 0),
        order.buyerApprovedAt || null,
        order.sellerApprovedAt || null,
        order.createdAt || order.orderDate,
        order.updatedAt || order.orderDate,
        order.orderDate,
        order.estimatedDeliveryTime || null
      ]
    );
  },

  findByUserId: async (userId: string, type: 'buyer' | 'seller'): Promise<Order[]> => {
    const db = getDB();
    const field = type === 'buyer' ? 'buyerId' : 'sellerId';
    const result = await db.getAllAsync(`SELECT * FROM orders WHERE ${field} = ? ORDER BY orderDate DESC`, [userId]);
    return result as Order[];
  },

  findById: async (id: string): Promise<Order | null> => {
    const db = getDB();
    const result = await db.getFirstAsync('SELECT * FROM orders WHERE id = ?', [id]);
    return result as Order | null;
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const db = getDB();
    await db.runAsync('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?', [status, new Date().toISOString(), id]);
  },

  update: async (id: string, updates: Partial<Order>): Promise<void> => {
    const db = getDB();
    const payload: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    delete payload.id;
    const fields = Object.keys(payload).map((key) => `${key} = ?`).join(', ');
    const values = Object.keys(payload).map((key) => payload[key]);
    if (!fields) return;
    await db.runAsync(`UPDATE orders SET ${fields} WHERE id = ?`, [...values, id]);
  }
};
