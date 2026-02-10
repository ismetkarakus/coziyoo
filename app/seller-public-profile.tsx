import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, FoodCard, Card, HeaderBackButton } from '@/src/components/ui';
import { TopBar } from '@/src/components/layout';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useCart } from '@/src/context/CartContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import sellerMock from '@/src/mock/seller.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/src/hooks/useTranslation';

// Import foods from Home.tsx (in real app, this would be from API)
const getAllFoodsForSeller = (cookName: string) => {
  // This would normally come from API, but for demo we'll use mock data
  const MOCK_FOODS = [
    // Ayşe Hanım's foods across categories
    {
      id: '1',
      name: 'Ev Yapımı Mantı',
      cookName: 'Ayşe Hanım',
      rating: 4.8,
      price: 35,
      distance: '3 km',
      category: 'Ana Yemek',
      hasPickup: true,
      hasDelivery: true,
      availableDates: '15-20 Ocak',
      currentStock: 8,
      dailyStock: 10,
      maxDeliveryDistance: 3,
      availableDeliveryOptions: ['pickup', 'delivery'],
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
      availableDeliveryOptions: ['pickup', 'delivery'],
    },
    {
      id: '15',
      name: 'Vejetaryen Köfte',
      cookName: 'Ayşe Hanım',
      rating: 4.6,
      price: 24,
      distance: '1.5 km',
      category: 'Vejetaryen',
      hasPickup: true,
      hasDelivery: true,
      availableDates: '17-24 Ocak',
      currentStock: 8,
      dailyStock: 10,
      maxDeliveryDistance: 2,
      availableDeliveryOptions: ['pickup', 'delivery'],
    },
    {
      id: '21',
      name: 'Ev Yapımı Sütlaç',
      cookName: 'Ayşe Hanım',
      rating: 4.9,
      price: 16,
      distance: '1.2 km',
      category: 'Tatlı/Kek',
      hasPickup: true,
      hasDelivery: true,
      availableDates: '18-25 Ocak',
      currentStock: 12,
      dailyStock: 15,
      maxDeliveryDistance: 1.5,
      availableDeliveryOptions: ['pickup', 'delivery'],
    },
    // Add more sellers' foods here...
  ];

  return MOCK_FOODS.filter(food => food.cookName === cookName);
};

export default function SellerProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const [foodStocks, setFoodStocks] = useState<{ [key: string]: number }>({});
  const { currentLanguage } = useTranslation();
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

  const handleAddToCart = (foodId: string, quantity: number, deliveryOption?: 'pickup' | 'delivery') => {
    const food = sellerFoods.find(f => f.id === foodId);
    if (food && quantity > 0) {
      // Get current stock (from foodStocks state or original stock)
      const currentStock = foodStocks[foodId] ?? food.currentStock ?? 0;
      
      if (currentStock >= quantity) {
        // Update local stock state immediately for UI feedback
        const newStock = currentStock - quantity;
        setFoodStocks(prev => ({
          ...prev,
          [foodId]: newStock
        }));
        
        // Determine available options
        const availableOptions: ('pickup' | 'delivery')[] = Array.isArray((food as any).availableDeliveryOptions)
          && (food as any).availableDeliveryOptions.length > 0
            ? (food as any).availableDeliveryOptions
            : [];
        if (availableOptions.length === 0) {
          if (food.hasPickup) availableOptions.push('pickup');
          if (food.hasDelivery) availableOptions.push('delivery');
        }
        
        // Set default delivery option if not provided
        const finalDeliveryOption = deliveryOption || (availableOptions.length === 1 ? availableOptions[0] : undefined);
        
        const rawDeliveryFee = (food as any).deliveryFee;
        const parsedDeliveryFee =
          typeof rawDeliveryFee === 'number'
            ? rawDeliveryFee
            : typeof rawDeliveryFee === 'string'
              ? parseFloat(rawDeliveryFee)
              : 0;

        addToCart({
          id: food.id,
          name: food.name,
          price: food.price,
          cookName: food.cookName,
          imageUrl: '',
          currentStock: newStock,
          dailyStock: food.dailyStock,
          deliveryOption: finalDeliveryOption,
          availableOptions: availableOptions,
          deliveryFee: food.hasDelivery ? (Number.isFinite(parsedDeliveryFee) ? parsedDeliveryFee : 0) : 0,
          allergens: (food as any).allergens || [],
        }, quantity);
        
        console.log(`Added ${quantity} of ${food.name} to cart from seller profile. Remaining stock: ${newStock}`);
      } else {
        console.log(`Not enough stock for ${food.name}. Available: ${currentStock}, Requested: ${quantity}`);
      }
    }
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
                <FontAwesome name="star" size={16} color="#FFD700" />
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
              
              {foods.map((food) => (
                <FoodCard
                  key={food.id}
                  {...food}
                  displayCookName={displayNickname || displayName}
                  currentStock={foodStocks[food.id] ?? food.currentStock}
                  onAddToCart={handleAddToCart}
                  isPreview={false}
                  showAvailableDates={true}
                />
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
});
