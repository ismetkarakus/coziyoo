import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  runTransaction,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

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
  // Yorum ekleme
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpfulCount' | 'reportCount'>): Promise<string> {
    try {
      // Transaction kullanarak hem review'i ekle hem de food rating'ini güncelle
      const reviewId = await runTransaction(db, async (transaction) => {
        // Review'i ekle
        const reviewRef = doc(collection(db, 'reviews'));
        const review = {
          ...reviewData,
          helpfulCount: 0,
          reportCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        transaction.set(reviewRef, review);

        // Food document'ini güncelle
        const foodRef = doc(db, 'foods', reviewData.foodId);
        const foodDoc = await transaction.get(foodRef);
        
        if (foodDoc.exists()) {
          const foodData = foodDoc.data();
          const currentRating = foodData.rating || 0;
          const currentReviewCount = foodData.reviewCount || 0;
          
          // Yeni ortalama rating hesapla
          const newReviewCount = currentReviewCount + 1;
          const newAverageRating = ((currentRating * currentReviewCount) + reviewData.rating) / newReviewCount;
          
          transaction.update(foodRef, {
            rating: Math.round(newAverageRating * 10) / 10, // 1 decimal place
            reviewCount: newReviewCount,
            updatedAt: Timestamp.now()
          });
        }

        return reviewRef.id;
      });

      return reviewId;
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Yorum eklenirken hata oluştu');
    }
  }

  // Yemek için yorumları getirme
  async getFoodReviews(foodId: string, limitCount: number = 20): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('foodId', '==', foodId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Review);
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting food reviews:', error);
      throw new Error('Yorumlar getirilemedi');
    }
  }

  // Kullanıcının yorumlarını getirme
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('buyerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Review);
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw new Error('Kullanıcı yorumları getirilemedi');
    }
  }

  // Satıcının aldığı yorumları getirme
  async getSellerReviews(sellerId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Review);
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting seller reviews:', error);
      throw new Error('Satıcı yorumları getirilemedi');
    }
  }

  // Yorum istatistikleri
  async getReviewStats(foodId: string): Promise<ReviewStats> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('foodId', '==', foodId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalRating = 0;
      let totalReviews = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const rating = data.rating;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating as keyof typeof ratingDistribution]++;
          totalRating += rating;
          totalReviews++;
        }
      });
      
      const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;
      
      return {
        averageRating,
        totalReviews,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      throw new Error('Yorum istatistikleri getirilemedi');
    }
  }

  // Yorum güncelleme
  async updateReview(reviewId: string, updates: Partial<Pick<Review, 'rating' | 'comment' | 'images'>>): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await transaction.get(reviewRef);
        
        if (!reviewDoc.exists()) {
          throw new Error('Yorum bulunamadı');
        }
        
        const reviewData = reviewDoc.data() as Review;
        const oldRating = reviewData.rating;
        const newRating = updates.rating || oldRating;
        
        // Review'i güncelle
        transaction.update(reviewRef, {
          ...updates,
          updatedAt: Timestamp.now()
        });
        
        // Eğer rating değiştiyse, food rating'ini de güncelle
        if (updates.rating && updates.rating !== oldRating) {
          const foodRef = doc(db, 'foods', reviewData.foodId);
          const foodDoc = await transaction.get(foodRef);
          
          if (foodDoc.exists()) {
            const foodData = foodDoc.data();
            const currentRating = foodData.rating || 0;
            const reviewCount = foodData.reviewCount || 1;
            
            // Eski rating'i çıkar, yeni rating'i ekle
            const totalRating = (currentRating * reviewCount) - oldRating + newRating;
            const newAverageRating = totalRating / reviewCount;
            
            transaction.update(foodRef, {
              rating: Math.round(newAverageRating * 10) / 10,
              updatedAt: Timestamp.now()
            });
          }
        }
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Yorum güncellenirken hata oluştu');
    }
  }

  // Yorum silme
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await transaction.get(reviewRef);
        
        if (!reviewDoc.exists()) {
          throw new Error('Yorum bulunamadı');
        }
        
        const reviewData = reviewDoc.data() as Review;
        
        // Review'i sil
        transaction.delete(reviewRef);
        
        // Food rating'ini güncelle
        const foodRef = doc(db, 'foods', reviewData.foodId);
        const foodDoc = await transaction.get(foodRef);
        
        if (foodDoc.exists()) {
          const foodData = foodDoc.data();
          const currentRating = foodData.rating || 0;
          const currentReviewCount = foodData.reviewCount || 1;
          
          if (currentReviewCount > 1) {
            // Yeni ortalama rating hesapla
            const totalRating = (currentRating * currentReviewCount) - reviewData.rating;
            const newReviewCount = currentReviewCount - 1;
            const newAverageRating = totalRating / newReviewCount;
            
            transaction.update(foodRef, {
              rating: Math.round(newAverageRating * 10) / 10,
              reviewCount: newReviewCount,
              updatedAt: Timestamp.now()
            });
          } else {
            // Son yorum siliniyorsa rating'i sıfırla
            transaction.update(foodRef, {
              rating: 0,
              reviewCount: 0,
              updatedAt: Timestamp.now()
            });
          }
        }
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Yorum silinirken hata oluştu');
    }
  }

  // Yorumu faydalı olarak işaretle
  async markReviewHelpful(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        helpfulCount: increment(1),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking review helpful:', error);
      throw new Error('Yorum işaretlenirken hata oluştu');
    }
  }

  // Yorumu şikayet et
  async reportReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        reportCount: increment(1),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error reporting review:', error);
      throw new Error('Yorum şikayet edilirken hata oluştu');
    }
  }

  // Kullanıcının belirli bir yemek için yorum yapıp yapmadığını kontrol et
  async hasUserReviewedFood(userId: string, foodId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('buyerId', '==', userId),
        where('foodId', '==', foodId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking user review:', error);
      return false;
    }
  }

  // En iyi yorumları getir (rating'e göre)
  async getTopReviews(limitCount: number = 10): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('rating', '>=', 4),
        orderBy('rating', 'desc'),
        orderBy('helpfulCount', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Review);
      });
      
      return reviews;
    } catch (error) {
      console.error('Error getting top reviews:', error);
      throw new Error('En iyi yorumlar getirilemedi');
    }
  }

  // Yorum özeti getir (food detail sayfası için)
  async getReviewSummary(foodId: string): Promise<ReviewSummary> {
    try {
      const [stats, recentReviews] = await Promise.all([
        this.getReviewStats(foodId),
        this.getFoodReviews(foodId, 3) // Son 3 yorum
      ]);

      return {
        foodId,
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        recentReviews
      };
    } catch (error) {
      console.error('Error getting review summary:', error);
      throw new Error('Yorum özeti getirilemedi');
    }
  }
}

export const reviewService = new ReviewService();

