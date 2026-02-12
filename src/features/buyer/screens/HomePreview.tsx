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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
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
                  onPress={() =>
                    setExpandedFoodId((prev) => (prev === item.id ? null : item.id))
                  }
                  style={styles.titlePress}
                >
                  <View style={styles.titleRowInline}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.stockInline}>8/Ps</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.favButton} activeOpacity={0.8}>
                    <MaterialIcons name="favorite-border" size={17} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardContentRow}>
              <View style={styles.imageColumn}>
                <Image source={{ uri: item.img }} style={styles.cardImage} />
                <View style={styles.sellerRow}>
                  <TouchableOpacity
                    style={styles.cookLink}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push(`/seller-public-profile?cookName=${encodeURIComponent(item.cook)}` as any)
                    }
                  >
                    <Text style={styles.cook}>{item.cook}</Text>
                    <MaterialIcons name="chevron-right" size={14} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.meta}>Mutfak · Türk mutfağı</Text>
                <Text style={styles.metaDescription}>{item.description}</Text>
                <Text style={styles.metaIngredients}>
                  <Text style={styles.ingredientsLabel}>Malzemeler: </Text>
                  {item.ingredients}
                </Text>
                <View style={styles.deliveryInline}>
                  <Text style={styles.deliveryEmoji}>🚚</Text>
                  <Text style={styles.deliveryEmoji}>🚶</Text>
                </View>
                {expandedFoodId === item.id ? (
                  <Text style={styles.meta}>Son Tarih: 20 Ocak</Text>
                ) : null}
                <View style={styles.cardBottomRight}>
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
    paddingVertical: 4,
    gap: Spacing.xs,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchText: {
    color: '#7A7A7A',
    fontSize: 15,
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
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingTop: 2,
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  cardImage: {
    width: 122,
    height: 106,
    borderRadius: 12,
  },
  imageColumn: {
    width: 122,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: -2,
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favButton: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 18,
  },
  titlePress: {
    flexShrink: 1,
    paddingVertical: 1,
    marginRight: 8,
  },
  titleRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    color: '#305846',
    fontWeight: '700',
    fontSize: 12,
  },
  meta: {
    color: '#5E6672',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    letterSpacing: 0.05,
    marginTop: 1,
  },
  metaDescription: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 17,
    marginTop: 1,
  },
  metaIngredients: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 1,
  },
  ingredientsLabel: {
    color: '#4B5563',
    fontWeight: '700',
  },
  deliveryInline: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-start',
  },
  deliveryEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  cook: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    flexShrink: 1,
  },
  cookLink: {
    marginLeft: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  sellerRow: {
    marginTop: 2,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cardBottomRight: {
    marginTop: 2,
    alignItems: 'flex-end',
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
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
});
