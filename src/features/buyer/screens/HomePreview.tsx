import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text } from '../../../components/ui';
import { Spacing } from '../../../theme';

const DEMO_CATEGORIES = ['Tümü', 'Ana Yemek', 'Çorba', 'Meze', 'Tatlı'];

const DEMO_ITEMS = [
  {
    id: 'demo-1',
    title: 'Ev Yapımı Mantı',
    price: '₺35.00',
    cook: 'Ayşe Hanım',
    rating: 4.8,
    description: 'İnce hamur, bol yoğurt ve tereyağlı sos.',
    ingredients: 'Un, kıyma, yoğurt, sarımsak, tereyağı',
    img: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=320&h=320&fit=crop',
  },
  {
    id: 'demo-2',
    title: 'Karnıyarık',
    price: '₺28.00',
    cook: 'Mehmet Usta',
    rating: 4.7,
    description: 'Fırında pişmiş patlıcan, kıymalı iç harç.',
    ingredients: 'Patlıcan, kıyma, soğan, domates, biber',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=320&h=320&fit=crop',
  },
  {
    id: 'demo-3',
    title: 'Mercimek Çorbası',
    price: '₺22.00',
    cook: 'Fatma Teyze',
    rating: 4.9,
    description: 'Günlük taze pişen, limonla servis edilir.',
    ingredients: 'Kırmızı mercimek, soğan, havuç, baharat',
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=320&h=320&fit=crop',
  },
];

export const HomePreview: React.FC = () => {
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: '#F3F1EF' }]}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.backButton} />
          <View style={styles.heroCenter}>
            <Text style={styles.logo}>Coziyoo</Text>
            <Text style={styles.slogan}>Ev Yemeği · Yakınında</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchInputWrap}>
            <MaterialIcons name="search" size={20} color="#7A7A7A" />
            <Text style={styles.searchText}>Bugün ne yemek istersin?</Text>
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
          {DEMO_CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                index === 1 ? styles.categoryChipActive : null,
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryText, index === 1 ? styles.categoryTextActive : null]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {DEMO_ITEMS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setExpandedFoodId((prev) => (prev === item.id ? null : item.id))}
                style={styles.headerLeft}
              >
                <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                  {item.title}
                </Text>
                <Text style={styles.stockInline}>8/Ps</Text>
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
                  <Image source={{ uri: item.img }} style={styles.cardImage} />
                  <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={() => {}}>
                    <MaterialIcons name="add" size={22} color="#16A34A" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardBodyTop}>
                  <Text style={styles.metaTitle}>
                    Türk mutfağı · <Text style={styles.metaDate}>20 Ocak</Text>
                  </Text>
                  <Text style={styles.metaDescription}>{item.description}</Text>
                  <Text style={styles.metaIngredients}>
                    <Text style={styles.ingredientsLabel}>Malzemeler: </Text>
                    {item.ingredients}
                  </Text>
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
                <View style={styles.deliveryInline}>
                  <View style={styles.deliveryItem}>
                    <Text style={styles.deliveryEmoji}>🚶</Text>
                    <Text style={styles.deliveryLabel}>Al</Text>
                  </View>
                  <View style={styles.deliveryItem}>
                    <Text style={styles.deliveryEmoji}>🚚</Text>
                    <Text style={styles.deliveryLabel}>Getir</Text>
                  </View>
                </View>
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
  },
  hero: {
    backgroundColor: '#D6DDD5',
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
    color: '#305846',
  },
  slogan: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687067',
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E2E4E7',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: '#8DA08D',
    borderColor: '#8DA08D',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingTop: 6,
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
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
    bottom: -6,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  imageColumn: {
    width: 114,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: -2,
  },
  cardBody: {
    flex: 1,
    minHeight: 94,
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
    color: '#4B5563',
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
    color: '#6B7280',
  },
  priceBadge: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  priceText: {
    color: '#2E7D32',
    fontWeight: '800',
    fontSize: 14,
  },
  metaTitle: {
    color: '#5E6672',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  metaDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A8089',
  },
  metaDescription: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 1,
  },
  metaIngredients: {
    color: '#5E6672',
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 4,
  },
  ingredientsLabel: {
    color: '#5E6672',
    fontWeight: '700',
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
    color: '#6B7280',
  },
  cook: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#4B5563',
    flexShrink: 1,
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
