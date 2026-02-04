import { apiClient } from '../api/apiClient';

export interface Review {
  id?: string;
  foodId: string;
  foodName: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerName: string;
  orderId?: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  helpfulCount: number;
  reportCount: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewSummary {
  foodId: string;
  averageRating: number;
  totalReviews: number;
  recentReviews: Review[];
}

class ReviewService {
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'reportCount'>): Promise<string> {
    try {
      const id = `rev_${Date.now()}`;
      const response = await apiClient.post('/reviews', {
          ...reviewData,
          id,
          helpfulCount: 0,
          reportCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      });
      if (response.status !== 201) throw new Error(response.error || 'Yorum eklenemedi');
      return id;
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      throw new Error('Yorum eklenemedi');
    }
  }

  async getFoodReviews(foodId: string): Promise<Review[]> {
    try {
      const response = await apiClient.get('/reviews', { foodId });
      if (response.status !== 200 || !response.data) return [];
      
      return response.data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
      }));
    } catch (error) {
      console.error('Yorumları getirme hatası:', error);
      return [];
    }
  }

  async getReviewStats(foodId: string): Promise<ReviewStats> {
      const reviews = await this.getFoodReviews(foodId);
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalRating = 0;
      
      reviews.forEach(r => {
          const rating = Math.round(r.rating) as keyof typeof ratingDistribution;
          if (ratingDistribution[rating] !== undefined) {
              ratingDistribution[rating]++;
              totalRating += r.rating;
          }
      });
      
      return {
          averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
          totalReviews: reviews.length,
          ratingDistribution
      };
  }

  async getReviewSummary(foodId: string): Promise<ReviewSummary> {
      const [stats, reviews] = await Promise.all([
          this.getReviewStats(foodId),
          this.getFoodReviews(foodId)
      ]);
      
      return {
          foodId,
          averageRating: stats.averageRating,
          totalReviews: stats.totalReviews,
          recentReviews: reviews.slice(0, 3)
      };
  }
  async markReviewHelpful(reviewId: string): Promise<void> {
    try {
      console.log('Marking review helpful:', reviewId);
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  }

  async reportReview(reviewId: string): Promise<void> {
    try {
      console.log('Reporting review:', reviewId);
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  }

  async hasUserReviewedFood(userId: string, foodId: string): Promise<boolean> {
    try {
      // Mock implementation
      return false;
    } catch (error) {
      console.error('Error checking if user reviewed food:', error);
      return false;
    }
  }
}

export const reviewService = new ReviewService();
