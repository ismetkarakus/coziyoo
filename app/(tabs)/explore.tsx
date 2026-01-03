import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Input, FoodCard } from '@/src/components/ui';
import { TopBar } from '@/src/components/layout';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';

// Mock data for categories
const CATEGORIES = [
  { id: 'all', name: 'Tümü', count: 24 },
  { id: 'home-cooking', name: 'Ev Yemekleri', count: 12 },
  { id: 'daily-menu', name: 'Günlük Menü', count: 8 },
  { id: 'vegetarian', name: 'Vejetaryen', count: 6 },
  { id: 'desserts', name: 'Tatlılar', count: 4 },
  { id: 'local', name: 'Yöresel', count: 3 },
];

// Mock food data
const MOCK_FOODS = [
  {
    id: '1',
    name: 'Ev Yapımı Mantı',
    cookName: 'Ayşe Hanım',
    rating: 4.8,
    price: 25,
    distance: '1.2 km',
    hasPickup: true,
    hasDelivery: true,
  },
  {
    id: '2',
    name: 'Karnıyarık',
    cookName: 'Fatma Teyze',
    rating: 4.6,
    price: 18,
    distance: '0.8 km',
    hasPickup: true,
    hasDelivery: false,
  },
  {
    id: '3',
    name: 'Baklava',
    cookName: 'Mehmet Usta',
    rating: 4.9,
    price: 35,
    distance: '2.1 km',
    hasPickup: true,
    hasDelivery: true,
  },
  {
    id: '4',
    name: 'Mercimek Çorbası',
    cookName: 'Zehra Hanım',
    rating: 4.7,
    price: 12,
    distance: '1.5 km',
    hasPickup: true,
    hasDelivery: true,
  },
];

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
            {selectedCategory === 'all' ? 'Tüm Yemekler' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </Text>
          
          {MOCK_FOODS.map((food) => (
            <FoodCard
              key={food.id}
              {...food}
              onAddToCart={handleAddToCart}
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
