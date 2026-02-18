import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/apiClient';
import { foodService } from './foodService';

const FAVORITES_KEY = 'favorites';
const FAVORITE_COUNTS_KEY = 'favoriteCounts';

export interface FavoritePayload {
  id: string;
  name: string;
  cookName: string;
  price: number;
  rating: number;
  imageUrl: string;
  category: string;
}

export interface FavoriteMeta {
  favoriteIds: Set<string>;
  favoriteCounts: Record<string, number>;
}

const buildDefaultFavoriteCounts = (): Record<string, number> => {
  return {};
};

export const getFavorites = async (userId?: string | null): Promise<FavoritePayload[]> => {
  if (userId) {
    try {
      const response = await apiClient.get<FavoritePayload[]>('/favorites', { userId });
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error) {
      console.error('Error loading remote favorites:', error);
    }
  }

  try {
    const favoritesRaw = await AsyncStorage.getItem(FAVORITES_KEY);
    const favorites = favoritesRaw ? JSON.parse(favoritesRaw) : [];
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error loading local favorites:', error);
    return [];
  }
};

export const getFavoriteMeta = async (userId?: string | null): Promise<FavoriteMeta> => {
  if (userId) {
    try {
      const favorites = await getFavorites(userId);
      const favoriteIds = new Set<string>(favorites.map((item) => String(item.id)));
      const favoriteCounts: Record<string, number> = buildDefaultFavoriteCounts();

      favorites.forEach((item: any) => {
        favoriteCounts[String(item.id)] = Number(item.favoriteCount ?? favoriteCounts[String(item.id)] ?? 0);
      });

      return {
        favoriteIds,
        favoriteCounts,
      };
    } catch (error) {
      console.error('Error loading remote favorite meta:', error);
    }
  }

  try {
    const [favoritesRaw, countsRaw] = await Promise.all([
      AsyncStorage.getItem(FAVORITES_KEY),
      AsyncStorage.getItem(FAVORITE_COUNTS_KEY),
    ]);

    const favorites = favoritesRaw ? JSON.parse(favoritesRaw) : [];
    const favoriteIds = new Set<string>((favorites || []).map((fav: any) => String(fav.id)));
    const defaultCounts = buildDefaultFavoriteCounts();
    const storedCounts = countsRaw ? JSON.parse(countsRaw) : {};

    return {
      favoriteIds,
      favoriteCounts: { ...defaultCounts, ...storedCounts },
    };
  } catch (error) {
    console.error('Error loading favorite meta:', error);
    return {
      favoriteIds: new Set<string>(),
      favoriteCounts: buildDefaultFavoriteCounts(),
    };
  }
};

export const toggleFavorite = async (
  payload: FavoritePayload,
  userId?: string | null
): Promise<{ isFavorite: boolean; favoriteCount: number; meta: FavoriteMeta }> => {
  if (userId) {
    try {
      const response = await apiClient.post<{ foodId: string; isFavorite: boolean; favoriteCount: number }>(
        '/favorites/toggle',
        { userId, foodId: String(payload.id) }
      );
      if (response.status === 200 && response.data) {
        const meta = await getFavoriteMeta(userId);
        return {
          isFavorite: Boolean(response.data.isFavorite),
          favoriteCount: Number(response.data.favoriteCount || 0),
          meta,
        };
      }
    } catch (error) {
      console.error('Error toggling remote favorite:', error);
    }
  }

  const id = String(payload.id);
  let resolvedPayload = payload;
  if (!resolvedPayload.name) {
    try {
      const food = await foodService.getFoodById(id);
      if (food) {
        resolvedPayload = {
          id,
          name: food.name || '',
          cookName: food.cookName || food.sellerName || '',
          price: Number(food.price || 0),
          rating: Number(food.rating || 0),
          imageUrl: food.imageUrl || '',
          category: food.category || '',
        };
      }
    } catch (_error) {
      // keep payload fallback
    }
  }
  const rawFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
  const favorites = rawFavorites ? JSON.parse(rawFavorites) : [];
  const { favoriteCounts } = await getFavoriteMeta();

  const existingIndex = favorites.findIndex((fav: any) => String(fav.id) === id);
  const currentlyFavorite = existingIndex >= 0;
  const currentCount = Number(favoriteCounts[id] ?? 0);
  const nextCount = currentlyFavorite ? Math.max(currentCount - 1, 0) : currentCount + 1;

  if (currentlyFavorite) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.push({
      ...resolvedPayload,
      id,
      favoriteCount: nextCount,
    });
  }

  const nextCounts = {
    ...favoriteCounts,
    [id]: nextCount,
  };

  await Promise.all([
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)),
    AsyncStorage.setItem(FAVORITE_COUNTS_KEY, JSON.stringify(nextCounts)),
  ]);

  return {
    isFavorite: !currentlyFavorite,
    favoriteCount: nextCount,
    meta: {
      favoriteIds: new Set<string>(favorites.map((fav: any) => String(fav.id))),
      favoriteCounts: nextCounts,
    },
  };
};

export const removeFavorite = async (foodId: string, userId?: string | null): Promise<void> => {
  if (userId) {
    try {
      await apiClient.delete(`/favorites/${encodeURIComponent(foodId)}?userId=${encodeURIComponent(userId)}`);
      return;
    } catch (error) {
      console.error('Error removing remote favorite:', error);
    }
  }

  const rawFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
  const favorites = rawFavorites ? JSON.parse(rawFavorites) : [];
  const updatedFavorites = (favorites || []).filter((item: any) => String(item.id) !== String(foodId));
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
};
