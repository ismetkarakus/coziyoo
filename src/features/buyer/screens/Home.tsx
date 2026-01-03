import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Input, FoodCard } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock data
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
    distance: '900 m',
    category: 'Ana Yemek',
    hasPickup: true,
    hasDelivery: true,
  },
  {
    id: '2',
    name: 'Karnıyarık',
    cookName: 'Mehmet Usta',
    rating: 4.6,
    price: 28,
    distance: '4.6 km',
    category: 'Ana Yemek',
    hasPickup: true,
    hasDelivery: true,
  },
  {
    id: '4',
    name: 'İskender Kebap',
    cookName: 'Ali Usta',
    rating: 4.7,
    price: 42,
    distance: '2.1 km',
    category: 'Ana Yemek',
    hasPickup: true,
    hasDelivery: true,
  },
  // Çorba
  {
    id: '5',
    name: 'Mercimek Çorbası',
    cookName: 'Zeynep Hanım',
    rating: 4.5,
    price: 15,
    distance: '1.2 km',
    category: 'Çorba',
    hasPickup: true,
    hasDelivery: true,
  },
  {
    id: '6',
    name: 'Tarhana Çorbası',
    cookName: 'Fatma Teyze',
    rating: 4.8,
    price: 18,
    distance: '800 m',
    category: 'Çorba',
    hasPickup: true,
    hasDelivery: true,
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
  },
  // Baklava'yı da bir kategoriye ekleyelim
  {
    id: '3',
    name: 'Baklava',
    cookName: 'Fatma Teyze',
    rating: 4.9,
    price: 45,
    distance: '3.7 km',
    category: 'Ana Yemek', // Tatlı kategorisi yok, Ana Yemek'e ekledim
    hasPickup: true,
    hasDelivery: true,
  },
];

export const Home: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleNotificationsPress = () => {
    router.push('/(tabs)/notifications');
  };

  const handleLogoPress = () => {
    router.push('/(seller)/dashboard');
  };

  const handleAddToCart = (foodId: string, quantity: number) => {
    console.log(`Added ${quantity} of food ${foodId} to cart`);
  };

  const handleCategoryPress = (category: string) => {
    // All categories now filter on the same page
    setSelectedCategory(category);
  };

  // Filter foods based on selected category
  const getFilteredFoods = () => {
    if (selectedCategory === 'Tümü') {
      return MOCK_FOODS;
    }
    return MOCK_FOODS.filter(food => food.category === selectedCategory);
  };

  const filteredFoods = getFilteredFoods();

  const renderTopBarRight = () => (
    <View style={styles.topBarRight}>
      <TouchableOpacity onPress={handleProfilePress} style={styles.profileIconContainer}>
        <Text style={styles.profileIcon}>👤</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTopBarCenter = () => (
    <TouchableOpacity onPress={handleLogoPress}>
      <Text variant="heading" weight="bold" color="text" style={styles.logoText}>
        Cazi
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <View style={styles.topBarContent}>
          {/* Left Icon - positioned at bottom */}
          <View style={styles.leftIconWrapper}>
            <TouchableOpacity onPress={handleLogoPress} style={styles.homeIconContainer}>
              <Text style={styles.homeIcon}>🏠</Text>
            </TouchableOpacity>
          </View>
          
          {/* Center Logo */}
          <View style={styles.centerLogoWrapper}>
            <Text variant="heading" weight="bold" style={styles.logoText}>
              Cazi
            </Text>
          </View>
          
          {/* Right Icon - positioned at bottom */}
          <View style={styles.rightIconWrapper}>
            <TouchableOpacity onPress={handleProfilePress} style={styles.profileIconContainer}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
            <Input
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
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color="textSecondary" style={styles.emptyText}>
                Bu kategoride henüz yemek bulunmuyor.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 0,
    paddingBottom: Spacing.lg, // Increased bottom padding to extend downward
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to bottom
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md, // Increased bottom padding for more space
    height: 100, // Increased height to extend downward
    position: 'relative', // For absolute positioning of center logo
  },
  leftIconWrapper: {
    position: 'absolute',
    left: Spacing.sm, // Closer to the very left edge
    bottom: Spacing.sm, // Closer to the very bottom edge
  },
  centerLogoWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.lg, // Position higher than icons for better balance
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // Allow touches to pass through to icons
  },
  rightIconWrapper: {
    position: 'absolute',
    right: Spacing.sm, // Closer to the very right edge
    bottom: Spacing.sm, // Closer to the very bottom edge
  },
  homeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIcon: {
    fontSize: 20,
    color: 'white',
  },
  logoText: {
    fontSize: 24,
    color: 'white',
    letterSpacing: 1,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
    color: 'white',
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
});

