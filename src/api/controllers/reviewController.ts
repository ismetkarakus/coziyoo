import { ApiRequest, ApiResponse } from '../types';
import { reviewModel } from '../models/reviewModel';
import { foodModel } from '../models/foodModel';

export const reviewController = {
  create: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const reviewData = req.body;
      await reviewModel.create(reviewData);

      // Update food rating
      const food = await foodModel.findById(reviewData.foodId);
      if (food) {
        const newCount = food.reviewCount + 1;
        const newRating = ((food.rating * food.reviewCount) + reviewData.rating) / newCount;
        await foodModel.update(food.id, {
          rating: Math.round(newRating * 10) / 10,
          reviewCount: newCount
        });
      }

      return { status: 201, data: reviewData };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  },

  getByFood: async (req: ApiRequest): Promise<ApiResponse> => {
    try {
      const { foodId } = req.query;
      const reviews = await reviewModel.findByFoodId(foodId);
      return { status: 200, data: reviews };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }
};
