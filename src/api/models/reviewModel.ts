import { getDB } from '../utils/db';

export interface Review {
  id: string;
  foodId: string;
  foodName: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerName: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
  helpfulCount: number;
  reportCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export const reviewModel = {
  create: async (review: Review): Promise<void> => {
    const db = getDB();
    await db.runAsync(
      `INSERT INTO reviews (id, foodId, foodName, buyerId, buyerName, buyerAvatar, sellerId, sellerName, orderId, rating, comment, images, helpfulCount, reportCount, isVerifiedPurchase, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        review.id,
        review.foodId,
        review.foodName,
        review.buyerId,
        review.buyerName,
        review.buyerAvatar || null,
        review.sellerId,
        review.sellerName,
        review.orderId || null,
        review.rating,
        review.comment,
        review.images ? JSON.stringify(review.images) : null,
        review.helpfulCount,
        review.reportCount,
        review.isVerifiedPurchase ? 1 : 0,
        review.createdAt,
        review.updatedAt
      ]
    );
  },

  findByFoodId: async (foodId: string): Promise<Review[]> => {
    const db = getDB();
    const result = await db.getAllAsync('SELECT * FROM reviews WHERE foodId = ? ORDER BY createdAt DESC', [foodId]);
    return result.map((row: any) => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      isVerifiedPurchase: Boolean(row.isVerifiedPurchase)
    }));
  }
};
