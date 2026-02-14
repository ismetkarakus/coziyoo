import AsyncStorage from '@react-native-async-storage/async-storage';
import foods from '../mock/foods.json';
import { MockFood } from '../mock/data';

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
  const counts: Record<string, number> = {};
  (foods as MockFood[]).forEach((food) => {
    counts[String(food.id)] = Math.max(0, Number(food.favoriteCount ?? 0));
  });
  return counts;
};

export const getFavoriteMeta = async (): Promise<FavoriteMeta> => {
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
  payload: FavoritePayload
): Promise<{ isFavorite: boolean; favoriteCount: number; meta: FavoriteMeta }> => {
  const id = String(payload.id);
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
      ...payload,
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
