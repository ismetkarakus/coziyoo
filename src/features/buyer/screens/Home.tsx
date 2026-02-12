import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TextInput, Alert, Modal } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, FoodCard, SearchBar, FilterModal, Button } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useCountry } from '../../../context/CountryContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { foodService, Food } from '../../../services/foodService';
import { searchService, SearchFilters } from '../../../services/searchService';
import { seedSampleData, checkExistingData } from '../../../utils/seedData';
import { mockFoodService } from '../../../services/mockFoodService';
import { mockUserService } from '../../../services/mockUserService';
import { MockFood } from '../../../mock/data';
import sellerMock from '../../../mock/seller.json';
import categoriesData from '../../../mock/categories.json';
import { getLatestSyncedOrderStatus } from '../../../utils/orderStatusSync';

const getCategoriesForLanguage = (language: 'tr' | 'en') => {
  const items = categoriesData.items ?? [];
  return items.map((item) => (language === 'tr' ? item.tr : item.en));
};

const MONTH_MAP_TR_TO_EN: Record<string, string> = {
  Ocak: 'Jan',
  Şubat: 'Feb',
  Mart: 'Mar',
  Nisan: 'Apr',
  Mayıs: 'May',
  Haziran: 'Jun',
  Temmuz: 'Jul',
  Ağustos: 'Aug',
  Eylül: 'Sep',
  Ekim: 'Oct',
  Kasım: 'Nov',
  Aralık: 'Dec',
};

const translateDateRangeToEn = (value: string) => {
  const match = value.match(/^(\d+\s*[–-]\s*\d+)\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)$/);
  if (!match) return value;
  const range = match[1].replace(/\s+/g, '');
  const month = MONTH_MAP_TR_TO_EN[match[2]] || match[2];
  return `${month} ${range}`;
};

const translateCategoryToEn = (category: string) => {
  const mapping: Record<string, string> = (categoriesData.items ?? []).reduce(
    (acc: Record<string, string>, item) => {
      acc[item.tr] = item.en;
      return acc;
    },
    {}
  );
  return mapping[category] || category;
};

const translateFoodNameToEn = (name: string) => {
  const mapping: Record<string, string> = {
    'Ev Yapımı Mantı': 'Homemade Manti',
    'Karnıyarık': 'Stuffed Eggplant',
    'İskender Kebap': 'Iskender Kebab',
    'Mercimek Çorbası': 'Lentil Soup',
    'Tarhana Çorbası': 'Tarhana Soup',
    'Serpme Kahvaltı': 'Turkish Breakfast',
    'Menemen': 'Menemen',
    'Çoban Salata': 'Shepherd Salad',
    'Mevsim Salata': 'Seasonal Salad',
    'Kısır': 'Bulgur Salad',
    'Zeytinyağlı Yaprak Sarma': 'Stuffed Vine Leaves',
    'Sigara Böreği': 'Cheese Pastry Rolls',
    'Kıymalı Börek': 'Minced Meat Pastry',
    'Karışık Meze Tabağı': 'Mixed Meze Platter',
    'Acılı Ezme': 'Spicy Ezme',
    'Vejetaryen Köfte': 'Vegetarian Patties',
    'Sebze Güveç': 'Vegetable Casserole',
    'Sütlaç': 'Rice Pudding',
    'Baklava': 'Baklava',
    'Revani': 'Semolina Cake',
    'Profiterol': 'Profiterole',
    'Ev Yapımı Kek': 'Homemade Cake',
    'Ev Yapımı Sütlaç': 'Homemade Rice Pudding',
    'Glutensiz Ekmek': 'Gluten-Free Bread',
    'Glutensiz Kurabiye': 'Gluten-Free Cookies',
    'Roka Salata': 'Arugula Salad',
    'Ev Yapımı Ayran': 'Homemade Ayran',
    'Taze Sıkılmış Portakal Suyu': 'Fresh Orange Juice',
    'Ayran': 'Ayran',
    'Şalgam': 'Salgam',
  };
  return mapping[name] || name;
};

const translateCookNameToEn = (name: string) => {
  const mapping: Record<string, string> = {
    'Ayşe Hanım': 'Ayse Hanim',
    'Mehmet Usta': 'Mehmet Usta',
    'Ali Usta': 'Ali Usta',
    'Zeynep Hanım': 'Zeynep Hanim',
    'Fatma Teyze': 'Fatma Teyze',
    'Hasan Usta': 'Hasan Usta',
    'Gül Teyze': 'Gul Teyze',
    'Zehra Hanım': 'Zehra Hanim',
    'Elif Hanım': 'Elif Hanim',
  };
  return mapping[name] || name;
};

const localizeMockFoods = (foods: MockFood[], language: 'tr' | 'en') => {
  if (language === 'tr') {
    return foods;
  }
  return foods.map((food) => ({
    ...food,
    name: translateFoodNameToEn(food.name),
    cookName: translateCookNameToEn(food.cookName),
    category: translateCategoryToEn(food.category),
    availableDates: food.availableDates ? translateDateRangeToEn(food.availableDates) : undefined,
  }));
};

const getVisiblePublishedMeals = (meals: any[]) =>
  meals
    .map((meal) => ({
      ...meal,
      currentStock: Number(meal?.currentStock ?? 0),
      dailyStock: Number(meal?.dailyStock ?? 0),
    }))
    .filter((meal) => meal?.isActive !== false && meal.currentStock > 0);

const getFoodIdentity = (food: any) =>
  `${String(food?.name ?? '').toLowerCase()}__${String(food?.cookName ?? food?.sellerName ?? '').toLowerCase()}`;

export const Home: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { currentCountry, formatCurrency } = useCountry();
  const { t, currentLanguage } = useTranslation();
  const localizedSeller = (sellerMock as any)[currentLanguage] ?? sellerMock.tr;
  const [sellerNickname, setSellerNickname] = useState<string>(localizedSeller.profile.nickname?.trim() || '');
  const getDisplayCookName = (name: string) => (sellerNickname ? sellerNickname : name);
  const params = useLocalSearchParams();
  const { getTotalItems } = useCart();
  const { user, userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = useMemo(() => getCategoriesForLanguage(currentLanguage), [currentLanguage]);
  const defaultCategory = categories[0] ?? '';
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [rawMockFoods, setRawMockFoods] = useState<MockFood[]>([]);
  const mockFoods = useMemo(
    () => localizeMockFoods(rawMockFoods, currentLanguage),
    [rawMockFoods, currentLanguage]
  );
  useEffect(() => {
    if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory]);

  useEffect(() => {
    const loadSellerNickname = async () => {
      setSellerNickname(localizedSeller.profile.nickname?.trim() || '');
      try {
        const savedProfile = await AsyncStorage.getItem('sellerProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          const nickname = profile?.formData?.nickname?.trim();
          if (nickname) {
            setSellerNickname(nickname);
          }
        }
      } catch (error) {
        console.error('Error loading seller nickname:', error);
      }
    };

    loadSellerNickname();
  }, [currentLanguage, localizedSeller.profile.nickname]);

  const loadLatestOrderStatus = React.useCallback(async () => {
    try {
      const latest = await getLatestSyncedOrderStatus();
      if (!latest) {
        setLatestOrderStatus(null);
        return;
      }

      setLatestOrderStatus({
        orderId: latest.orderId,
        statusLabel: getChatStatusLabel(latest.statusKey),
      });
    } catch (error) {
      console.error('Error loading latest synced order status:', error);
      setLatestOrderStatus(null);
    }
  }, [currentLanguage]);

  useEffect(() => {
    loadLatestOrderStatus();
  }, [loadLatestOrderStatus]);

  useFocusEffect(
    React.useCallback(() => {
      loadLatestOrderStatus();
    }, [loadLatestOrderStatus])
  );

  const [foodStocks, setFoodStocks] = useState<{[key: string]: number}>({});
  const [scrollY, setScrollY] = useState(0);
  const [publishedMeals, setPublishedMeals] = useState<any[]>([]);
  const [cookFilter, setCookFilter] = useState<string>('');
  const [firebaseFoods, setFirebaseFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { addToCart } = useCart();
  const { sendLowStockNotification } = useNotifications();
  const [allergenModalVisible, setAllergenModalVisible] = useState(false);
  const [allergenModalMatches, setAllergenModalMatches] = useState<string[]>([]);
  const [allergenConfirmChecked, setAllergenConfirmChecked] = useState(false);
  const [latestOrderStatus, setLatestOrderStatus] = useState<{ orderId: string; statusLabel: string } | null>(null);
  const [pendingAdd, setPendingAdd] = useState<{
    food: any;
    quantity: number;
    deliveryOption?: 'pickup' | 'delivery';
    availableOptions: ('pickup' | 'delivery')[];
    parsedDeliveryFee: number;
    originalId: string;
    foodId: string;
    currentStock: number;
    newStock: number;
    firebaseFood: Food | undefined;
  } | null>(null);

  const nearbyTerms = [
    t('homeScreen.nearbyQuery'),
    t('homeScreen.nearbyAlt1'),
    t('homeScreen.nearbyAlt2'),
    t('homeScreen.nearbyAlt3'),
  ];
  const turkishKeywords = currentLanguage === 'tr' ? ['türk', 'türkiye'] : ['turkish', 'turkey'];

  const getChatStatusLabel = (statusKey: string) => {
    switch (statusKey) {
      case 'preparing':
        return t('chatListScreen.statuses.preparing');
      case 'ready':
        return t('chatListScreen.statuses.ready');
      case 'onTheWay':
        return t('chatListScreen.statuses.onTheWay');
      case 'delivered':
        return t('chatListScreen.statuses.delivered');
      default:
        return t('chatListScreen.statuses.preparing');
    }
  };


  const loadMockFoods = async () => {
    setLoading(true);
    try {
      const foods = await mockFoodService.getFoods();
      setRawMockFoods(foods);
    } catch (error) {
      console.error('Error loading mock foods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load mock foods (fake API)
  useEffect(() => {
    loadMockFoods();
  }, []);

  const loadFirebaseFoods = async () => {
    // Firebase loading disabled for now
    setFirebaseFoods([]);
    setLoading(false);
  };

  // Handle cook filter from params
  useEffect(() => {
    console.log('Home params:', params);
    if (params.filterByCook && params.showCookFilter) {
      console.log('Setting cook filter to:', params.filterByCook);
      setCookFilter(params.filterByCook as string);
      setSearchQuery(''); // Clear search when filtering by cook
      setSelectedCategory(defaultCategory); // Reset category when filtering by cook
    } else if (!params.filterByCook && !params.showCookFilter) {
      // Clear cook filter if no params
      setCookFilter('');
    }
  }, [params.filterByCook, params.showCookFilter, defaultCategory]);

  // Load published meals from AsyncStorage
  useEffect(() => {
    const loadPublishedMeals = async () => {
      try {
        const publishedMealsJson = await AsyncStorage.getItem('publishedMeals');
        if (publishedMealsJson) {
          const meals = JSON.parse(publishedMealsJson);
          const visibleMeals = getVisiblePublishedMeals(meals);
          setPublishedMeals(visibleMeals);
          setFoodStocks((prev) => {
            const next = { ...prev };
            visibleMeals.forEach((meal) => {
              if (meal?.id) {
                next[String(meal.id)] = Number(meal.currentStock ?? 0);
              }
            });
            return next;
          });
        } else {
          setPublishedMeals([]);
        }
      } catch (error) {
        console.error('Error loading published meals:', error);
      }
    };

    loadPublishedMeals();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadPublishedMeals = async () => {
        try {
          const publishedMealsJson = await AsyncStorage.getItem('publishedMeals');
          if (publishedMealsJson) {
            const meals = JSON.parse(publishedMealsJson);
            const visibleMeals = getVisiblePublishedMeals(meals);
            setPublishedMeals(visibleMeals);
            setFoodStocks((prev) => {
              const next = { ...prev };
              visibleMeals.forEach((meal) => {
                if (meal?.id) {
                  next[String(meal.id)] = Number(meal.currentStock ?? 0);
                }
              });
              return next;
            });
          } else {
            setPublishedMeals([]);
          }
        } catch (error) {
          console.error('Focus - Error loading published meals:', error);
        }
      };

      const loadCookFilter = async () => {
        try {
          const savedCookFilter = await AsyncStorage.getItem('cookFilter');
          if (savedCookFilter) {
            console.log('Loading cook filter from storage:', savedCookFilter);
            setCookFilter(savedCookFilter);
            setSearchQuery(''); // Clear search when filtering by cook
            setSelectedCategory(defaultCategory); // Reset category when filtering by cook
            // Clear the filter from storage after using it
            await AsyncStorage.removeItem('cookFilter');
          }
        } catch (error) {
          console.error('Error loading cook filter:', error);
        }
      };

      loadPublishedMeals();
      loadCookFilter();
      loadMockFoods(); // Reload mock data on focus
    }, [defaultCategory])
  );

  // Firebase bağlantısını reset et
  const handleResetFirebase = async () => {
    try {
      console.log('🔄 Resetting Firebase connection...');
      // @ts-ignore
      await FirebaseUtils.resetConnection();
      
      // Verileri yeniden yükle
      await loadFirebaseFoods();
      
      Alert.alert(t('homeScreen.alerts.firebaseResetSuccessTitle'), t('homeScreen.alerts.firebaseResetSuccessMessage'));
    } catch (error) {
      console.error('❌ Reset failed:', error);
      Alert.alert(t('homeScreen.alerts.firebaseResetErrorTitle'), t('homeScreen.alerts.firebaseResetErrorMessage'));
    }
  };

  const finalizeAddToCart = async (payload: {
    food: any;
    quantity: number;
    deliveryOption?: 'pickup' | 'delivery';
    availableOptions: ('pickup' | 'delivery')[];
    parsedDeliveryFee: number;
    originalId: string;
    foodId: string;
    currentStock: number;
    newStock: number;
    firebaseFood: Food | undefined;
  }) => {
    try {
      const {
        food,
        quantity: finalQuantity,
        deliveryOption: finalDeliveryOption,
        availableOptions,
        parsedDeliveryFee,
        originalId,
        foodId,
        newStock,
        firebaseFood,
      } = payload;

      // Update local stock state immediately for UI feedback
      setFoodStocks(prev => ({
        ...prev,
        [originalId]: newStock,
      }));

      // If it's a Firebase food, update in Firebase too
      if (firebaseFood) {
        // @ts-ignore
        await foodService.updateFoodStock(foodId, newStock, sendLowStockNotification);
      }

      addToCart({
        id: food.id!,
        name: food.name,
        cookName: food.cookName,
        price: food.price,
        imageUrl: food.imageUrl || undefined,
        currentStock: newStock,
        dailyStock: food.dailyStock || 0,
        deliveryOption: finalDeliveryOption,
        availableOptions: availableOptions,
        deliveryFee: food.hasDelivery ? (Number.isFinite(parsedDeliveryFee) ? parsedDeliveryFee : 0) : 0,
        allergens: food.allergens || [],
      }, finalQuantity);
      
      console.log(`Added ${finalQuantity} of ${food.name} to cart. Remaining stock: ${newStock}`);
      
      // Send low stock notification if needed
      if (newStock <= 2) {
        sendLowStockNotification(food.name, newStock);
      }
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      // Revert local stock change on error
      setFoodStocks(prev => ({
        ...prev,
        [payload.originalId]: payload.currentStock
      }));
      Alert.alert(t('homeScreen.alerts.stockUpdateErrorTitle'), t('homeScreen.alerts.stockUpdateErrorMessage'));
      return false;
    }
  };

  const handleAddToCart = async (foodId: string, quantity: number, deliveryOption?: 'pickup' | 'delivery') => {
    // ID prefix'ini temizle ve orijinal ID'yi bul
    const originalId = foodId.replace(/^(firebase_|mock_|published_)/, '');
    
    // Check all food sources with original ID
    const firebaseFood = firebaseFoods.find(f => f.id === originalId);
    const mockFood = mockFoods.find(f => f.id === originalId);
    const publishedFood = publishedMeals.find(f => f.id === originalId);
    const food = firebaseFood || mockFood || publishedFood;
    
    if (food && quantity > 0) {
      // Get current stock (from foodStocks state or original stock)
      const currentStock = foodStocks[originalId] ?? food.currentStock ?? 0;
      
      if (currentStock >= quantity) {
        try {
          const newStock = currentStock - quantity;

          // Allergen check
          const userRecord =
            (await mockUserService.getUserByUid(user?.uid || userData?.uid)) ||
            (await mockUserService.getUserByEmail(userData?.email || user?.email));
          const userAllergies = (userRecord?.allergicTo || []).map(item => item.toLowerCase());
          const foodAllergens = (food.allergens || []).map((item: string) => item.toLowerCase());
          const matches = foodAllergens.filter((allergen: string) => userAllergies.includes(allergen));

          // Determine available options
          const availableOptions: ('pickup' | 'delivery')[] = Array.isArray((food as any).availableDeliveryOptions)
            && (food as any).availableDeliveryOptions.length > 0
              ? (food as any).availableDeliveryOptions
              : [];
          if (availableOptions.length === 0) {
            if (food.hasPickup) availableOptions.push('pickup');
            if (food.hasDelivery) availableOptions.push('delivery');
          }
          
          // Set default delivery option if not provided
          const finalDeliveryOption = deliveryOption || (availableOptions.length === 1 ? availableOptions[0] : undefined);
          
          const rawDeliveryFee = (food as any).deliveryFee;
          const parsedDeliveryFee =
            typeof rawDeliveryFee === 'number'
              ? rawDeliveryFee
              : typeof rawDeliveryFee === 'string'
                ? parseFloat(rawDeliveryFee)
                : 0;

          if (matches.length > 0) {
            setAllergenModalMatches(matches);
            setAllergenConfirmChecked(false);
            setPendingAdd({
              food,
              quantity,
              deliveryOption: finalDeliveryOption,
              availableOptions,
              parsedDeliveryFee,
              originalId,
              foodId,
              currentStock,
              newStock,
              firebaseFood,
            });
            setAllergenModalVisible(true);
            return false;
          }

          const added = await finalizeAddToCart({
            food,
            quantity,
            deliveryOption: finalDeliveryOption,
            availableOptions,
            parsedDeliveryFee,
            originalId,
            foodId,
            currentStock,
            newStock,
            firebaseFood,
          });
          if (added) {
            Toast.show({
              type: 'success',
              text1: t('foodCard.alerts.addToCartTitle'),
              text2: t('foodCard.alerts.addToCartMessage', { count: quantity, name: food.name }),
              position: 'bottom',
              bottomOffset: 90,
              visibilityTime: 1800,
            });
          }
          return added;
        } catch (error) {
          console.error('Error updating stock:', error);
          // Revert local stock change on error
          setFoodStocks(prev => ({
            ...prev,
            [originalId]: currentStock
          }));
          Alert.alert(t('homeScreen.alerts.stockUpdateErrorTitle'), t('homeScreen.alerts.stockUpdateErrorMessage'));
          return false;
        }
      } else {
        Alert.alert(t('homeScreen.alerts.stockInsufficientTitle'), t('homeScreen.alerts.stockInsufficientMessage', { count: currentStock }));
        return false;
      }
    }
    return false;
  };

  const handleFoodPress = (food: any) => {
    const foodImageUrl = food.imageUrl || '';
    router.push({
      pathname: '/food-detail-order',
      params: {
        id: String(food.id),
        name: String(food.name),
        cookName: String(food.cookName || ''),
        imageUrl: String(foodImageUrl),
        price: String(food.price),
      },
    } as any);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    // If we have active search or filters, re-run search with new category
    if (searchQuery.trim() || Object.keys(searchFilters).length > 0) {
      performSearch(searchQuery, searchFilters);
    }
  };

  // Advanced search with filters
  const performSearch = async (query: string = searchQuery, filters: SearchFilters = searchFilters) => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const searchParams: SearchFilters = {
        ...filters,
        query: query.trim() || undefined,
        category: selectedCategory !== defaultCategory ? selectedCategory : filters.category,
      };

      const result = await searchService.searchFoods(searchParams);
      setSearchResults(result.foods);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(t('homeScreen.alerts.searchErrorTitle'), t('homeScreen.alerts.searchErrorMessage'));
    } finally {
      setIsSearching(false);
    }
  };

  // Get enhanced autocomplete suggestions
  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Get suggestions from search service
      // @ts-ignore
      const autocompleteSuggestions = await searchService.getAutocompleteSuggestions(query);
      
      // Add local suggestions from current data
      const localSuggestions = getLocalSuggestions(query);
      
      // Combine and deduplicate
      const allSuggestions = [...new Set([...autocompleteSuggestions, ...localSuggestions])];
      
      setSuggestions(allSuggestions.slice(0, 8)); // Limit to 8 suggestions
    } catch (error) {
      console.error('Error getting suggestions:', error);
      // Fallback to local suggestions only
      setSuggestions(getLocalSuggestions(query));
    }
  };

  // Generate local suggestions from current food data
  const getLocalSuggestions = (query: string) => {
    const searchTerm = query.toLowerCase().trim();
    const publishedFoodKeys = new Set(publishedMeals.map(getFoodIdentity));
    const mockFoodsWithoutPublishedDuplicates = mockFoods.filter(
      (food) => !publishedFoodKeys.has(getFoodIdentity(food))
    );
    const allFoods = [
      ...firebaseFoods.map(food => ({ ...food, id: `firebase_${food.id}` })),
      ...mockFoodsWithoutPublishedDuplicates.map(food => ({ ...food, id: `mock_${food.id}` })),
      ...publishedMeals.map(food => ({ ...food, id: `published_${food.id}` }))
    ];
    const suggestions: string[] = [];
    
    // Add nearby suggestion if query matches
    if (nearbyTerms.some(term => term.toLowerCase().includes(searchTerm))) {
      suggestions.push(t('homeScreen.nearbyAlt1'));
    }
    
    allFoods.forEach(food => {
      // Food name suggestions
      if (food.name?.toLowerCase().includes(searchTerm) && !suggestions.includes(food.name)) {
        suggestions.push(food.name);
      }
      
      // Cook name suggestions
      if (food.cookName?.toLowerCase().includes(searchTerm) && !suggestions.includes(food.cookName)) {
        suggestions.push(food.cookName);
      }
      
      // Category suggestions
      if (food.category?.toLowerCase().includes(searchTerm) && !suggestions.includes(food.category)) {
        suggestions.push(food.category);
      }
    });
    
    // Add country suggestions
    if (turkishKeywords.some(keyword => keyword.includes(searchTerm))) {
      suggestions.push(t('homeScreen.turkishFood'));
    }
    
    return suggestions.slice(0, 5); // Limit local suggestions
  };

  // Get user's current location
  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('homeScreen.alerts.locationPermissionTitle'), t('homeScreen.alerts.locationPermissionMessage'));
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userCoords);
      return userCoords;
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(t('homeScreen.alerts.locationErrorTitle'), t('homeScreen.alerts.locationErrorMessage'));
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Sort foods by real distance from user location
  const sortFoodsByRealDistance = (foods: any[], userCoords: {latitude: number, longitude: number}) => {
    // Mock seller locations (in real app, this would come from database)
    const sellerLocations: { [key: string]: {latitude: number, longitude: number} } = {
      'Ayşe Hanım': { latitude: 41.0082, longitude: 28.9784 }, // Istanbul center
      'Mehmet Usta': { latitude: 41.0150, longitude: 28.9850 }, // Slightly north
      'Fatma Teyze': { latitude: 41.0050, longitude: 28.9700 }, // Slightly south
      'Zehra Hanım': { latitude: 41.0120, longitude: 28.9800 }, // Nearby
      'Hasan Usta': { latitude: 41.0200, longitude: 28.9900 }, // Further north
      'Gül Teyze': { latitude: 41.0000, longitude: 28.9650 }, // Southwest
      'Elif Hanım': { latitude: 41.0180, longitude: 28.9750 }, // Northwest
    };

    return foods.map(food => {
      const sellerCoords = sellerLocations[food.cookName];
      if (sellerCoords) {
        const distance = calculateDistance(
          userCoords.latitude, 
          userCoords.longitude, 
          sellerCoords.latitude, 
          sellerCoords.longitude
        );
        return {
          ...food,
          realDistance: distance,
          distance: distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`
        };
      }
      return { ...food, realDistance: 999 };
    }).sort((a, b) => (a.realDistance || 999) - (b.realDistance || 999));
  };

  // Sort foods by distance (closest first) - fallback method
  const sortFoodsByDistance = (foods: any[]) => {
    return foods.sort((a, b) => {
      // Extract numeric distance from strings like "2.5 km" or "900 m"
      const getDistanceValue = (distanceStr: string) => {
        if (!distanceStr) return 999; // Put items without distance at the end
        
        const match = distanceStr.match(/(\d+\.?\d*)\s*(km|m)/i);
        if (!match) return 999;
        
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        
        // Convert to km for comparison
        return unit === 'm' ? value / 1000 : value;
      };
      
      const distanceA = getDistanceValue(a.distance || '');
      const distanceB = getDistanceValue(b.distance || '');
      
      return distanceA - distanceB;
    });
  };

  // Enhanced search function for food name, country, cook name, and proximity
  const performLocalSearch = (query: string, foods: any[]) => {
    if (!query.trim()) return foods;
    
    const searchTerm = query.toLowerCase().trim();
    
    // Special case: nearby search
    const nearbyLower = nearbyTerms.map(term => term.toLowerCase());
    if (nearbyLower.includes(searchTerm)) {
      return sortFoodsByDistance([...foods]);
    }
    
    const filteredFoods = foods.filter(food => {
      // Search in food name
      const nameMatch = food.name?.toLowerCase().includes(searchTerm);
      
      // Search in cook name (usta/aşçı)
      const cookMatch = food.cookName?.toLowerCase().includes(searchTerm);
      
      // Search in country (ülke)
      const turkishMatch = turkishKeywords.some(keyword => searchTerm.includes(keyword));
      const countryMatch = food.country?.toLowerCase().includes(searchTerm) ||
        (turkishMatch && (food.country === 'Türk' || food.country === 'Turkish' || food.country === t('homeScreen.turkishFood')));
      
      // Search in category
      const categoryMatch = food.category?.toLowerCase().includes(searchTerm);
      
      // Search in description if available
      const descriptionMatch = food.description?.toLowerCase().includes(searchTerm);
      
      return nameMatch || cookMatch || countryMatch || categoryMatch || descriptionMatch;
    });
    
    return filteredFoods;
  };

  // Filter foods based on selected category, search query, and cook filter (fallback)
  const getFilteredFoods = () => {
    // If we have search results from advanced search, use them
    if (isSearching || (searchResults.length > 0 && Object.keys(searchFilters).length > 0)) {
      return searchResults;
    }

    const publishedFoodKeys = new Set(publishedMeals.map(getFoodIdentity));
    const mockFoodsWithoutPublishedDuplicates = mockFoods.filter(
      (food) => !publishedFoodKeys.has(getFoodIdentity(food))
    );

    // Otherwise use local filtering - unique ID'ler için prefix ekle
    let foods = [
      ...firebaseFoods.map(food => ({ ...food, id: `firebase_${food.id}` })),
      ...mockFoodsWithoutPublishedDuplicates.map(food => ({ ...food, id: `mock_${food.id}` })),
      ...publishedMeals.map(food => ({ ...food, id: `published_${food.id}` }))
    ];
    
    // First filter by cook if specified
    if (cookFilter.trim()) {
      foods = foods.filter(food => food.cookName === cookFilter);
    }
    
    // Then filter by category
    if (selectedCategory !== defaultCategory) {
      foods = foods.filter(food => food.category === selectedCategory);
    }
    
    // Apply local search if there's a search query
    if (searchQuery.trim()) {
      foods = performLocalSearch(searchQuery, foods);
    }
    
    return foods;
  };

  // Search event handlers
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    getSuggestions(text);
  };

  const handleSearchSubmit = (text: string) => {
    performSearch(text, searchFilters);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    performSearch(suggestion, searchFilters);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (filters: SearchFilters) => {
    setSearchFilters(filters);
    performSearch(searchQuery, filters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchFilters.category && searchFilters.category !== selectedCategory) count++;
    if (searchFilters.priceRange) count++;
    if (searchFilters.rating) count++;
    if (searchFilters.deliveryOptions?.length) count++;
    if (searchFilters.maxDistance) count++;
    if (searchFilters.preparationTime) count++;
    if (searchFilters.sortBy && searchFilters.sortBy !== 'newest') count++;
    return count;
  };

  const filteredFoods = getFilteredFoods();

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);
  };

  // Calculate TopBar opacity based on scroll position
  const topBarOpacity = Math.max(0.3, Math.min(1, 1 - scrollY / 100));

  const handleProfilePress = () => {
    router.push('/(buyer)/buyer-profile');
  };



  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <Modal
        visible={allergenModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Text variant="caption" weight="bold" style={styles.modalIconText}>!</Text>
              </View>
              <Text variant="subheading" weight="bold" style={styles.modalTitle}>
                {t('allergenWarning.title')}
              </Text>
            </View>
            <View style={styles.modalWarningBox}>
              <Text variant="body" style={styles.modalText}>
                {t('allergenWarning.warningMessage', { allergen: allergenModalMatches.join(', ') })}
              </Text>
              <Text variant="body" weight="bold" style={styles.modalEmphasis}>
                {t('allergenWarning.question')}
              </Text>
              <Text variant="caption" style={styles.modalSecondary}>
                {t('allergenWarning.unsure')}
              </Text>
            </View>
            <View style={styles.modalChip}>
              <Text variant="caption" weight="bold" style={styles.modalChipText}>
                {t('allergenWarning.chipLabel', { allergen: allergenModalMatches.join(', ') })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCheckboxRow}
              onPress={() => setAllergenConfirmChecked(prev => !prev)}
              activeOpacity={0.8}
            >
              <View style={[styles.modalCheckbox, allergenConfirmChecked && styles.modalCheckboxChecked]}>
                {allergenConfirmChecked && <Text style={styles.modalCheckboxCheck}>✓</Text>}
              </View>
              <Text variant="caption" style={styles.modalSecondary}>
                {t('allergenWarning.acknowledge')}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={() => {
                  setAllergenModalVisible(false);
                  setPendingAdd(null);
                  setAllergenModalMatches([]);
                  setAllergenConfirmChecked(false);
                }}
              >
                <Text variant="body" weight="bold" style={styles.modalPrimaryButtonText}>
                  {t('allergenWarning.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSecondaryButton,
                  !allergenConfirmChecked && styles.modalSecondaryButtonDisabled,
                ]}
                onPress={async () => {
                  if (!allergenConfirmChecked) return;
                  const next = pendingAdd;
                  setAllergenModalVisible(false);
                  setPendingAdd(null);
                  setAllergenModalMatches([]);
                  setAllergenConfirmChecked(false);
                  if (next) {
                    const added = await finalizeAddToCart(next);
                    if (added) {
                      Toast.show({
                        type: 'success',
                        text1: t('foodCard.alerts.addToCartTitle'),
                        text2: t('foodCard.alerts.addToCartMessage', { count: next.quantity, name: next.food.name }),
                        position: 'bottom',
                        bottomOffset: 90,
                        visibilityTime: 1800,
                      });
                    }
                  }
                }}
                activeOpacity={allergenConfirmChecked ? 0.8 : 1}
              >
                <Text
                  variant="body"
                  weight="bold"
                  style={[
                    styles.modalSecondaryButtonText,
                    !allergenConfirmChecked && styles.modalSecondaryButtonTextDisabled,
                  ]}
                >
                  {t('allergenWarning.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Hero Header */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: '#AAB3AA',
            opacity: topBarOpacity,
            paddingTop: insets.top + 5,
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.titleRow}>
            <Text variant="heading" weight="bold" style={styles.topBarTitle}>
              Coziyoo
            </Text>
            <Text style={styles.countryFlag}>
              {currentCountry.code === 'TR' ? '🇹🇷' : '🇬🇧'}
            </Text>
          </View>
          <View style={styles.heroTag}>
            <Text variant="body" style={styles.heroTagText}>
              {currentLanguage === 'tr' ? 'Ev yemeği · Yakınında' : 'Home food · Nearby'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Search - Outside ScrollView to avoid VirtualizedList warning */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmit={handleSearchSubmit}
              onFilterPress={handleFilterPress}
              placeholder={t('searchPlaceholder')}
              suggestions={suggestions}
              onSuggestionPress={handleSuggestionPress}
              filterCount={getActiveFilterCount()}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.nearbyButton, { 
              backgroundColor: '#FFFFFF',
              opacity: locationLoading ? 0.7 : 1
            }]}
            onPress={async () => {
              if (locationLoading) return;
              
              const userCoords = await getUserLocation();
              if (userCoords) {
                setSearchQuery(t('homeScreen.nearbyQuery'));
                const publishedFoodKeys = new Set(publishedMeals.map(getFoodIdentity));
                const mockFoodsWithoutPublishedDuplicates = mockFoods.filter(
                  (food) => !publishedFoodKeys.has(getFoodIdentity(food))
                );
                const allFoods = [
                  ...firebaseFoods.map(food => ({ ...food, id: `firebase_${food.id}` })),
                  ...mockFoodsWithoutPublishedDuplicates.map(food => ({ ...food, id: `mock_${food.id}` })),
                  ...publishedMeals.map(food => ({ ...food, id: `published_${food.id}` }))
                ];
                const sortedFoods = sortFoodsByRealDistance(allFoods, userCoords);
                setSearchResults(sortedFoods);
                setIsSearching(false);
              }
            }}
            disabled={locationLoading}
          >
            <MaterialIcons name="location-on" size={22} color="#D12B2B" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Categories - Fixed Header */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategoryPress(category)}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category 
                    ? '#8FA08E'
                    : '#FFFFFF',
                  borderColor: selectedCategory === category ? '#8FA08E' : '#E7E8EA',
                },
              ]}
            >
              <Text
                variant="body"
                weight="medium"
                style={{
                  color: selectedCategory === category 
                    ? 'white' 
                    : '#5B5E63',
                  fontSize: 15,
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {latestOrderStatus ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.latestOrderBanner, { borderColor: colors.primary, backgroundColor: colors.surface }]}
          onPress={() =>
            router.push({
              pathname: '/(buyer)/order-tracking',
              params: {
                orderId: latestOrderStatus.orderId,
              },
            })
          }
        >
          <Text variant="caption" color="textSecondary">
            {currentLanguage === 'tr' ? 'Son Sipariş Durumu' : 'Latest Order Status'}
          </Text>
          <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
            #{latestOrderStatus.orderId} • {latestOrderStatus.statusLabel}
          </Text>
        </TouchableOpacity>
      ) : null}

      {__DEV__ ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.previewBanner, { borderColor: colors.primary, backgroundColor: '#FFFFFF' }]}
          onPress={() => router.push('/(buyer)/home-preview' as any)}
        >
          <Text variant="caption" color="textSecondary">
            UI Önizleme
          </Text>
          <Text variant="body" weight="semibold" style={{ color: colors.primary }}>
            Referans Ana Sayfa Tasarımını Aç
          </Text>
        </TouchableOpacity>
      ) : null}
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Cook Filter Indicator */}
        {cookFilter.trim() && (
          <View style={[styles.cookFilterContainer, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
            <MaterialIcons name="account-circle" size={16} color={colors.primary} />
            <Text variant="body" style={{ color: colors.primary, flex: 1 }}>
              {t('homeScreen.cookFilter', { cook: cookFilter })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setCookFilter('');
                // Clear URL params
                // @ts-ignore
                router.replace('/(buyer)');
              }}
              style={[styles.cookFilterCloseButton, { backgroundColor: colors.primary }]}
            >
              <MaterialIcons name="close" size={12} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Food List - Vertical Layout */}
        <View style={styles.foodListContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text variant="body" color="textSecondary" style={styles.loadingText}>
                {t('homeScreen.loadingFast')}
              </Text>
              <Text variant="caption" color="textSecondary" style={{ marginTop: 8, textAlign: 'center' }}>
                {t('homeScreen.loadingMock')}
              </Text>
            </View>
          ) : filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                {...food}
                displayCookName={getDisplayCookName(food.cookName)}
                currentStock={foodStocks[food.id.replace(/^(firebase_|mock_|published_)/, '')] ?? food.currentStock}
                onAddToCart={handleAddToCart}
                maxDeliveryDistance={food.maxDeliveryDistance}
                allergens={food.allergens}
                hygieneRating={food.hygieneRating}
                availableDeliveryOptions={food.availableDeliveryOptions}
                isGridMode={false}
                showAvailableDates={true}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color="textSecondary" style={styles.emptyText}>
                {searchQuery.trim() 
                  ? t('homeScreen.emptySearch', { query: searchQuery })
                  : t('homeScreen.emptyCategory')
                }
              </Text>
              {searchQuery.trim() && (
                <Text variant="caption" color="textSecondary" style={styles.emptySubText}>
                  {t('homeScreen.emptySub')}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={searchFilters}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingBottom: 6,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 124,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countryFlag: {
    fontSize: 18,
  },
  heroTag: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topBarTitle: {
    fontSize: 38,
    color: 'white',
    letterSpacing: 0.4,
    textAlign: 'center',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    paddingTop: 0, // Remove top padding since categories are now fixed
  },
  searchContainer: {
    marginTop: -4,
    paddingHorizontal: Spacing.md,
    paddingTop: 4,
    paddingBottom: 2,
    backgroundColor: '#F5F5F5',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E8EA',
  },
  searchBarContainer: {
    flex: 1,
  },
  nearbyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.xs, // Further reduced to xs
    paddingVertical: 4, // Very minimal vertical padding
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 0,
    height: 34, // Even more reduced height
  },
  searchIconContainer: {
    marginRight: Spacing.xs, // Reduced from sm to xs
    padding: 0,
  },
  searchIcon: {
    fontSize: 18,
    fontWeight: '400',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    padding: 0,
    margin: 0,
    height: 20, // Reduced height for perfect vertical alignment
    textAlignVertical: 'center', // Perfect vertical alignment
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  clearIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  cookFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cookFilterCloseButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 0,
    backgroundColor: '#F5F5F5',
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  latestOrderBanner: {
    marginHorizontal: Spacing.md,
    marginTop: 2,
    marginBottom: 2,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  previewBanner: {
    marginHorizontal: Spacing.md,
    marginTop: 2,
    marginBottom: 2,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: Spacing.xs,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E8EA',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  foodListContainer: {
    paddingHorizontal: 0, // Remove side padding for full-width cards
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptySubText: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    textAlign: 'center',
  },
  resetButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: 22,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EAECF0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
    backgroundColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconText: {
    color: '#FFFFFF',
  },
  modalTitle: {
    marginBottom: Spacing.sm,
    color: '#101828',
    fontSize: 18,
  },
  modalWarningBox: {
    backgroundColor: '#FEF3F2',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: Spacing.md,
  },
  modalText: {
    marginBottom: Spacing.sm,
    color: '#101828',
  },
  modalEmphasis: {
    color: '#101828',
    marginBottom: Spacing.xs,
  },
  modalSecondary: {
    color: '#475467',
  },
  modalChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3F2',
    borderColor: '#FEE4E2',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  modalChipText: {
    color: '#B42318',
  },
  modalCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckboxChecked: {
    backgroundColor: '#B42318',
  },
  modalCheckboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalPrimaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
  },
  modalSecondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalSecondaryButtonDisabled: {
    borderColor: '#D0D5DD',
    backgroundColor: '#F9FAFB',
  },
  modalSecondaryButtonText: {
    color: '#B42318',
  },
  modalSecondaryButtonTextDisabled: {
    color: '#98A2B3',
  },
});
