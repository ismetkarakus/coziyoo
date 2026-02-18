import { foodService, Food } from './foodService';

export type MockFood = Food;

export const mockFoodService = {
  async getFoods(_delayMs = 0): Promise<MockFood[]> {
    return foodService.getAllFoods();
  },
};
