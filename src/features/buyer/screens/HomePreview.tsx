import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text } from '../../../components/ui';
import { Spacing } from '../../../theme';
import foods from '../../../mock/foods.json';
import { MockFood } from '../../../mock/data';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';

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

export const HomePreview: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | 'main' | 'soup' | 'meze' | 'dessert'>('all');
  const categories = useMemo(
    () =>
      currentLanguage === 'en'
        ? [
            { id: 'all' as const, label: 'All' },
            { id: 'main' as const, label: 'Main Course' },
            { id: 'soup' as const, label: 'Soup' },
            { id: 'meze' as const, label: 'Meze' },
            { id: 'dessert' as const, label: 'Dessert' },
          ]
        : [
            { id: 'all' as const, label: 'Tümü' },
            { id: 'main' as const, label: 'Ana Yemek' },
            { id: 'soup' as const, label: 'Çorba' },
            { id: 'meze' as const, label: 'Meze' },
            { id: 'dessert' as const, label: 'Tatlı' },
          ],
    [currentLanguage]
  );

  const getCategoryId = (rawCategory: string): 'main' | 'soup' | 'meze' | 'dessert' => {
    if (rawCategory === 'Çorba' || rawCategory === 'Soup') return 'soup';
    if (rawCategory === 'Meze') return 'meze';
    if (
      rawCategory === 'Tatlı' ||
      rawCategory === 'Dessert' ||
      rawCategory === 'Tatlı/Kek' ||
      rawCategory === 'Dessert/Cake'
    ) {
      return 'dessert';
    }
    return 'main';
  };

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
    };
    return map[category] || category;
  };

  const homeItems = useMemo(
    () =>
      (foods as MockFood[]).map((food, index) => ({
        id: food.id,
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
        categoryId: getCategoryId(food.category || 'Ana Yemek'),
        currentStock: typeof food.currentStock === 'number' ? food.currentStock : 0,
        dailyStock: typeof food.dailyStock === 'number' ? food.dailyStock : 0,
        hasPickup: food.hasPickup !== false,
        hasDelivery: food.hasDelivery !== false,
        img:
          food.imageUrl ||
          `https://placehold.co/320x320/E8E6E1/4B5563?text=${encodeURIComponent(food.name || (currentLanguage === 'en' ? `Meal ${index + 1}` : `Yemek ${index + 1}`))}`,
      })),
    [currentLanguage, formatCurrency]
  );

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === 'all') return homeItems;
    return homeItems.filter((item) => item.categoryId === selectedCategoryId);
  }, [homeItems, selectedCategoryId]);

  const openFoodDetail = (item: (typeof homeItems)[number]): void => {
    router.push(
      `/food-detail-order?id=${encodeURIComponent(item.id)}&name=${encodeURIComponent(item.title)}&cookName=${encodeURIComponent(item.cook)}&imageUrl=${encodeURIComponent(item.img)}&price=${item.numericPrice}` as any
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.backButton} />
          <View style={styles.heroCenter}>
            <Text style={styles.logo}>Coziyoo</Text>
            <Text style={styles.slogan}>
              {currentLanguage === 'en' ? 'Home Food · Nearby' : 'Ev Yemeği · Yakınında'}
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchInputWrap}>
            <MaterialIcons name="search" size={20} color="#7A7A7A" />
            <Text style={styles.searchText}>
              {currentLanguage === 'en' ? 'What would you like to eat today?' : 'Bugün ne yemek istersin?'}
            </Text>
          </View>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.85}>
            <MaterialIcons name="filter-list" size={18} color="#7A7A7A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.pinButton}>
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openFoodDetail(item)}
                style={styles.headerLeft}
              >
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.title}
                </Text>
                <Text style={styles.stockInline}>
                  {item.currentStock}/{item.dailyStock} {currentLanguage === 'en' ? 'pcs' : 'adet'}
                </Text>
              </TouchableOpacity>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.favButton} activeOpacity={0.8}>
                  <MaterialIcons name="favorite-border" size={18} color="#9CA3AF" />
                </TouchableOpacity>
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
            </View>

            <View style={styles.cardContentRow}>
              <View style={styles.imageColumn}>
                <View style={styles.imageWrap}>
                  <TouchableOpacity activeOpacity={0.85} onPress={() => openFoodDetail(item)}>
                    <Image source={{ uri: item.img }} style={styles.cardImage} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={() => {}}>
                    <MaterialIcons name="add" size={24} color={PREVIEW_COLORS.accent} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardBodyTop}>
                  <Text style={styles.metaTitle}>{item.category}</Text>
                  <Text style={styles.metaDescription} numberOfLines={3} ellipsizeMode="tail">
                    {item.description}
                  </Text>
                </View>
                <View style={styles.metaDeliveryRow}>
                  <View style={styles.deliveryInline}>
                    {item.hasPickup ? (
                      <View style={styles.deliveryItem}>
                        <Text style={styles.deliveryEmoji}>🚶</Text>
                        <Text style={styles.deliveryLabel}>{currentLanguage === 'en' ? 'Pickup' : 'Al'}</Text>
                      </View>
                    ) : null}
                    {item.hasDelivery ? (
                      <View style={styles.deliveryItem}>
                        <Text style={styles.deliveryEmoji}>🚚</Text>
                        <Text style={styles.deliveryLabel}>{currentLanguage === 'en' ? 'Delivery' : 'Getir'}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.cardFooterRow}>
              <TouchableOpacity
                style={styles.cookLink}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/seller-public-profile?cookName=${encodeURIComponent(item.cook)}` as any)
                }
              >
                <Text style={styles.cook}>{item.cook}</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.footerRight}>
                <View style={styles.cookRating}>
                  <View style={styles.cookStars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <MaterialIcons
                        key={`${item.id}-star-${index}`}
                        name={index < Math.round(item.rating) ? 'star' : 'star-border'}
                        size={11}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text style={styles.cookRatingText}>{item.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  searchText: {
    color: '#7A7A7A',
    fontSize: 15,
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
    gap: 3,
  },
  card: {
    backgroundColor: PREVIEW_COLORS.surface,
    borderRadius: 18,
    paddingTop: 6,
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: PREVIEW_COLORS.border,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  stockInline: {
    fontSize: 12,
    fontWeight: '700',
    color: PREVIEW_COLORS.textMuted,
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
  metaTitle: {
    color: PREVIEW_COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  metaDescription: {
    color: PREVIEW_COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 1,
  },
  metaDeliveryRow: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  deliveryInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-start',
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliveryEmoji: {
    fontSize: 14,
    lineHeight: 16,
  },
  deliveryLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: PREVIEW_COLORS.textMuted,
  },
  cook: {
    fontSize: 13.5,
    fontWeight: '700',
    color: PREVIEW_COLORS.text,
    flexShrink: 1,
    paddingTop: 6,
    paddingBottom: 2,
  },
  cookLink: {
    marginLeft: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  cardFooterRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cookRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    justifyContent: 'flex-end',
  },
  cookStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  cookRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
});
