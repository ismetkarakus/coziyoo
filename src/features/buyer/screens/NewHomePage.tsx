import React, { useMemo, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { FilterModal, Text } from '../../../components/ui';
import { Spacing } from '../../../theme';
import { mockFoodService, MockFood } from '../../../services/mockFoodService';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { mockUserService } from '../../../services/mockUserService';
import { getFavoriteMeta, toggleFavorite } from '../../../services/favoriteService';
import { SearchFilters } from '../../../services/searchService';
import { categoryService, Category } from '../../../services/categoryService';

const PREVIEW_COLORS = {
  primary: '#8FA08E',
  primaryDark: '#305846',
  accent: '#5F7F5E',
  primarySoft: '#DCE5DC',
  background: '#F3F1EF',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#4B5563',
  textMuted: '#6B7280',
} as const;

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'Ana Yemek': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop',
  'Çorba': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
  'Meze': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
  'Tatlı': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop',
  'Kahvaltı': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop',
  'İçecek': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop',
  'Salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
};

export const NewHomePage: React.FC = () => {
  const { currentLanguage, t } = useTranslation();
  const { formatCurrency } = useCountry();
  const { addToCart, getRemainingStock, getTotalItems } = useCart();
  const cartItemCount = getTotalItems();
  const { user, userData } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [allergenModalVisible, setAllergenModalVisible] = useState(false);
  const [allergenMatches, setAllergenMatches] = useState<string[]>([]);
  const [pendingAllergenItem, setPendingAllergenItem] = useState<any | null>(null);
  const [publishedMeals, setPublishedMeals] = useState<any[]>([]);
  const [apiFoods, setApiFoods] = useState<MockFood[]>([]);
  const [categoryDefs, setCategoryDefs] = useState<Category[]>([]);

  const loadPublishedMeals = React.useCallback(async () => {
    try {
      const allFoods = await mockFoodService.getFoods();
      const normalized = allFoods.map((meal: any) => ({
        ...meal,
        currentStock: Number(meal?.currentStock ?? 0),
        dailyStock: Number(meal?.dailyStock ?? 0),
      }));
      const visible = normalized.filter((meal: any) => meal.isActive !== false && meal.currentStock > 0);
      setPublishedMeals(visible);
      setApiFoods(normalized);
    } catch (error) {
      console.error('Error loading foods in NewHomePage:', error);
      setPublishedMeals([]);
      setApiFoods([]);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPublishedMeals();
    }, [loadPublishedMeals])
  );

  React.useEffect(() => {
    const loadCategories = async () => {
      const records = await categoryService.getCategories(true);
      setCategoryDefs(records);
    };
    loadCategories();
  }, []);

  const getFoodIdentity = (food: any) =>
    `${String(food?.name ?? '').toLowerCase()}__${String(food?.cookName ?? '').toLowerCase()}`;
  const localizeCategory = (category: string): string => {
    if (currentLanguage === 'tr') return category;

    const map: Record<string, string> = {
      'Ana Yemek': 'Main Course',
      'Çorba': 'Soup',
      'Meze': 'Meze',
      'Tatlı': 'Dessert',
      'Tatlı/Kek': 'Dessert/Cake',
      'Vejetaryen': 'Vegetarian',
      'Kahvaltı': 'Breakfast',
      'İçecek': 'Drink',
      'Türk Mutfağı': 'Turkish Cuisine',
      'Çin Mutfağı': 'Chinese Cuisine',
      'Japon Mutfağı': 'Japanese Cuisine',
      'Meksika Mutfağı': 'Mexican Cuisine',
      'İspanya Mutfağı': 'Spanish Cuisine',
      'Hindistan Mutfağı': 'Indian Cuisine',
      'Hatay Mutfağı': 'Hatay Cuisine',
      'Trabzon Mutfağı': 'Trabzon Cuisine',
      'Maraş Mutfağı': 'Kahramanmaras Cuisine',
      'Hakkari Mutfağı': 'Hakkari Cuisine',
      'Muş Mutfağı': 'Mus Cuisine',
      'İtalyan Mutfağı': 'Italian Cuisine',
      'Fransız Mutfağı': 'French Cuisine',
      'Kore Mutfağı': 'Korean Cuisine',
      'Lübnan Mutfağı': 'Lebanese Cuisine',
    };
    return map[category] || category;
  };

  const getCuisineLabel = (food: MockFood): string => {
    const explicitCuisine = String(
      (food as any).country ||
      (food as any).kitchenName ||
      (food as any).cuisine ||
      ''
    ).trim();
    if (explicitCuisine) {
      return explicitCuisine;
    }

    const rawCategory = String(food.category || '').trim();
    if (rawCategory.includes('Mutfağı')) return rawCategory;

    const text = `${food.name || ''} ${food.cardSummary || ''} ${food.description || ''} ${food.country || ''}`.toLowerCase();

    if (text.includes('hatay')) return 'Hatay Mutfağı';
    if (text.includes('trabzon')) return 'Trabzon Mutfağı';
    if (text.includes('maraş') || text.includes('maras') || text.includes('kahramanmaraş') || text.includes('kahramanmaras')) return 'Maraş Mutfağı';
    if (text.includes('hakkari') || text.includes('hakari')) return 'Hakkari Mutfağı';
    if (text.includes('muş') || text.includes('mus')) return 'Muş Mutfağı';
    if (text.includes('çin') || text.includes('china')) return 'Çin Mutfağı';
    if (text.includes('japon') || text.includes('japan')) return 'Japon Mutfağı';
    if (text.includes('meksika') || text.includes('mexico')) return 'Meksika Mutfağı';
    if (text.includes('ispanya') || text.includes('spain')) return 'İspanya Mutfağı';
    if (text.includes('hindistan') || text.includes('india')) return 'Hindistan Mutfağı';
    if (text.includes('italya') || text.includes('italian') || text.includes('italy')) return 'İtalyan Mutfağı';
    if (text.includes('fransa') || text.includes('french') || text.includes('france')) return 'Fransız Mutfağı';
    if (text.includes('kore') || text.includes('korean') || text.includes('korea')) return 'Kore Mutfağı';
    if (text.includes('lübnan') || text.includes('lebanon') || text.includes('lebanese')) return 'Lübnan Mutfağı';
    if (text.includes('türk') || text.includes('turkish')) return 'Türk Mutfağı';
    if (text.includes('türkiye') || text.includes('turkey')) return 'Türk Mutfağı';

    return currentLanguage === 'en' ? 'Cuisine Not Specified' : 'Mutfak Belirtilmedi';
  };

  const getFoodImageByCategory = (category?: string): string => {
    const normalized = String(category || '').trim();
    if (normalized in CATEGORY_IMAGE_MAP) return CATEGORY_IMAGE_MAP[normalized];
    return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop';
  };

  const resolveFoodImage = (rawUrl: unknown, category?: string): string => {
    const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    if (!url) return getFoodImageByCategory(category);
    if (url.includes('picsum.photos') || url.includes('placehold.co')) {
      return getFoodImageByCategory(category);
    }
    return url;
  };

  const getDaysLeftFromEndDate = (value?: string): number | null => {
    if (!value) return null;
    const trimmed = String(value).trim();
    let parsed: Date | null = null;
    const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (dmyMatch) {
      const day = Number(dmyMatch[1]);
      const month = Number(dmyMatch[2]);
      const year = Number(dmyMatch[3]);
      parsed = new Date(year, month - 1, day);
    } else {
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric) && /^\d+$/.test(trimmed)) {
        const timestamp = trimmed.length <= 10 ? numeric * 1000 : numeric;
        parsed = new Date(timestamp);
      } else {
        parsed = new Date(trimmed);
      }
    }

    if (!parsed || Number.isNaN(parsed.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((parsed.getTime() - today.getTime()) / msPerDay);
  };

  const formatEndDate = (value?: string): string => {
    if (!value) return currentLanguage === 'en' ? 'Not specified' : 'Belirtilmedi';
    const daysLeft = getDaysLeftFromEndDate(value);
    if (daysLeft === null) return String(value).trim();

    if (daysLeft <= 0) {
      return currentLanguage === 'en' ? 'Sold out' : 'Tükendi';
    }
    if (daysLeft === 1) {
      return currentLanguage === 'en' ? 'LAST DAY' : 'SON GUN';
    }

    return currentLanguage === 'en' ? `${daysLeft} days left` : `${daysLeft} gün kaldı`;
  };

  const sourceFoods = useMemo(() => {
    const normalizedPublishedMeals = publishedMeals
      .map((meal) => ({
        ...meal,
        id: String(meal?.id ?? ''),
        name: String(meal?.name ?? ''),
        cookName: String(meal?.cookName ?? meal?.sellerName ?? 'Coziyoo'),
        rating: Number(meal?.rating ?? 4.8),
        price: Number(meal?.price ?? 0),
        category: String(meal?.category ?? 'Ana Yemek'),
        description: meal?.description,
        imageUrl: meal?.imageUrl,
        currentStock: Number(meal?.currentStock ?? 0),
        dailyStock: Number(meal?.dailyStock ?? 0),
        hasPickup: meal?.hasPickup === true,
        hasDelivery: meal?.hasDelivery !== false,
        deliveryFee: typeof meal?.deliveryFee === 'number' ? meal.deliveryFee : 0,
        availableDeliveryOptions:
          Array.isArray(meal?.availableDeliveryOptions) && meal.availableDeliveryOptions.length > 0
            ? meal.availableDeliveryOptions
            : [
                ...(meal?.hasDelivery !== false ? (['delivery'] as const) : []),
                ...(meal?.hasPickup === true ? (['pickup'] as const) : []),
              ],
        allergens: Array.isArray(meal?.allergens) ? meal.allergens : [],
      }));

    const visiblePublishedMeals = normalizedPublishedMeals
      .filter((meal) => meal.isActive !== false && meal.currentStock > 0);

    const publishedIdentities = new Set(normalizedPublishedMeals.map(getFoodIdentity));
    const fallbackFoods = apiFoods.filter((food) => !publishedIdentities.has(getFoodIdentity(food)));

    return [...visiblePublishedMeals, ...fallbackFoods];
  }, [publishedMeals, apiFoods]);

  const homeItems = useMemo(
    () =>
      sourceFoods.map((food: any) => ({
        id: food.id,
        cookId: String(food.cookId || food.sellerId || ''),
        title: food.name,
        price: formatCurrency(Number(food.price || 0)),
        numericPrice: Number(food.price || 0),
        cook: food.cookName,
        rating: Number(food.rating || 0),
        description:
          food.description ||
          food.cookDescription ||
          (currentLanguage === 'en'
            ? 'Homemade, fresh, and carefully prepared.'
            : 'Ev yapımı, taze ve özenli hazırlanır.'),
        category: localizeCategory(food.category || (currentLanguage === 'en' ? 'Main Course' : 'Ana Yemek')),
        cuisine: localizeCategory(getCuisineLabel(food)),
        kitchenName: localizeCategory(getCuisineLabel(food)),
        preparationTime: typeof food.preparationTime === 'number' ? food.preparationTime : 30,
        distance: typeof food.distance === 'string' ? food.distance : undefined,
        currentStock: getRemainingStock(
          String(food.id),
          typeof food.currentStock === 'number' ? food.currentStock : 0
        ),
        dailyStock: typeof food.dailyStock === 'number' ? food.dailyStock : 0,
        endDate: typeof food.endDate === 'string' ? food.endDate : undefined,
        hasPickup: food.hasPickup === true,
        hasDelivery: food.hasDelivery !== false,
        deliveryFee: typeof food.deliveryFee === 'number' ? food.deliveryFee : 0,
        availableOptions:
          Array.isArray(food.availableDeliveryOptions) && food.availableDeliveryOptions.length > 0
            ? food.availableDeliveryOptions
            : [
                ...(food.hasDelivery !== false ? (['delivery'] as const) : []),
                ...(food.hasPickup === true ? (['pickup'] as const) : []),
              ],
        allergens: food.allergens || [],
        img: resolveFoodImage(food.imageUrl, food.category),
        initialFavoriteCount: Number(food.favoriteCount ?? 0),
      })),
    [currentLanguage, formatCurrency, getRemainingStock, sourceFoods]
  );

  const normalizeCategoryText = React.useCallback(
    (value: string): string =>
      String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim(),
    []
  );

  const resolveCategoryIdFromValue = React.useCallback(
    (value: string): string => {
      const normalized = normalizeCategoryText(value);
      if (!normalized) return '';
      const matched = categoryDefs.find((category) => {
        return (
          normalizeCategoryText(category.id) === normalized ||
          normalizeCategoryText(category.nameTr) === normalized ||
          normalizeCategoryText(category.nameEn) === normalized
        );
      });
      return matched?.id || normalized;
    },
    [categoryDefs, normalizeCategoryText]
  );

  const categories = useMemo(() => {
    if (categoryDefs.length > 0) {
      return [
        { id: 'all', label: currentLanguage === 'en' ? 'All' : 'Tümü' },
        ...categoryDefs.map((category) => ({
          id: category.id,
          label: currentLanguage === 'en' ? category.nameEn : category.nameTr,
        })),
      ];
    }

    const uniqueCategories = Array.from(
      new Set(homeItems.map((item) => item.category).filter(Boolean))
    );
    const orderedCategories = uniqueCategories.sort((a, b) =>
      a.localeCompare(b, currentLanguage === 'en' ? 'en' : 'tr')
    );

    return [
      { id: 'all', label: currentLanguage === 'en' ? 'All' : 'Tümü' },
      ...orderedCategories.map((category) => ({ id: category, label: category })),
    ];
  }, [categoryDefs, currentLanguage, homeItems]);

  const getNumericDistance = (distanceValue?: string): number => {
    const numericDistance = Number(String(distanceValue || '').replace(',', '.').replace(/[^\d.]/g, ''));
    return Number.isFinite(numericDistance) ? numericDistance : Number.POSITIVE_INFINITY;
  };

  const filteredItems = useMemo(() => {
    const availableItems = homeItems.filter((item) => {
      if ((item.currentStock ?? 0) <= 0) return false;
      const daysLeft = getDaysLeftFromEndDate(item.endDate);
      if (daysLeft !== null && daysLeft <= 0) return false;
      return true;
    });

    let result =
      selectedCategoryId === 'all'
        ? availableItems
        : availableItems.filter((item) => resolveCategoryIdFromValue(item.category) === selectedCategoryId);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.cook.toLowerCase().includes(normalizedQuery) ||
        item.kitchenName.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.cuisine.toLowerCase().includes(normalizedQuery)
      );
    }

    if (searchFilters.category) {
      const normalizedFilter = String(searchFilters.category);
      const filterCategoryId =
        normalizedFilter === 'all' || normalizedFilter === 'All' || normalizedFilter === 'Tümü'
          ? 'all'
          : resolveCategoryIdFromValue(normalizedFilter);
      if (filterCategoryId !== 'all') {
        result = result.filter((item) => resolveCategoryIdFromValue(item.category) === filterCategoryId);
      }
    }

    if (searchFilters.priceRange) {
      result = result.filter(
        (item) =>
          item.numericPrice >= (searchFilters.priceRange?.min ?? 0) &&
          item.numericPrice <= (searchFilters.priceRange?.max ?? Number.POSITIVE_INFINITY)
      );
    }

    if (searchFilters.rating) {
      result = result.filter((item) => item.rating >= (searchFilters.rating || 0));
    }

    if (searchFilters.deliveryOptions?.length) {
      result = result.filter((item) =>
        searchFilters.deliveryOptions?.some((option) => item.availableOptions.includes(option))
      );
    }

    if (searchFilters.preparationTime?.max) {
      result = result.filter((item) => item.preparationTime <= (searchFilters.preparationTime?.max || 0));
    }

    if (searchFilters.maxDistance) {
      result = result.filter((item) => getNumericDistance(item.distance) <= (searchFilters.maxDistance || 0));
    }

    if (showNearbyOnly && userLocation) {
      result = result.filter((item) => getNumericDistance(item.distance) <= 3);
    }

    if (searchFilters.sortBy) {
      const sorted = [...result];
      switch (searchFilters.sortBy) {
        case 'price_asc':
          result = sorted.sort((a, b) => a.numericPrice - b.numericPrice);
          break;
        case 'price_desc':
          result = sorted.sort((a, b) => b.numericPrice - a.numericPrice);
          break;
        case 'rating_desc':
          result = sorted.sort((a, b) => b.rating - a.rating);
          break;
        case 'popularity':
          result = sorted.sort(
            (a, b) => (favoriteCounts[String(b.id)] ?? b.initialFavoriteCount) - (favoriteCounts[String(a.id)] ?? a.initialFavoriteCount)
          );
          break;
        default:
          break;
      }
    }

    return result;
  }, [homeItems, selectedCategoryId, showNearbyOnly, userLocation, searchFilters, favoriteCounts, searchQuery, resolveCategoryIdFromValue]);

  const handleNearbyPress = async (): Promise<void> => {
    if (showNearbyOnly) {
      setShowNearbyOnly(false);
      return;
    }

    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          currentLanguage === 'en' ? 'Location Permission' : 'Konum İzni',
          currentLanguage === 'en'
            ? 'Location permission is required to use nearby filter.'
            : 'Yakınımdaki filtresi için konum izni gereklidir.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setShowNearbyOnly(true);
    } catch (error) {
      console.error('Error getting location in NewHomePage:', error);
      Alert.alert(
        currentLanguage === 'en' ? 'Location Error' : 'Konum Hatası',
        currentLanguage === 'en'
          ? 'Could not fetch your location right now.'
          : 'Konumunuz şu an alınamadı.'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handleFilterPress = (): void => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (filters: SearchFilters): void => {
    setSearchFilters(filters);
    if (!filters.category || filters.category === 'all' || filters.category === 'All' || filters.category === 'Tümü') {
      setSelectedCategoryId('all');
      return;
    }
    setSelectedCategoryId(resolveCategoryIdFromValue(filters.category));
  };

  const openFoodDetail = (item: (typeof homeItems)[number]): void => {
    router.push(
      `/food-detail-order?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.title)}&cookName=${encodeURIComponent(item.cook)}&cookId=${encodeURIComponent(String(item.cookId || ''))}&imageUrl=${encodeURIComponent(item.img)}&price=${item.numericPrice}` as any
    );
  };

  React.useEffect(() => {
    const loadFavoriteState = async () => {
      try {
        const meta = await getFavoriteMeta(userData?.uid || user?.uid);
        setFavoriteIds(meta.favoriteIds);
        setFavoriteCounts(meta.favoriteCounts);
      } catch (error) {
        console.error('Error loading favorites state:', error);
      }
    };
    loadFavoriteState();
  }, []);

  const handleFavoritePress = async (item: (typeof homeItems)[number]): Promise<void> => {
    try {
      const result = await toggleFavorite({
        id: String(item.id),
        name: item.title,
        cookName: item.cook,
        price: item.numericPrice,
        rating: item.rating,
        imageUrl: item.img,
        category: item.category,
      }, userData?.uid || user?.uid);

      setFavoriteIds(result.meta.favoriteIds);
      setFavoriteCounts(result.meta.favoriteCounts);
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const addItemToCart = (item: (typeof homeItems)[number]): void => {
    const itemId = String(item.id);
    const liveStock = item.currentStock ?? 0;
    if (liveStock <= 0) {
      Alert.alert(
        currentLanguage === 'en' ? 'Out of Stock' : 'Stok Tükendi',
        currentLanguage === 'en' ? 'This meal is no longer available.' : 'Bu yemekten kalan stok bulunmuyor.'
      );
      return;
    }

    const cartCount = addToCart(
      {
        id: itemId,
        name: item.title,
        cookName: item.cook,
        price: item.numericPrice,
        imageUrl: item.img,
        currentStock: liveStock,
        dailyStock: item.dailyStock,
        availableOptions: item.availableOptions as ('pickup' | 'delivery')[],
        deliveryOption: item.availableOptions.length === 1 ? item.availableOptions[0] : undefined,
        deliveryFee: item.deliveryFee,
        allergens: item.allergens,
      },
      1
    );

    Toast.show({
      type: 'success',
      text1: t('foodCard.alerts.addToCartTitle'),
      text2: t('foodCard.alerts.addToCartMessage', { count: cartCount, name: item.title }),
      position: 'bottom',
      bottomOffset: 90,
      visibilityTime: 1800,
    });
  };

  const handleAddToCart = async (item: (typeof homeItems)[number]): Promise<void> => {
    const userRecord =
      (await mockUserService.getUserByUid(user?.uid || userData?.uid)) ||
      (await mockUserService.getUserByEmail(userData?.email || user?.email));
    const userAllergies = (userRecord?.allergicTo || []).map((allergen: string) => allergen.toLowerCase());
    const foodAllergens = (item.allergens || []).map((allergen: string) => allergen.toLowerCase());
    const matches = userAllergies.length > 0
      ? (item.allergens || []).filter((allergen: string) =>
          userAllergies.includes(allergen.toLowerCase())
        )
      : foodAllergens.length > 0
        ? [...(item.allergens || [])]
        : [];

    if (matches.length > 0) {
      setPendingAllergenItem(item);
      setAllergenMatches(matches);
      setAllergenModalVisible(true);
      return;
    }

    addItemToCart(item);
  };

  const closeAllergenModal = () => {
    setAllergenModalVisible(false);
    setAllergenMatches([]);
    setPendingAllergenItem(null);
  };

  const confirmAllergenAddToCart = () => {
    if (pendingAllergenItem) {
      addItemToCart(pendingAllergenItem);
    }
    closeAllergenModal();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleOpenCart = () => {
    router.push('/(buyer)/cart' as any);
  };

  const getRecentComments = (item: (typeof homeItems)[number]): Array<{ id: string; author: string; text: string; rating: number }> => {
    if (currentLanguage === 'en') {
      return [
        {
          id: `${item.id}-c1`,
          author: 'Aylin',
          text: `Very tasty ${item.title}. ${item.cook} cooks with real home quality.`,
          rating: Math.max(1, Math.min(5, Number(item.rating || 5))),
        },
        {
          id: `${item.id}-c2`,
          author: 'Murat',
          text: `${item.kitchenName} style is excellent. I will order again.`,
          rating: Math.max(1, Math.min(5, Number(item.rating || 5) - 0.3)),
        },
      ];
    }

    return [
      {
        id: `${item.id}-c1`,
        author: 'Aylin',
        text: `${item.title} cok lezzetliydi. ${item.cook} gercekten ev tadi veriyor.`,
        rating: Math.max(1, Math.min(5, Number(item.rating || 5))),
      },
      {
        id: `${item.id}-c2`,
        author: 'Murat',
        text: `${item.kitchenName} mutfagi tadi harika. Tekrar siparis veririm.`,
        rating: Math.max(1, Math.min(5, Number(item.rating || 5) - 0.3)),
      },
    ];
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.topSideHolder} />
          <View style={styles.heroCenter}>
            <Text style={styles.logo}>Coziyoo</Text>
            <Text style={styles.slogan}>
              {currentLanguage === 'en' ? 'Home Food · Nearby' : 'Ev Yemeği · Yakınında'}
            </Text>
          </View>
          <TouchableOpacity style={styles.cartTopButton} onPress={handleOpenCart} activeOpacity={0.8}>
            <MaterialIcons name="shopping-cart" size={18} color={PREVIEW_COLORS.text} />
            {cartItemCount > 0 ? (
              <View style={styles.cartTopBadge}>
                <Text style={styles.cartTopBadgeText}>{cartItemCount > 99 ? '99+' : String(cartItemCount)}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchInputWrap}>
            <MaterialIcons name="search" size={20} color="#7A7A7A" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={currentLanguage === 'en' ? 'What would you like to eat today?' : 'Bugün ne yemek istersin?'}
              placeholderTextColor="#7A7A7A"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.trim() ? (
              <TouchableOpacity
                onPress={handleClearSearch}
                activeOpacity={0.75}
                style={styles.searchClearButton}
              >
                <MaterialIcons name="close" size={18} color="#D22D2D" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.85} onPress={handleFilterPress}>
            <MaterialIcons name="filter-list" size={18} color="#7A7A7A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pinButton,
              showNearbyOnly ? styles.pinButtonActive : null,
              locationLoading ? styles.pinButtonDisabled : null,
            ]}
            onPress={() => void handleNearbyPress()}
            activeOpacity={0.85}
            disabled={locationLoading}
          >
            <MaterialIcons name="location-on" size={18} color="#D22D2D" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoriesWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategoryId === category.id ? styles.categoryChipActive : null,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedCategoryId(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategoryId === category.id ? styles.categoryTextActive : null,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRowInline}>
                <TouchableOpacity activeOpacity={0.85} onPress={() => openFoodDetail(item)} style={styles.contentPressable}>
                  <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.headerActions}>
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
            </View>

            <View style={styles.cardContentRow}>
              <View style={styles.imageColumn}>
                <View style={styles.imageWrap}>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => openFoodDetail(item)}>
                    <Image source={{ uri: item.img }} style={styles.cardImage} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardBody}>
                <TouchableOpacity
                  style={[styles.cardBodyTop, styles.contentPressable]}
                  activeOpacity={0.85}
                  onPress={() => openFoodDetail(item)}
                >
                  <Text style={styles.metaLabel}>
                    <Text style={[styles.metaValue, styles.foodNameValue]}>{item.cook}</Text>
                  </Text>
                  <Text style={styles.metaLabel}>
                    {currentLanguage === 'en' ? 'Kitchen Name' : 'Mutfak'}: <Text style={styles.metaValue}>{item.kitchenName}</Text>
                  </Text>
                  <View
                    style={[
                      styles.stockInlineBadge,
                      (item.currentStock ?? 0) <= 2 ? styles.stockInlineBadgeLow : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockInlineText,
                        (item.currentStock ?? 0) <= 2 ? styles.stockInlineTextLow : null,
                      ]}
                    >
                      {currentLanguage === 'en' ? `${item.currentStock ?? 0} piece left` : `${item.currentStock ?? 0} adet kaldi`}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.endDateRow}>
                  {(() => {
                    const daysLeft = getDaysLeftFromEndDate(item.endDate);
                    const isLastDay = daysLeft === 1;
                    return (
                      <Text style={styles.metaLabel}>
                        {currentLanguage === 'en' ? 'End Date' : 'Bitiş Tarihi'}:{' '}
                        {isLastDay ? (
                          <Text style={[styles.metaValue, styles.metaValueUrgentBadge]}>
                            {formatEndDate(item.endDate)}
                          </Text>
                        ) : (
                          <Text style={styles.metaValue}>{formatEndDate(item.endDate)}</Text>
                        )}
                      </Text>
                    );
                  })()}
                  <TouchableOpacity
                    style={[styles.favButton, styles.favButtonLarge]}
                    activeOpacity={0.85}
                    onPress={() => void handleFavoritePress(item)}
                  >
                    <MaterialIcons
                      name={favoriteIds.has(String(item.id)) ? 'favorite' : 'favorite-border'}
                      size={22}
                      color={favoriteIds.has(String(item.id)) ? '#E53935' : '#9CA3AF'}
                    />
                    {(favoriteCounts[String(item.id)] ?? item.initialFavoriteCount) > 0 ? (
                      <Text style={[styles.favoriteCount, styles.favoriteCountLarge]}>
                        {favoriteCounts[String(item.id)] ?? item.initialFavoriteCount}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.cardActions}>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.buyButton} activeOpacity={0.85} onPress={() => void handleAddToCart(item)}>
                  <Text style={styles.buyButtonText}>
                    {currentLanguage === 'en' ? 'BUY' : 'Sepete At'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailButton} activeOpacity={0.85} onPress={() => openFoodDetail(item)}>
                  <Text style={styles.detailButtonText}>
                    {currentLanguage === 'en' ? 'Details' : 'Incele'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.commentsSection}>
              {getRecentComments(item).slice(0, 1).map((comment) => (
                <View key={comment.id} style={styles.commentInline}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <View style={styles.commentStars}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <MaterialIcons
                          key={`${comment.id}-star-${index}`}
                          name={index < Math.round(comment.rating) ? 'star' : 'star-border'}
                          size={11}
                          color="#F59E0B"
                        />
                      ))}
                      <Text style={styles.commentRating}>{comment.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentText} numberOfLines={1}>
                    {comment.text}
                  </Text>
                </View>
              ))}
              <View style={styles.profileLinkRow}>
                <TouchableOpacity
                  style={styles.allCommentsButton}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(
                      `/seller-public-profile?cookName=${encodeURIComponent(item.cook)}&cookId=${encodeURIComponent(String(item.cookId || ''))}&section=comments` as any
                    )
                  }
                >
                  <Text style={styles.allCommentsButtonText}>
                    {currentLanguage === 'en' ? 'Show all comments' : 'Tüm yorumları gör'}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={14} color="#5F7F5E" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cookLinkInline}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(`/seller-public-profile?cookName=${encodeURIComponent(item.cook)}&cookId=${encodeURIComponent(String(item.cookId || ''))}` as any)
                  }
                >
                  <Text style={styles.cookInline} numberOfLines={1}>{item.cook}</Text>
                  <MaterialIcons name="arrow-forward" size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={searchFilters}
        categories={categories.filter((category) => category.id !== 'all')}
      />
      <Modal visible={allergenModalVisible} transparent animationType="fade" onRequestClose={closeAllergenModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Text style={styles.modalIconText}>!</Text>
              </View>
              <Text variant="subheading" weight="bold" style={styles.modalTitle}>
                {t('allergenWarning.title')}
              </Text>
            </View>
            <View style={styles.modalWarningBox}>
              <Text variant="body" style={styles.modalText}>
                {t('allergenWarning.warningMessage', { allergen: allergenMatches.join(', ') })}
              </Text>
              <Text variant="body" weight="bold" style={styles.modalAllergenText}>
                {allergenMatches.join(', ')}
              </Text>
              <Text variant="body" weight="bold" style={styles.modalEmphasis}>
                {t('allergenWarning.question')}
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={closeAllergenModal} activeOpacity={0.85}>
                <Text variant="body" weight="bold" style={styles.modalPrimaryButtonText}>
                  {t('allergenWarning.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={confirmAllergenAddToCart} activeOpacity={0.85}>
                <Text variant="body" weight="bold" style={styles.modalSecondaryButtonText}>
                  {t('allergenWarning.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PREVIEW_COLORS.background,
  },
  hero: {
    backgroundColor: PREVIEW_COLORS.primarySoft,
    paddingTop: 48,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  topSideHolder: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartTopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PREVIEW_COLORS.surface,
    borderWidth: 1,
    borderColor: PREVIEW_COLORS.border,
  },
  cartTopBadge: {
    position: 'absolute',
    top: -5,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartTopBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
  heroCenter: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: PREVIEW_COLORS.primaryDark,
  },
  slogan: {
    fontSize: 14,
    fontWeight: '600',
    color: PREVIEW_COLORS.accent,
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PREVIEW_COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PREVIEW_COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 2,
    gap: Spacing.xs,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchClearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  searchInput: {
    color: '#7A7A7A',
    fontSize: 15,
    flex: 1,
    paddingVertical: 8,
  },
  filterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F9',
  },
  pinButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F9',
  },
  pinButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  pinButtonDisabled: {
    opacity: 0.6,
  },
  categoriesWrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PREVIEW_COLORS.surface,
    borderWidth: 1,
    borderColor: PREVIEW_COLORS.border,
    marginRight: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: PREVIEW_COLORS.primary,
    borderColor: PREVIEW_COLORS.primary,
  },
  categoryText: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 6,
    paddingVertical: Spacing.sm,
    gap: 10,
  },
  card: {
    backgroundColor: PREVIEW_COLORS.surface,
    borderRadius: 18,
    paddingTop: 6,
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardImage: {
    width: 114,
    height: 96,
    borderRadius: 6,
  },
  imageWrap: {
    position: 'relative',
  },
  addButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: PREVIEW_COLORS.accent,
  },
  imageColumn: {
    width: 114,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: -2,
  },
  cardBody: {
    flex: 1,
    minHeight: 96,
    justifyContent: 'space-between',
  },
  cardBodyTop: {
    flexShrink: 1,
  },
  endDateRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  contentPressable: {
    alignSelf: 'flex-start',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  headerLeft: {
    flexShrink: 1,
    paddingVertical: 2,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favButton: {
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  favButtonLarge: {
    alignSelf: 'flex-end',
    minHeight: 30,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 0,
  },
  favoriteCount: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
  },
  favoriteCountLarge: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: PREVIEW_COLORS.text,
    lineHeight: 18,
    flexShrink: 1,
  },
  titleRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  stockInlineBadge: {
    backgroundColor: '#E8F4EC',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 2,
  },
  stockInlineBadgeLow: {
    backgroundColor: '#FEE4E2',
  },
  stockInlineText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2F6B58',
  },
  stockInlineTextLow: {
    color: '#B42318',
  },
  priceBadge: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  priceText: {
    color: PREVIEW_COLORS.accent,
    fontWeight: '800',
    fontSize: 14,
  },
  metaLabel: {
    color: PREVIEW_COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },
  metaValue: {
    color: PREVIEW_COLORS.text,
    fontWeight: '700',
  },
  foodNameValue: {
    fontSize: 16,
    lineHeight: 20,
  },
  metaValueUrgentBadge: {
    color: '#B42318',
    fontWeight: '900',
    backgroundColor: '#FEE4E2',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActions: {
    marginTop: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: PREVIEW_COLORS.accent,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  detailButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: PREVIEW_COLORS.accent,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonText: {
    color: PREVIEW_COLORS.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  commentsSection: {
    marginTop: 7,
    borderTopWidth: 1,
    borderTopColor: PREVIEW_COLORS.border,
    paddingTop: 6,
    gap: 4,
  },
  commentInline: {
    paddingHorizontal: 2,
    gap: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: PREVIEW_COLORS.text,
  },
  commentStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  commentRating: {
    marginLeft: 2,
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  commentText: {
    color: PREVIEW_COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  profileLinkRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  allCommentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CFE3D0',
    backgroundColor: '#EDF6EE',
  },
  allCommentsButtonText: {
    color: '#3B5F3F',
    fontSize: 12,
    fontWeight: '700',
  },
  cookInline: {
    color: PREVIEW_COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  cookLinkInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
    marginLeft: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE4E2',
  },
  modalIconText: {
    color: '#B42318',
    fontWeight: '800',
  },
  modalTitle: {
    color: '#111827',
  },
  modalWarningBox: {
    backgroundColor: '#FEF3F2',
    borderColor: '#FEE4E2',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalText: {
    color: '#374151',
    marginBottom: Spacing.xs,
  },
  modalAllergenText: {
    color: '#B42318',
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  modalEmphasis: {
    color: '#111827',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PREVIEW_COLORS.border,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryButtonText: {
    color: '#374151',
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PREVIEW_COLORS.accent,
  },
  modalSecondaryButtonText: {
    color: '#FFFFFF',
  },
});
