import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, FoodCard, SearchBar, FilterModal, NetworkStatus } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { foodService, Food } from '../../../services/foodService';
import { searchService, SearchFilters } from '../../../services/searchService';
import { seedSampleData, checkExistingData } from '../../../utils/seedData';
import { FirebaseUtils } from '../../../utils/firebaseUtils';

// Mock data
const USER_DATA = {
  name: 'Ahmet Yılmaz',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
};

const CATEGORIES = [
  'Tümü',
  'Ana Yemek',
  'Çorba',
  'Kahvaltı',
  'Salata',
];

const MOCK_FOODS = [
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
];

export const Home: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [foodStocks, setFoodStocks] = useState<{[key: string]: number}>({});
  const [scrollY, setScrollY] = useState(0);
  const [publishedMeals, setPublishedMeals] = useState<any[]>([]);
  const [cookFilter, setCookFilter] = useState<string>('');
  const [firebaseFoods, setFirebaseFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addToCart } = useCart();
  const { sendLowStockNotification } = useNotifications();


  // Load Firebase foods
  useEffect(() => {
    // Hızlı yükleme için kısa delay
    setTimeout(() => {
      loadFirebaseFoods();
    }, 100);
  }, []);

  const loadFirebaseFoods = async () => {
    try {
      setLoading(true);
      console.log('⚡ Loading foods (FAST MODE - using mock data)...');
      
      // HIZLI ÇÖZÜM: Mock data kullan
      const mockFoods = [
        {
          id: 'mock1',
          name: 'Ev Yapımı Mantı',
          description: 'Geleneksel el açması mantı, yoğurt ve tereyağlı sos ile',
          price: 45,
          cookName: 'Ayşe Hanım',
          cookId: 'cook1',
          category: 'Ana Yemek',
          imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop',
          ingredients: ['Un', 'Et', 'Soğan', 'Yoğurt'],
          preparationTime: 60,
          servingSize: 4,
          isAvailable: true,
          currentStock: 10,
          dailyStock: 15,
          rating: 4.8,
          reviewCount: 24,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'mock2',
          name: 'Mercimek Çorbası',
          description: 'Taze sebzelerle hazırlanmış nefis mercimek çorbası',
          price: 15,
          cookName: 'Mehmet Usta',
          cookId: 'cook2',
          category: 'Çorba',
          imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=320&h=280&fit=crop',
          ingredients: ['Mercimek', 'Havuç', 'Soğan', 'Baharat'],
          preparationTime: 30,
          servingSize: 2,
          isAvailable: true,
          currentStock: 8,
          dailyStock: 12,
          rating: 4.5,
          reviewCount: 18,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'mock3',
          name: 'Köfte ve Pilav',
          description: 'Ev yapımı köfte ve tereyağlı pilav',
          price: 35,
          cookName: 'Fatma Teyze',
          cookId: 'cook3',
          category: 'Ana Yemek',
          imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=320&h=280&fit=crop',
          ingredients: ['Kıyma', 'Pirinç', 'Soğan', 'Baharat'],
          preparationTime: 45,
          servingSize: 3,
          isAvailable: true,
          currentStock: 6,
          dailyStock: 10,
          rating: 4.7,
          reviewCount: 31,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setFirebaseFoods(mockFoods);
      console.log('✅ Mock foods loaded instantly:', mockFoods.length);
      
    } catch (error) {
      console.error('❌ Error:', error);
      setFirebaseFoods([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle cook filter from params
  useEffect(() => {
    console.log('Home params:', params);
    if (params.filterByCook && params.showCookFilter) {
      console.log('Setting cook filter to:', params.filterByCook);
      setCookFilter(params.filterByCook as string);
      setSearchQuery(''); // Clear search when filtering by cook
      setSelectedCategory('Tümü'); // Reset category when filtering by cook
    } else if (!params.filterByCook && !params.showCookFilter) {
      // Clear cook filter if no params
      setCookFilter('');
    }
  }, [params.filterByCook, params.showCookFilter]);

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
            setSelectedCategory('Tümü'); // Reset category when filtering by cook
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
    }, [])
  );

  // Firebase bağlantısını reset et
  const handleResetFirebase = async () => {
    try {
      console.log('🔄 Resetting Firebase connection...');
      await FirebaseUtils.resetConnection();
      
      // Verileri yeniden yükle
      await loadFirebaseFoods();
      
      Alert.alert('✅ Başarılı', 'Firebase bağlantısı sıfırlandı ve veriler yeniden yüklendi!');
    } catch (error) {
      console.error('❌ Reset failed:', error);
      Alert.alert('❌ Hata', 'Firebase sıfırlama başarısız oldu.');
    }
  };

  const handleAddToCart = async (foodId: string, quantity: number) => {
    const food = firebaseFoods.find(f => f.id === foodId);
    if (food && quantity > 0) {
      // Check current stock
      const currentStock = food.currentStock ?? 0;
      if (currentStock >= quantity) {
        try {
          // Update stock in Firebase with low stock notification
          await foodService.updateFoodStock(foodId, currentStock - quantity, sendLowStockNotification);
          
          addToCart({
            id: food.id!,
            name: food.name,
            cookName: food.cookName,
            price: food.price,
            imageUrl: food.imageUrl,
            currentStock: currentStock - quantity,
            dailyStock: food.dailyStock || 0,
          }, quantity);
          
          console.log(`Added ${quantity} of ${food.name} to cart. Remaining stock: ${currentStock - quantity}`);
          
          // Reload Firebase data to reflect stock changes
          loadFirebaseFoods();
        } catch (error) {
          console.error('Error updating stock:', error);
          Alert.alert('Hata', 'Stok güncellenirken bir hata oluştu.');
        }
      } else {
        Alert.alert('Stok Yetersiz', `Yeterli stok yok! Sadece ${currentStock} adet kaldı.`);
      }
    }
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
        category: selectedCategory !== 'Tümü' ? selectedCategory : filters.category,
      };

      const result = await searchService.searchFoods(searchParams);
      setSearchResults(result.foods);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Hata', 'Arama yapılırken bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  // Get autocomplete suggestions
  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const autocompleteSuggestions = await searchService.getAutocompleteSuggestions(query);
      setSuggestions(autocompleteSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  };

  // Filter foods based on selected category, search query, and cook filter (fallback)
  const getFilteredFoods = () => {
    // If we have search results, use them
    if (isSearching || searchResults.length > 0 || searchQuery.trim() || Object.keys(searchFilters).length > 0) {
      return searchResults;
    }

    // Otherwise use local filtering
    let foods = [...firebaseFoods, ...MOCK_FOODS, ...publishedMeals];
    
    // First filter by cook if specified
    if (cookFilter.trim()) {
      foods = foods.filter(food => food.cookName === cookFilter);
    }
    
    // Then filter by category
    if (selectedCategory !== 'Tümü') {
      foods = foods.filter(food => food.category === selectedCategory);
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

  const renderTopBarRight = () => (
    <View style={styles.topBarRight}>
      {/* Logout Button (Test) */}
      <TouchableOpacity 
        onPress={async () => {
          try {
            await signOut();
            router.replace('/(auth)/sign-in');
          } catch (error) {
            console.error('Logout error:', error);
          }
        }} 
        style={styles.logoutButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="sign-out" size={18} color={colors.background} />
      </TouchableOpacity>
      
      {/* Firebase Reset Button */}
      <TouchableOpacity 
        onPress={handleResetFirebase} 
        style={styles.resetButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <FontAwesome name="refresh" size={18} color={colors.background} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleProfilePress} style={styles.profileIconContainer}>
        <Image 
          source={{ uri: USER_DATA.avatar }}
          style={styles.profileAvatar}
          defaultSource={{ uri: 'https://via.placeholder.com/40x40/7FAF9A/FFFFFF?text=A' }}
        />
      </TouchableOpacity>
    </View>
  );


  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <NetworkStatus />
      {/* TopBar */}
      <View style={[styles.topBar, { 
        backgroundColor: colors.primary,
        opacity: topBarOpacity,
      }]}>
        {/* Left Icon - Home/Seller */}
        <TouchableOpacity 
          onPress={() => {
            console.log('TopBar left button pressed - going to seller dashboard');
            router.push('/(seller)/dashboard');
          }}
          style={styles.leftIcon}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.7}
        >
          <FontAwesome name="home" size={20} color="white" />
        </TouchableOpacity>
        
        {/* Center Title */}
        <Text variant="heading" weight="bold" style={styles.topBarTitle}>
          Cazi
        </Text>
        
        {/* Right Icon - Profile */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.rightIcon}
        >
          <FontAwesome name="user" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Search - Outside ScrollView to avoid VirtualizedList warning */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmit={handleSearchSubmit}
          onFilterPress={handleFilterPress}
          placeholder="Bugün ne yemek istersin?"
          suggestions={suggestions}
          onSuggestionPress={handleSuggestionPress}
          filterCount={getActiveFilterCount()}
        />
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
              {cookFilter}'ın yemekleri gösteriliyor
            </Text>
            <TouchableOpacity
              onPress={() => {
                setCookFilter('');
                // Clear URL params
                router.replace('/(tabs)/home');
              }}
              style={[styles.cookFilterCloseButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="times" size={12} color="white" />
            </TouchableOpacity>
          </View>
        )}


        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategoryPress(category)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category 
                      ? colors.primary 
                      : 'transparent',
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
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Food List */}
        <View style={styles.foodListContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text variant="body" color="textSecondary" style={styles.loadingText}>
                ⚡ Hızlı yükleme modunda...
              </Text>
              <Text variant="caption" color="textSecondary" style={{ marginTop: 8, textAlign: 'center' }}>
                Mock veriler kullanılıyor
              </Text>
            </View>
          ) : filteredFoods.length > 0 ? (
            filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                {...food}
                currentStock={foodStocks[food.id] ?? food.currentStock}
                onAddToCart={handleAddToCart}
                maxDeliveryDistance={food.maxDeliveryDistance}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color="textSecondary" style={styles.emptyText}>
                {searchQuery.trim() 
                  ? `"${searchQuery}" için sonuç bulunamadı.` 
                  : 'Bu kategoride henüz yemek bulunmuyor.'
                }
              </Text>
              {searchQuery.trim() && (
                <Text variant="caption" color="textSecondary" style={styles.emptySubText}>
                  Farklı anahtar kelimeler deneyin veya kategori seçimini değiştirin.
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
    paddingBottom: Spacing.xl, // Increased bottom padding to extend downward
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end', // Align icons to bottom
    justifyContent: 'space-between',
    minHeight: 100, // Added minimum height for more space
    position: 'relative',
  },
  topBarTitle: {
    fontSize: 24,
    color: 'white',
    letterSpacing: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.xl,
    textAlign: 'center',
  },
  leftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4, // Much closer to bottom edge
  },
  rightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4, // Much closer to bottom edge
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, // Reduced from md to sm for shorter height
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 0,
    height: 44, // Fixed shorter height
  },
  searchIconContainer: {
    marginRight: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: Spacing.sm, // Further reduced for even tighter frame
    paddingVertical: Spacing.xs, // Further reduced for compact height
    borderRadius: 18, // Smaller radius for tighter look
    marginRight: 4, // Minimal gap - even closer than Spacing.xs
    minWidth: 50, // Further reduced minimum width
    alignItems: 'center',
  },
  foodListContainer: {
    paddingHorizontal: 0, // Remove side padding for full-width cards
    paddingBottom: Spacing.xl,
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

