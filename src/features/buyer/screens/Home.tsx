import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, FoodCard, SearchBar, FilterModal } from '../../../components/ui';
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
import { AllergenId } from '../../../constants/allergens';

const getCategoriesForLanguage = (language: 'tr' | 'en') => {
  if (language === 'tr') {
    return [
      'Tümü',
      'Ana Yemek',
      'Çorba',
      'Meze',
      'Salata',
      'Kahvaltı',
      'Tatlı/Kek',
      'İçecekler',
      'Vejetaryen',
      'Glutensiz',
    ];
  }
  return [
    'All',
    'Main Dish',
    'Soup',
    'Appetizer',
    'Salad',
    'Breakfast',
    'Dessert/Cake',
    'Drinks',
    'Vegetarian',
    'Gluten Free',
  ];
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
  const mapping: Record<string, string> = {
    'Ana Yemek': 'Main Dish',
    'Çorba': 'Soup',
    'Meze': 'Appetizer',
    'Salata': 'Salad',
    'Kahvaltı': 'Breakfast',
    'Tatlı/Kek': 'Dessert/Cake',
    'İçecekler': 'Drinks',
    'Vejetaryen': 'Vegetarian',
    'Glutensiz': 'Gluten Free',
  };
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

const MOCK_FOODS_TR = [
  // Ana Yemek
  {
    id: '1',
    name: 'Ev Yapımı Mantı',
    cookName: 'Ayşe Hanım',
    rating: 4.8,
    price: 35,
    distance: '3 km', // Satıcının belirlediği maksimum teslimat mesafesi
    category: 'Ana Yemek',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '15-20 Ocak',
    currentStock: 8,
    dailyStock: 10,
    maxDeliveryDistance: 3, // AddMeal'dan gelen değer
    allergens: ['cereals', 'eggs'] as AllergenId[], // Mantı: un (gluten) ve yumurta
    hygieneRating: '5', // UK Food Hygiene Rating
    availableDeliveryOptions: ['pickup', 'delivery'] as ('pickup' | 'delivery')[] // İki seçenek
  },
  {
    id: '2',
    name: 'Karnıyarık',
    cookName: 'Mehmet Usta',
    rating: 4.6,
    price: 28,
    distance: '5 km', // Satıcının belirlediği maksimum teslimat mesafesi
    category: 'Ana Yemek',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '16-22 Ocak',
    currentStock: 5,
    dailyStock: 12,
    maxDeliveryDistance: 5, // AddMeal'dan gelen değer
    availableDeliveryOptions: ['pickup'] as ('pickup' | 'delivery')[] // Sadece gel al
  },
  {
    id: '4',
    name: 'İskender Kebap',
    cookName: 'Ali Usta',
    rating: 4.7,
    price: 42,
    distance: '4 km', // Satıcının belirlediği maksimum teslimat mesafesi
    category: 'Ana Yemek',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '18-25 Ocak',
    currentStock: 3,
    dailyStock: 8,
    maxDeliveryDistance: 4, // AddMeal'dan gelen değer
    availableDeliveryOptions: ['delivery'] as ('pickup' | 'delivery')[] // Sadece teslimat
  },
  // Çorba
  {
    id: '5',
    name: 'Mercimek Çorbası',
    cookName: 'Zeynep Hanım',
    rating: 4.5,
    price: 15,
    distance: '2 km', // Satıcının belirlediği maksimum teslimat mesafesi
    category: 'Çorba',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '15-30 Ocak',
    currentStock: 15,
    dailyStock: 20,
    maxDeliveryDistance: 2, // AddMeal'dan gelen değer
  },
  {
    id: '6',
    name: 'Tarhana Çorbası',
    cookName: 'Fatma Teyze',
    rating: 4.8,
    price: 18,
    distance: '1 km', // Satıcının belirlediği maksimum teslimat mesafesi
    category: 'Çorba',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '19-26 Ocak',
    currentStock: 10,
    dailyStock: 12,
    maxDeliveryDistance: 1, // AddMeal'dan gelen değer
  },
  // Kahvaltı
  {
    id: '8',
    name: 'Serpme Kahvaltı',
    cookName: 'Hasan Usta',
    rating: 4.9,
    price: 55,
    distance: '1.8 km',
    category: 'Kahvaltı',
    hasPickup: true,
    hasDelivery: false,
    availableDates: '21-28 Ocak',
    currentStock: 3,
    dailyStock: 5,
    allergens: ['milk', 'cereals', 'eggs'] as AllergenId[], // Serpme kahvaltı: süt ürünleri, ekmek, yumurta
    hygieneRating: '4', // UK Food Hygiene Rating
  },
  {
    id: '9',
    name: 'Menemen',
    cookName: 'Ayşe Hanım',
    rating: 4.6,
    price: 22,
    distance: '900 m',
    category: 'Kahvaltı',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '17-24 Ocak',
    currentStock: 7,
    dailyStock: 10,
    allergens: ['eggs'] as AllergenId[], // Menemen: yumurta
    hygieneRating: 'Pending', // UK Food Hygiene Rating
  },
  // Salata
  {
    id: '11',
    name: 'Çoban Salata',
    cookName: 'Zehra Hanım',
    rating: 4.4,
    price: 18,
    distance: '1.1 km',
    category: 'Salata',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '15-22 Ocak',
    currentStock: 9,
    dailyStock: 10,
  },
  {
    id: '12',
    name: 'Mevsim Salata',
    cookName: 'Gül Teyze',
    rating: 4.6,
    price: 20,
    distance: '1.4 km',
    category: 'Salata',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '23-30 Ocak',
    currentStock: 6,
    dailyStock: 8,
  },
  {
    id: '13',
    name: 'Roka Salata',
    cookName: 'Elif Hanım',
    rating: 4.5,
    price: 25,
    distance: '2.2 km',
    category: 'Salata',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '16-23 Ocak',
    currentStock: 4,
    dailyStock: 5,
  },
  // Baklava'yı da bir kategoriye ekleyelim
  {
    id: '3',
    name: 'Baklava',
    cookName: 'Fatma Teyze',
    rating: 4.9,
    price: 45,
    distance: '6 km', // Satıcının belirlediği maksimum teslimat mesafesi
    category: 'Ana Yemek', // Tatlı kategorisi yok, Ana Yemek'e ekledim
    hasPickup: true,
    hasDelivery: true,
    availableDates: '17-24 Ocak',
    currentStock: 2,
    dailyStock: 3,
    maxDeliveryDistance: 6, // AddMeal'dan gelen değer
  },
  // Meze
  {
    id: '14',
    name: 'Karışık Meze Tabağı',
    cookName: 'Elif Hanım',
    rating: 4.7,
    price: 28,
    distance: '2.2 km',
    category: 'Meze',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '16-23 Ocak',
    currentStock: 5,
    dailyStock: 8,
    maxDeliveryDistance: 2.5,
  },
  {
    id: '15',
    name: 'Acılı Ezme',
    cookName: 'Hasan Usta',
    rating: 4.5,
    price: 15,
    distance: '1.8 km',
    category: 'Meze',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '18-25 Ocak',
    currentStock: 12,
    dailyStock: 15,
    maxDeliveryDistance: 2,
  },
  // Vejetaryen
  {
    id: '17',
    name: 'Vejetaryen Köfte',
    cookName: 'Ayşe Hanım',
    rating: 4.6,
    price: 24,
    distance: '1.5 km',
    category: 'Vejetaryen',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '17-24 Ocak',
    currentStock: 8,
    dailyStock: 10,
    maxDeliveryDistance: 2,
  },
  {
    id: '18',
    name: 'Sebze Güveç',
    cookName: 'Zehra Hanım',
    rating: 4.8,
    price: 26,
    distance: '2.1 km',
    category: 'Vejetaryen',
    hasPickup: true,
    hasDelivery: false,
    availableDates: '19-26 Ocak',
    currentStock: 6,
    dailyStock: 8,
    maxDeliveryDistance: 0,
  },
  // Gluten Free
  {
    id: '19',
    name: 'Glutensiz Ekmek',
    cookName: 'Fatma Teyze',
    rating: 4.4,
    price: 18,
    distance: '1.3 km',
    category: 'Glutensiz',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '15-22 Ocak',
    currentStock: 10,
    dailyStock: 12,
    maxDeliveryDistance: 1.5,
  },
  {
    id: '20',
    name: 'Glutensiz Kurabiye',
    cookName: 'Gül Teyze',
    rating: 4.7,
    price: 22,
    distance: '2.8 km',
    category: 'Glutensiz',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '20-27 Ocak',
    currentStock: 15,
    dailyStock: 20,
    maxDeliveryDistance: 3,
  },
  // İçecekler
  {
    id: '21',
    name: 'Ev Yapımı Ayran',
    cookName: 'Mehmet Usta',
    rating: 4.3,
    price: 8,
    distance: '900 m',
    category: 'İçecekler',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '16-23 Ocak',
    currentStock: 20,
    dailyStock: 25,
    maxDeliveryDistance: 1,
  },
  {
    id: '22',
    name: 'Taze Sıkılmış Portakal Suyu',
    cookName: 'Elif Hanım',
    rating: 4.6,
    price: 12,
    distance: '1.7 km',
    category: 'İçecekler',
    hasPickup: true,
    hasDelivery: false,
    availableDates: '17-24 Ocak',
    currentStock: 18,
    dailyStock: 20,
    maxDeliveryDistance: 0,
  },
  // Tatlılar
  {
    id: '23',
    name: 'Ev Yapımı Sütlaç',
    cookName: 'Ayşe Hanım',
    rating: 4.9,
    price: 16,
    distance: '1.2 km',
    category: 'Tatlı/Kek',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '18-25 Ocak',
    currentStock: 12,
    dailyStock: 15,
    maxDeliveryDistance: 1.5,
  },
  {
    id: '26',
    name: 'Profiterol',
    cookName: 'Zehra Hanım',
    rating: 4.8,
    price: 32,
    distance: '2.5 km',
    category: 'Tatlı/Kek',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '19-26 Ocak',
    currentStock: 8,
    dailyStock: 10,
    maxDeliveryDistance: 3,
  },
  {
    id: '27',
    name: 'Ev Yapımı Kek',
    cookName: 'Fatma Teyze',
    rating: 4.7,
    price: 24,
    distance: '1.9 km',
    category: 'Tatlı/Kek',
    hasPickup: true,
    hasDelivery: true,
    availableDates: '20-27 Ocak',
    currentStock: 6,
    dailyStock: 8,
    maxDeliveryDistance: 2,
  },
];

const getMockFoods = (language: 'tr' | 'en') => {
  if (language === 'tr') {
    return MOCK_FOODS_TR;
  }
  return MOCK_FOODS_TR.map((food) => ({
    ...food,
    name: translateFoodNameToEn(food.name),
    cookName: translateCookNameToEn(food.cookName),
    category: translateCategoryToEn(food.category),
    availableDates: translateDateRangeToEn(food.availableDates),
  }));
};

export const Home: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { currentCountry, formatCurrency } = useCountry();
  const { t, currentLanguage } = useTranslation();
  const params = useLocalSearchParams();
  const { getTotalItems } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = useMemo(() => getCategoriesForLanguage(currentLanguage), [currentLanguage]);
  const defaultCategory = categories[0] ?? '';
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const mockFoods = getMockFoods(currentLanguage);
  useEffect(() => {
    if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [defaultCategory]);
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

  const nearbyTerms = [
    t('homeScreen.nearbyQuery'),
    t('homeScreen.nearbyAlt1'),
    t('homeScreen.nearbyAlt2'),
    t('homeScreen.nearbyAlt3'),
  ];
  const turkishKeywords = currentLanguage === 'tr' ? ['türk', 'türkiye'] : ['turkish', 'turkey'];


  // Load Firebase foods
  useEffect(() => {
    // Firebase yüklemeyi skip et, sadece mockFoods kullan
    console.log('🍽️ Using mockFoods only, skipping Firebase');
    setLoading(false);
  }, []);

  const loadFirebaseFoods = async () => {
    // Firebase yükleme devre dışı - sadece mockFoods kullan
    console.log('🍽️ Firebase loading disabled, using mockFoods only');
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
          setPublishedMeals(meals);
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
            setPublishedMeals(meals);
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
      loadFirebaseFoods(); // Reload Firebase data on focus
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
          // Update local stock state immediately for UI feedback
          const newStock = currentStock - quantity;
          setFoodStocks(prev => ({
            ...prev,
            [originalId]: newStock
          }));
          
          // If it's a Firebase food, update in Firebase too
          if (firebaseFood) {
            // @ts-ignore
            await foodService.updateFoodStock(foodId, newStock, sendLowStockNotification);
          }
          
          // Determine available options
          const availableOptions: ('pickup' | 'delivery')[] = [];
          if (food.hasPickup) availableOptions.push('pickup');
          if (food.hasDelivery) availableOptions.push('delivery');
          
          // Set default delivery option if not provided
          const finalDeliveryOption = deliveryOption || (availableOptions.length === 1 ? availableOptions[0] : undefined);
          
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
          }, quantity);
          
          console.log(`Added ${quantity} of ${food.name} to cart. Remaining stock: ${newStock}`);
          
          // Send low stock notification if needed
          if (newStock <= 2) {
            sendLowStockNotification(food.name, newStock);
          }
          
        } catch (error) {
          console.error('Error updating stock:', error);
          // Revert local stock change on error
          setFoodStocks(prev => ({
            ...prev,
            [originalId]: currentStock
          }));
          Alert.alert(t('homeScreen.alerts.stockUpdateErrorTitle'), t('homeScreen.alerts.stockUpdateErrorMessage'));
        }
      } else {
        Alert.alert(t('homeScreen.alerts.stockInsufficientTitle'), t('homeScreen.alerts.stockInsufficientMessage', { count: currentStock }));
      }
    }
  };

  const handleFoodPress = (food: any) => {
    const foodImageUrl = food.imageUrl || '';
    const route = `/food-detail-order?id=${food.id}&name=${encodeURIComponent(food.name)}&cookName=${encodeURIComponent(food.cookName || '')}&imageUrl=${encodeURIComponent(foodImageUrl)}&price=${encodeURIComponent(String(food.price))}`;
    router.push(route);
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
    const allFoods = [
      ...firebaseFoods.map(food => ({ ...food, id: `firebase_${food.id}` })),
      ...mockFoods.map(food => ({ ...food, id: `mock_${food.id}` })),
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

    // Otherwise use local filtering - unique ID'ler için prefix ekle
    let foods = [
      ...firebaseFoods.map(food => ({ ...food, id: `firebase_${food.id}` })),
      ...mockFoods.map(food => ({ ...food, id: `mock_${food.id}` })),
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
    router.push('/(tabs)/profile');
  };



  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* TopBar */}
      <View style={[styles.topBar, {
        backgroundColor: colors.primary,
        opacity: topBarOpacity,
      }]}>
        {/* Center Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.titleRow}>
            <Text variant="heading" weight="bold" style={styles.topBarTitle}>
              Coziyoo
            </Text>
            <Text style={styles.countryFlag}>
              {currentCountry.code === 'TR' ? '🇹🇷' : '🇬🇧'}
            </Text>
          </View>
          <Text variant="caption" style={styles.logoSlogan}>
            {t('homeScreen.slogan')}
          </Text>
        </View>
        
        {/* Right Icons removed */}
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
              backgroundColor: locationLoading ? colors.textSecondary : colors.primary,
              opacity: locationLoading ? 0.7 : 1
            }]}
            onPress={async () => {
              if (locationLoading) return;
              
              const userCoords = await getUserLocation();
              if (userCoords) {
                setSearchQuery(t('homeScreen.nearbyQuery'));
                const allFoods = [
                  ...firebaseFoods.map(food => ({ ...food, id: `firebase_${food.id}` })),
                  ...mockFoods.map(food => ({ ...food, id: `mock_${food.id}` })),
                  ...publishedMeals.map(food => ({ ...food, id: `published_${food.id}` }))
                ];
                const sortedFoods = sortFoodsByRealDistance(allFoods, userCoords);
                setSearchResults(sortedFoods);
                setIsSearching(false);
              }
            }}
            disabled={locationLoading}
          >
            <Text variant="caption" weight="medium" style={{ color: 'white', fontSize: 11 }}>
              {locationLoading ? t('locationLoading') : t('nearMe')}
            </Text>
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
                    ? colors.primary 
                    : 'transparent',
                  borderColor: selectedCategory === category ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text
                variant="body"
                weight="medium"
                style={{
                  color: selectedCategory === category 
                    ? 'white' 
                    : colors.textSecondary,
                  fontSize: 15, // Slightly increased from default
                }}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Cook Filter Indicator */}
        {cookFilter.trim() && (
          <View style={[styles.cookFilterContainer, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
            <FontAwesome name="user-circle" size={16} color={colors.primary} />
            <Text variant="body" style={{ color: colors.primary, flex: 1 }}>
              {t('homeScreen.cookFilter', { cook: cookFilter })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setCookFilter('');
                // Clear URL params
                // @ts-ignore
                router.replace('/(tabs)');
              }}
              style={[styles.cookFilterCloseButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="times" size={12} color="white" />
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
    paddingTop: 50, // Safe area padding
    paddingBottom: Spacing.xs, // Reduced to xs to push icons to very bottom
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center', // Changed from flex-end to center
    justifyContent: 'space-between',
    minHeight: 100, // Added minimum height for more space
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50, // Match paddingTop of topBar
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  countryFlag: {
    fontSize: 16,
  },
  logoSlogan: {
    fontSize: 12.5, // Increased from 11 to 12.5
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 2, // Small positive margin to keep Coziyoo position unchanged
    letterSpacing: 0.8,
    fontStyle: 'italic',
    fontWeight: '500', // Increased from 'normal' to '500' (medium)
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  topBarTitle: {
    fontSize: 24, // Original size
    color: 'white',
    letterSpacing: 1, // Original spacing
    textAlign: 'center',
    fontWeight: 'bold', // Original weight
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Original shadow
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1, // Original radius
  },
  leftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0, // No margin - stick to very bottom
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 0, // No margin - stick to very bottom
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    // @ts-ignore
    backgroundColor: Colors.light.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 0, // Remove top padding since categories are now fixed
  },
  searchContainer: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    paddingBottom: 2, // Reduced bottom padding to get closer to categories
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs, // Reduced from sm to xs
  },
  searchBarContainer: {
    flex: 1, // Takes remaining space, making SearchBar narrower
  },
  nearbyButton: {
    paddingHorizontal: Spacing.xs, // Reduced padding
    paddingVertical: 6, // Reduced from 8 to 6
    borderRadius: 16, // Slightly smaller radius
    minWidth: 60, // Reduced from 70
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    paddingHorizontal: Spacing.xs,
    paddingVertical: 0,
    paddingTop: 0,
    // @ts-ignore
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    // @ts-ignore
    borderBottomColor: Colors.light.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 0,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    marginRight: Spacing.xs,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: Platform.OS === 'web' ? 1 : 0.5,
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
});
