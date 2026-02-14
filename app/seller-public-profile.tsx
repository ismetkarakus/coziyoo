import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Card, HeaderBackButton } from '@/src/components/ui';
import { TopBar } from '@/src/components/layout';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import sellerMock from '@/src/mock/seller.json';
import foodsMock from '@/src/mock/foods.json';
import { MockFood } from '@/src/mock/data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/src/hooks/useTranslation';
import { useCountry } from '@/src/context/CountryContext';

const getAllFoodsForSeller = (cookName: string) => {
  return (foodsMock as MockFood[]).filter(food => food.cookName === cookName);
};

export default function SellerProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const { currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const [overrideNickname, setOverrideNickname] = useState<string>('');
  const [overrideName, setOverrideName] = useState<string>('');
  const [overrideAvatar, setOverrideAvatar] = useState<string>('');
  
  const cookName = params.cookName as string;
  const localizedProfile = (sellerMock as any)[currentLanguage]?.profile || (sellerMock as any).tr?.profile;
  const localizedSellers = (sellerMock as any)[currentLanguage]?.sellers || (sellerMock as any).tr?.sellers || [];
  const sellerData =
    localizedSellers.find((seller: any) => seller.name === cookName) ||
    localizedSellers.find((seller: any) => seller.nickname === cookName);
  const isCurrentSeller =
    !!localizedProfile &&
    (cookName === localizedProfile.name || (localizedProfile.nickname && cookName === localizedProfile.nickname));
  const displayName = overrideName || sellerData?.name || cookName;
  const displayNickname = overrideNickname || sellerData?.nickname || '';
  const displayAvatar = overrideAvatar || sellerData?.avatar;
  const headerTitle = displayNickname || displayName || cookName;
  const sellerFoods = getAllFoodsForSeller(isCurrentSeller ? localizedProfile.name : cookName);

  useEffect(() => {
    const loadSellerProfileNickname = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('sellerProfile');
        if (!savedProfile) return;
        const profile = JSON.parse(savedProfile);
        const fullName = profile?.formData?.name?.trim();
        const nickname = profile?.formData?.nickname?.trim();
        const avatarUri = profile?.avatarUri?.trim();
        if (isCurrentSeller && fullName) {
          setOverrideName(fullName);
          if (nickname) {
            setOverrideNickname(nickname);
          }
          if (avatarUri) {
            setOverrideAvatar(avatarUri);
          }
        }
      } catch (error) {
        console.error('Error loading seller profile nickname:', error);
      }
    };

    loadSellerProfileNickname();
  }, [cookName, isCurrentSeller]);
  
  // Group foods by category
  const foodsByCategory = sellerFoods.reduce((acc, food) => {
    if (!acc[food.category]) {
      acc[food.category] = [];
    }
    acc[food.category].push(food);
    return acc;
  }, {} as { [key: string]: any[] });

  const openFoodDetail = (food: MockFood) => {
    router.push(
      `/food-detail-order?id=${encodeURIComponent(String(food.id ?? ''))}&name=${encodeURIComponent(food.name)}&cookName=${encodeURIComponent(food.cookName)}&imageUrl=${encodeURIComponent(food.imageUrl || '')}&price=${Number(food.price || 0)}` as any
    );
  };

  if (!sellerData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar 
          title="Yemek Sahibi Bulunamadı"
          leftComponent={<HeaderBackButton />}
        />
        <View style={styles.errorContainer}>
          <Text variant="heading" center>Yemek Sahibi Bulunamadı</Text>
          <Text variant="body" center color="textSecondary" style={{ marginTop: 8 }}>
            Bu yemek sahibinin profili mevcut değil veya güncellenmiyor.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={headerTitle}
        leftComponent={<HeaderBackButton />}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seller Info */}
        <Card variant="default" padding="lg" style={styles.sellerCard}>
          <View style={styles.sellerHeader}>
            <Image 
              source={{ uri: displayAvatar }}
              style={styles.avatar}
            />
            <View style={styles.sellerInfo}>
              <Text variant="heading" weight="bold">
                {displayName}
              </Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text variant="body" weight="medium" style={{ marginLeft: 4 }}>
                  {sellerData.rating}
                </Text>
                <Text variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                  ({sellerData.totalOrders} sipariş)
                </Text>
              </View>
              <Text variant="caption" color="textSecondary">
                📍 {sellerData.location} • {sellerData.distance}
              </Text>
              <Text variant="caption" color="textSecondary">
                📅 {sellerData.joinDate} tarihinden beri
              </Text>
            </View>
          </View>
          
          <Text variant="body" color="textSecondary" style={styles.description}>
            {sellerData.description}
          </Text>
          
          <View style={styles.specialtiesContainer}>
            <Text variant="subheading" weight="semibold" style={{ marginBottom: 8 }}>
              Uzmanlık Alanları:
            </Text>
            <View style={styles.specialtiesRow}>
              {sellerData.specialties.map((specialty: string, index: number) => (
                <View key={index} style={[styles.specialtyBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text variant="caption" style={{ color: colors.primary }}>
                    {specialty}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Foods by Category */}
        <View style={styles.foodsContainer}>
          <Text variant="heading" weight="bold" style={styles.sectionTitle}>
            Tüm Yemekleri ({sellerFoods.length})
          </Text>
          
          {Object.entries(foodsByCategory).map(([category, foods]) => (
            <View key={category} style={styles.categorySection}>
              <Text variant="subheading" weight="semibold" style={styles.categoryTitle}>
                {category} ({foods.length})
              </Text>
              
              {foods.map((food: MockFood) => (
                <View key={food.id} style={styles.foodCard}>
                  <View style={styles.cardHeader}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => openFoodDetail(food)}
                      style={styles.headerLeft}
                    >
                      <View style={styles.titleRow}>
                        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                          {food.name}
                        </Text>
                        <Text style={styles.stockInline}>
                          {food.currentStock ?? 0}/{food.dailyStock ?? 0} {currentLanguage === 'en' ? 'pcs' : 'adet'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                      <TouchableOpacity style={styles.favButton} activeOpacity={0.8}>
                        <MaterialIcons name="favorite-border" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                      <Text style={styles.priceText}>{formatCurrency(Number(food.price || 0))}</Text>
                    </View>
                  </View>

                  <View style={styles.cardContentRow}>
                    <View style={styles.imageColumn}>
                      <View style={styles.imageWrap}>
                        <TouchableOpacity activeOpacity={0.85} onPress={() => openFoodDetail(food)}>
                          <Image
                            source={{
                              uri:
                                food.imageUrl ||
                                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
                            }}
                            style={styles.cardImage}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={() => openFoodDetail(food)}>
                          <MaterialIcons name="add" size={24} color="#5F7F5E" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.cardBodyTop}>
                        <Text style={styles.metaTitle}>{food.category}</Text>
                        <Text style={styles.metaDescription} numberOfLines={3} ellipsizeMode="tail">
                          {food.description || food.cardSummary || ''}
                        </Text>
                      </View>
                      <View style={styles.metaDeliveryRow}>
                        <View style={styles.deliveryInline}>
                          {food.hasPickup !== false ? (
                            <View style={styles.deliveryItem}>
                              <Text style={styles.deliveryEmoji}>🚶</Text>
                              <Text style={styles.deliveryLabel}>{currentLanguage === 'en' ? 'Pickup' : 'Al'}</Text>
                            </View>
                          ) : null}
                          {food.hasDelivery ? (
                            <View style={styles.deliveryItem}>
                              <Text style={styles.deliveryEmoji}>🚚</Text>
                              <Text style={styles.deliveryLabel}>{currentLanguage === 'en' ? 'Delivery' : 'Getir'}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  sellerCard: {
    margin: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sellerHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: Spacing.md,
  },
  sellerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  description: {
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  specialtiesContainer: {
    marginTop: Spacing.sm,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  foodsContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryTitle: {
    marginBottom: Spacing.md,
    color: '#666',
    marginHorizontal: Spacing.md,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    flexShrink: 1,
  },
  stockInline: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5F7F5E',
  },
  cardContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  imageColumn: {
    width: 90,
  },
  imageWrap: {
    position: 'relative',
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  addButton: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#5F7F5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  cardBodyTop: {
    minHeight: 54,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 4,
  },
  metaDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  metaDeliveryRow: {
    marginTop: 10,
  },
  deliveryInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
});
