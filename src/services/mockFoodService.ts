import foods from '../mock/foods.json';
import { MockFood } from '../mock/data';

const DEFAULT_DELAY_MS = 350;

const cloneFoods = (items: MockFood[]) =>
  items.map(item => ({
    ...item,
    availableDeliveryOptions: item.availableDeliveryOptions
      ? [...item.availableDeliveryOptions]
      : undefined,
    allergens: item.allergens ? [...item.allergens] : undefined,
  }));

export const mockFoodService = {
  async getFoods(delayMs: number = DEFAULT_DELAY_MS): Promise<MockFood[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(cloneFoods(foods as MockFood[]));
      }, delayMs);
    });
  },
};
