import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, FoodCard, SearchBar } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCart } from '../../../context/CartContext';

const CATEGORY_FOODS_TR = {
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

const CATEGORY_KEY_TR_TO_EN: Record<string, string> = {
  'Ana Yemek': 'Main Dish',
  'Çorba': 'Soup',
  'Kahvaltı': 'Breakfast',
  'Salata': 'Salad',
};

const translateCategoryToEn = (category: string) => CATEGORY_KEY_TR_TO_EN[category] || category;

const translateFoodNameToEn = (name: string) => {
  const mapping: Record<string, string> = {
    'Ev Yapımı Mantı': 'Homemade Manti',
    'Karnıyarık': 'Stuffed Eggplant',
    'İskender Kebap': 'Iskender Kebab',
    'Mercimek Çorbası': 'Lentil Soup',
    'Tarhana Çorbası': 'Tarhana Soup',
    'Yayla Çorbası': 'Yogurt Soup',
    'Serpme Kahvaltı': 'Turkish Breakfast',
    'Menemen': 'Menemen',
    'Simit & Çay': 'Simit & Tea',
    'Çoban Salata': 'Shepherd Salad',
    'Mevsim Salata': 'Seasonal Salad',
    'Roka Salata': 'Arugula Salad',
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
    'Emine Hanım': 'Emine Hanim',
    'Hasan Usta': 'Hasan Usta',
    'Mehmet Abi': 'Mehmet Abi',
    'Zehra Hanım': 'Zehra Hanim',
    'Gül Teyze': 'Gul Teyze',
    'Elif Hanım': 'Elif Hanim',
  };
  return mapping[name] || name;
};

const getCategoryFoods = (language: 'tr' | 'en') => {
  if (language === 'tr') {
    return CATEGORY_FOODS_TR;
  }

  return Object.fromEntries(
    Object.entries(CATEGORY_FOODS_TR).map(([category, foods]) => [
      translateCategoryToEn(category),
      foods.map((food) => ({
        ...food,
        name: translateFoodNameToEn(food.name),
        cookName: translateCookNameToEn(food.cookName),
      })),
    ])
  ) as Record<string, typeof CATEGORY_FOODS_TR[keyof typeof CATEGORY_FOODS_TR]>;
};

const DEFAULT_CATEGORY_BY_LANG: Record<'tr' | 'en', string> = {
  tr: 'Ana Yemek',
  en: 'Main Dish',
};

export const CategoryFoods: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { addToCart, getRemainingStock } = useCart();
  const params = useLocalSearchParams();
  const categoryName = (params.category as string) || DEFAULT_CATEGORY_BY_LANG[currentLanguage];
  const [searchQuery, setSearchQuery] = useState('');

  // Get foods for the selected category
  const categoryFoodsMap = getCategoryFoods(currentLanguage);
  const categoryFoods = categoryFoodsMap[categoryName] || [];
  const categoryFoodsWithStock = useMemo(
    () =>
      categoryFoods.map((food) => {
        const baseStock = typeof (food as any).currentStock === 'number' ? (food as any).currentStock : 10;
        const remaining = getRemainingStock(String(food.id), baseStock);
        return {
          ...food,
          currentStock: remaining,
          dailyStock: typeof (food as any).dailyStock === 'number' ? (food as any).dailyStock : baseStock,
        };
      }),
    [categoryFoods, getRemainingStock]
  );

  const filteredFoods = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryFoodsWithStock;

    return categoryFoodsWithStock.filter((food) =>
      food.name.toLowerCase().includes(query) ||
      food.cookName.toLowerCase().includes(query) ||
      String(food.distance || '').toLowerCase().includes(query)
    );
  }, [categoryFoodsWithStock, searchQuery]);

  const handleAddToCart = (
    foodId: string,
    quantity: number,
    deliveryOption?: 'pickup' | 'delivery'
  ) => {
    const food = categoryFoodsWithStock.find((item) => item.id === foodId);
    if (!food || quantity <= 0) {
      return;
    }

    const liveStock = typeof (food as any).currentStock === 'number' ? (food as any).currentStock : 0;
    if (liveStock < quantity) {
      Alert.alert(
        currentLanguage === 'en' ? 'Out of Stock' : 'Stok Tükendi',
        currentLanguage === 'en' ? 'This meal has no remaining stock.' : 'Bu yemekte yeterli kalan stok yok.'
      );
      return false;
    }

    const availableOptions: ('pickup' | 'delivery')[] = [];
    if (food.hasPickup) availableOptions.push('pickup');
    if (food.hasDelivery) availableOptions.push('delivery');

    const finalDeliveryOption =
      deliveryOption ||
      (availableOptions.includes('pickup') ? 'pickup' : availableOptions[0]);

    const cartCount = addToCart(
      {
        id: food.id,
        name: food.name,
        cookName: food.cookName,
        price: food.price,
        currentStock: liveStock,
        dailyStock: typeof (food as any).dailyStock === 'number' ? (food as any).dailyStock : liveStock,
        deliveryOption: finalDeliveryOption,
        availableOptions,
      },
      quantity
    );

    return cartCount;
  };

  const handleBackPress = () => {
    router.back();
  };

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
          <View style={styles.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmit={setSearchQuery}
              placeholder={t('searchPlaceholder')}
              showFilter={false}
            />
          </View>
          <Text variant="body" color="textSecondary" style={styles.foodCount}>
            {t('categoryFoodsScreen.count', { count: filteredFoods.length })}
          </Text>
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
  searchWrap: {
    marginBottom: Spacing.sm,
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
