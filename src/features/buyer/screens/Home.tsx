import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, FoodCard } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCart } from '../../../context/CartContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [foodStocks, setFoodStocks] = useState<{[key: string]: number}>({});
  const [scrollY, setScrollY] = useState(0);
  const [publishedMeals, setPublishedMeals] = useState<any[]>([]);
  const [cookFilter, setCookFilter] = useState<string>('');
  const { addToCart } = useCart();


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

  // Reload published meals when screen comes into focus
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
    }, [])
  );

  const handleAddToCart = (foodId: string, quantity: number) => {
    const food = MOCK_FOODS.find(f => f.id === foodId);
    if (food && quantity > 0) {
      // Check current stock
      const currentStock = foodStocks[foodId] ?? food.currentStock ?? 0;
      if (currentStock >= quantity) {
        // Update local stock
        setFoodStocks(prev => ({
          ...prev,
          [foodId]: currentStock - quantity
        }));
        
        addToCart({
          id: food.id,
          name: food.name,
          cookName: food.cookName,
          price: food.price,
          imageUrl: food.imageUrl,
          currentStock: currentStock - quantity,
          dailyStock: food.dailyStock,
        }, quantity);
        console.log(`Added ${quantity} of ${food.name} to cart. Remaining stock: ${currentStock - quantity}`);
      } else {
        alert(`Yeterli stok yok! Sadece ${currentStock} adet kaldı.`);
      }
    }
  };

  const handleCategoryPress = (category: string) => {
    // All categories now filter on the same page
    setSelectedCategory(category);
  };

  // Filter foods based on selected category, search query, and cook filter
  const getFilteredFoods = () => {
    // Combine mock foods with published meals
    let foods = [...MOCK_FOODS, ...publishedMeals];
    console.log('All foods:', foods.length, 'Cook filter:', cookFilter);
    
    // First filter by cook if specified
    if (cookFilter.trim()) {
      foods = foods.filter(food => food.cookName === cookFilter);
      console.log('After cook filter:', foods.length, 'foods for', cookFilter);
    }
    
    // Then filter by category
    if (selectedCategory !== 'Tümü') {
      foods = foods.filter(food => food.category === selectedCategory);
    }
    
    // Finally filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      foods = foods.filter(food => 
        food.name.toLowerCase().includes(query) ||
        food.cookName.toLowerCase().includes(query) ||
        food.category.toLowerCase().includes(query)
      );
    }
    
    return foods;
  };

  const filteredFoods = getFilteredFoods();

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);
  };

  // Calculate TopBar opacity based on scroll position
  const topBarOpacity = Math.max(0.3, Math.min(1, 1 - scrollY / 100));

  const renderTopBarRight = () => (
    <View style={styles.topBarRight}>
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
      {/* TopBar */}
      <View style={[styles.topBar, { 
        backgroundColor: colors.primary,
        opacity: topBarOpacity,
      }]}>
        {/* Left Icon - Home/Seller */}
        <TouchableOpacity 
          onPress={() => router.push('/(seller)/dashboard')}
          style={styles.leftIcon}
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

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { 
            backgroundColor: colors.card, 
            borderColor: 'transparent',
            shadowColor: colors.text,
          }]}>
            <View style={styles.searchIconContainer}>
              <Text style={[styles.searchIcon, { color: colors.primary }]}>🔍</Text>
            </View>
            <TextInput
              placeholder="Bugün ne yemek istersin?"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text }]}
              placeholderTextColor={colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Text style={[styles.clearIcon, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>


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
          {filteredFoods.length > 0 ? (
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
});

