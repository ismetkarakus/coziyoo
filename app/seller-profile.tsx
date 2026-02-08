import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, FoodCard, Card, HeaderBackButton } from '@/src/components/ui';
import { TopBar } from '@/src/components/layout';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useCart } from '@/src/context/CartContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Mock seller data
const SELLER_DATA: { [key: string]: any } = {
  'Ayşe Hanım': {
    name: 'Ayşe Hanım',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    totalOrders: 156,
    joinDate: 'Ocak 2023',
    description: 'Ev yemekleri konusunda 15 yıllık deneyimim var. Geleneksel Türk mutfağının lezzetlerini sizlerle paylaşmaktan mutluluk duyuyorum.',
    specialties: ['Türk Mutfağı', 'Ev Yemekleri', 'Hamur İşleri', 'Çorbalar'],
    location: 'Kadıköy, İstanbul',
    distance: '1.2 km',
  },
  'Mehmet Usta': {
    name: 'Mehmet Usta',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    totalOrders: 203,
    joinDate: 'Mart 2023',
    description: 'Profesyonel aşçı olarak 20 yıllık deneyimim var. Özellikle kebap ve ızgara yemeklerde uzmanım.',
    specialties: ['Kebap', 'Izgara', 'Et Yemekleri', 'Pide'],
    location: 'Üsküdar, İstanbul',
    distance: '2.5 km',
  },
  'Fatma Teyze': {
    name: 'Fatma Teyze',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    totalOrders: 89,
    joinDate: 'Mayıs 2023',
    description: 'Geleneksel ev yemeklerini modern dokunuşlarla hazırlıyorum. Her yemekte sevgi ve özen var.',
    specialties: ['Ev Yemekleri', 'Sebze Yemekleri', 'Börek', 'Tatlılar'],
    location: 'Beşiktaş, İstanbul',
    distance: '3.1 km',
  },
  'Ali Usta': {
    name: 'Ali Usta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.5,
    totalOrders: 124,
    joinDate: 'Şubat 2023',
    description: 'Döner ve kebap konusunda uzmanım. 10 yıllık esnaf deneyimim var.',
    specialties: ['Döner', 'Kebap', 'Pide', 'Lahmacun'],
    location: 'Fatih, İstanbul',
    distance: '2.8 km',
  },
  'Zeynep Hanım': {
    name: 'Zeynep Hanım',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    totalOrders: 178,
    joinDate: 'Ocak 2023',
    description: 'Sağlıklı ve lezzetli yemekler yapıyorum. Organik malzemeler kullanmaya özen gösteriyorum.',
    specialties: ['Sağlıklı Yemekler', 'Salata', 'Smoothie', 'Vejetaryen'],
    location: 'Şişli, İstanbul',
    distance: '1.8 km',
  },
  'Hasan Usta': {
    name: 'Hasan Usta',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    rating: 4.4,
    totalOrders: 95,
    joinDate: 'Haziran 2023',
    description: 'Geleneksel Türk mutfağından lezzetli yemekler hazırlıyorum. Özellikle çorbalar ve mezeler.',
    specialties: ['Çorba', 'Meze', 'Pilav', 'Türk Mutfağı'],
    location: 'Beyoğlu, İstanbul',
    distance: '2.2 km',
  },
  'Zehra Hanım': {
    name: 'Zehra Hanım',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    totalOrders: 142,
    joinDate: 'Nisan 2023',
    description: 'Ev yapımı tatlılar ve kekler konusunda uzmanım. Her tarif ailemden gelen geleneksel tarifler.',
    specialties: ['Tatlı', 'Kek', 'Kurabiye', 'Pasta'],
    location: 'Bakırköy, İstanbul',
    distance: '4.2 km',
  },
  'Gül Teyze': {
    name: 'Gül Teyze',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    totalOrders: 67,
    joinDate: 'Temmuz 2023',
    description: 'Kahvaltı hazırlıkları ve börek yapımında çok iyiyim. Taze malzemeler kullanırım.',
    specialties: ['Kahvaltı', 'Börek', 'Reçel', 'Tereyağı'],
    location: 'Maltepe, İstanbul',
    distance: '5.1 km',
  },
  'Elif Hanım': {
    name: 'Elif Hanım',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    totalOrders: 198,
    joinDate: 'Aralık 2022',
    description: 'Modern mutfak teknikleri ile geleneksel lezzetleri birleştiriyorum. Yaratıcı tariflerim var.',
    specialties: ['Fusion Mutfak', 'Salata', 'Smoothie Bowl', 'Sağlıklı Atıştırmalık'],
    location: 'Nişantaşı, İstanbul',
    distance: '3.7 km',
  },
};

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
  
  const cookName = params.cookName as string;
  const sellerData = SELLER_DATA[cookName];
  const sellerFoods = getAllFoodsForSeller(cookName);
  
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
        title={sellerData.name}
        leftComponent={<HeaderBackButton />}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seller Info */}
        <Card variant="default" padding="lg" style={styles.sellerCard}>
          <View style={styles.sellerHeader}>
            <Image 
              source={{ uri: sellerData.avatar }}
              style={styles.avatar}
            />
            <View style={styles.sellerInfo}>
              <Text variant="heading" weight="bold">
                {sellerData.name}
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
