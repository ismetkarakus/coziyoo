import { getDB } from '../utils/db';

export interface Order {
  id: string;
  foodId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  orderDate: string;
  estimatedDeliveryTime?: string;
}

export const orderModel = {
  create: async (order: Order): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO orders (id, foodId, buyerId, sellerId, quantity, totalPrice, status, deliveryAddress, orderDate, estimatedDeliveryTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.foodId,
        order.buyerId,
        order.sellerId,
        order.quantity,
        order.totalPrice,
        order.status,
        order.deliveryAddress,
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
    await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  }
};
