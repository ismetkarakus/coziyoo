import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Input, FoodCard } from '@/src/components/ui';
import { TopBar } from '@/src/components/layout';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Mock data for categories
const CATEGORIES = [
  { id: 'main-course', name: 'Ana Yemek', count: 8 },
  { id: 'soup', name: 'Çorba', count: 4 },
  { id: 'meze', name: 'Meze', count: 4 },
  { id: 'salad', name: 'Salata', count: 3 },
  { id: 'breakfast', name: 'Kahvaltı', count: 3 },
  { id: 'desserts', name: 'Tatlı/Kek', count: 4 },
  { id: 'beverages', name: 'İçecekler', count: 2 },
  { id: 'vegetarian', name: 'Vejetaryen', count: 2 },
  { id: 'gluten-free', name: 'Gluten Free', count: 2 },
];

// Mock food data
const MOCK_FOODS = [
  {
    id: '1',
    name: 'Ev Yapımı Mantı',
    cookName: 'Ayşe Hanım',
    rating: 4.8,
    price: 25,
    distance: '3 km', // Satıcının belirlediği maksimum teslimat mesafesi
    hasPickup: true,
    hasDelivery: true,
    maxDeliveryDistance: 3, // AddMeal'dan gelen değer
  },
  {
    id: '2',
    name: 'Karnıyarık',
    cookName: 'Fatma Teyze',
    rating: 4.6,
    price: 18,
    distance: '2 km', // Satıcının belirlediği maksimum teslimat mesafesi
    hasPickup: true,
    hasDelivery: false,
    maxDeliveryDistance: 2, // AddMeal'dan gelen değer
  },
  {
    id: '3',
    name: 'Baklava',
    cookName: 'Mehmet Usta',
    rating: 4.9,
    price: 35,
    distance: '4 km', // Satıcının belirlediği maksimum teslimat mesafesi
    hasPickup: true,
    hasDelivery: true,
    maxDeliveryDistance: 4, // AddMeal'dan gelen değer
  },
  {
    id: '4',
    name: 'Mercimek Çorbası',
    cookName: 'Zehra Hanım',
    rating: 4.7,
    price: 12,
    distance: '1 km', // Satıcının belirlediği maksimum teslimat mesafesi
    hasPickup: true,
    hasDelivery: true,
    maxDeliveryDistance: 1, // AddMeal'dan gelen değer
  },
];

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('main-course');

  const handleAddToCart = (foodId: string, quantity: number) => {
    console.log(`Added ${quantity} of food ${foodId} to cart`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="" leftComponent={
        <Text variant="heading" weight="bold" color="primary" style={{ fontSize: 24 }}>
          Keşfet
        </Text>
      } />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Yemek ara..."
            leftIcon={<Text>🔍</Text>}
            rightIcon={
              searchQuery.trim() ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="close" size={18} color={colors.error} />
                </TouchableOpacity>
              ) : undefined
            }
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Kategoriler
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.id 
                      ? colors.primary 
                      : colors.surface,
                  },
                ]}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: selectedCategory === category.id 
                      ? 'white' 
                      : colors.text,
                  }}
                >
                  {category.name} ({category.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Food List */}
        <View style={styles.foodListContainer}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Ana Yemek'}
          </Text>
          
          {MOCK_FOODS.map((food) => (
            <FoodCard
              key={food.id}
              {...food}
              onAddToCart={handleAddToCart}
              maxDeliveryDistance={food.maxDeliveryDistance}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.md,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  foodListContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
