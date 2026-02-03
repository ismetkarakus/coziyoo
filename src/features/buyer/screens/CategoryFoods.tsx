import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, FoodCard } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';

// Mock data for different categories
const CATEGORY_FOODS = {
  'Ana Yemek': [
    {
      id: '1',
      name: 'Ev Yapımı Mantı',
      cookName: 'Ayşe Hanım',
      rating: 4.8,
      price: 35,
      distance: '900 m',
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
      hasPickup: true,
      hasDelivery: true,
    },
  ],
  'Çorba': [
    {
      id: '5',
      name: 'Mercimek Çorbası',
      cookName: 'Zeynep Hanım',
      rating: 4.5,
      price: 15,
      distance: '1.2 km',
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
      hasPickup: true,
      hasDelivery: true,
    },
    {
      id: '7',
      name: 'Yayla Çorbası',
      cookName: 'Emine Hanım',
      rating: 4.4,
      price: 16,
      distance: '1.5 km',
      hasPickup: true,
      hasDelivery: true,
    },
  ],
  'Kahvaltı': [
    {
      id: '8',
      name: 'Serpme Kahvaltı',
      cookName: 'Hasan Usta',
      rating: 4.9,
      price: 55,
      distance: '1.8 km',
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
      hasPickup: true,
      hasDelivery: true,
    },
    {
      id: '10',
      name: 'Simit & Çay',
      cookName: 'Mehmet Abi',
      rating: 4.3,
      price: 12,
      distance: '500 m',
      hasPickup: true,
      hasDelivery: true,
    },
  ],
  'Salata': [
    {
      id: '11',
      name: 'Çoban Salata',
      cookName: 'Zehra Hanım',
      rating: 4.4,
      price: 18,
      distance: '1.1 km',
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
      hasPickup: true,
      hasDelivery: true,
    },
  ],
};

export const CategoryFoods: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const categoryName = params.category as string || 'Ana Yemek';

  const handleAddToCart = (foodId: string, quantity: number) => {
    console.log(`Added ${quantity} of food ${foodId} to cart`);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Get foods for the selected category
  const categoryFoods = CATEGORY_FOODS[categoryName as keyof typeof CATEGORY_FOODS] || [];

  const renderBackButton = () => (
    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
      <Text style={styles.backButtonText}>{t('categoryFoodsScreen.back')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={categoryName} 
        leftComponent={renderBackButton()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text variant="heading" weight="semibold" style={styles.categoryTitle}>
            {categoryName} {t('categoryFoodsScreen.titleSuffix')}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.foodCount}>
            {t('categoryFoodsScreen.count', { count: categoryFoods.length })}
          </Text>
        </View>

        {/* Food List */}
        <View style={styles.foodListContainer}>
          {categoryFoods.length > 0 ? (
            categoryFoods.map((food) => (
              <FoodCard
                key={food.id}
                {...food}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text variant="body" color="textSecondary" style={styles.emptyText}>
                {t('categoryFoodsScreen.empty')}
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
  content: {
    flex: 1,
  },
  headerContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  categoryTitle: {
    marginBottom: Spacing.xs,
  },
  foodCount: {
    fontSize: 14,
  },
  foodListContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
