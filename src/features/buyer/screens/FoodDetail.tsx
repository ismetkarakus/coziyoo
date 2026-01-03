import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock data - in real app, this would come from API
const getMockFoodDetail = (name: string, imageUrl: string) => ({
  id: '1',
  name: name || 'Ev Yapımı Mantı',
  cookName: 'Ayşe Hanım',
  rating: 4.8,
  reviewCount: 24,
  price: 25,
  distance: '1.2 km',
  prepTime: '30 dk',
  description: 'Geleneksel yöntemlerle hazırlanan, ince açılmış hamur ile sarılmış, özel baharatlarla tatlandırılmış ev yapımı mantı. Yanında yoğurt ve tereyağlı sos ile servis edilir.',
  hasPickup: true,
  hasDelivery: true,
  imageUrl: imageUrl,
});

export const FoodDetail: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);

  // Get food details from URL parameters
  const foodName = params.name as string;
  const foodImageUrl = params.imageUrl as string;
  const food = getMockFoodDetail(foodName, foodImageUrl);

  const handleAddToCart = () => {
    console.log(`Added ${quantity} of ${food.name} to cart`);
    router.push('/(tabs)/cart');
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={food.name} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Food Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
          {food.imageUrl ? (
            <Image 
              source={{ uri: food.imageUrl }} 
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text variant="title" color="textSecondary">
              📸
            </Text>
          )}
        </View>

        <View style={styles.detailsContainer}>
          {/* Basic Info */}
          <Card variant="default" padding="md" style={styles.infoCard}>
            <Text variant="heading" weight="semibold" style={styles.foodName}>
              {food.name}
            </Text>
            
            <View style={styles.cookInfo}>
              <Text variant="body" color="textSecondary">
                {food.cookName}
              </Text>
              <View style={styles.rating}>
                <Text variant="body" color="textSecondary">
                  ⭐ {food.rating} ({food.reviewCount} değerlendirme)
                </Text>
              </View>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">Mesafe</Text>
                <Text variant="body" weight="medium">{food.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">Hazırlık</Text>
                <Text variant="body" weight="medium">{food.prepTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">Fiyat</Text>
                <Text variant="body" weight="semibold" color="primary">₺{food.price}</Text>
              </View>
            </View>

            {/* Delivery Options */}
            <View style={styles.deliveryOptions}>
              <Text variant="subheading" weight="medium" style={styles.deliveryTitle}>
                Teslimat Seçenekleri
              </Text>
              <View style={styles.badges}>
                {food.hasPickup && (
                  <View style={[styles.badge, { backgroundColor: colors.success }]}>
                    <Text variant="caption" style={{ color: 'white' }}>
                      ✓ Pickup (Gel Al)
                    </Text>
                  </View>
                )}
                {food.hasDelivery && (
                  <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                    <Text variant="caption" style={{ color: 'white' }}>
                      ✓ Delivery (Teslimat)
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Card>

          {/* Description */}
          <Card variant="default" padding="md" style={styles.descriptionCard}>
            <Text variant="subheading" weight="medium" style={styles.descriptionTitle}>
              Açıklama
            </Text>
            <Text variant="body" style={styles.description}>
              {food.description}
            </Text>
          </Card>

          {/* Quantity & Add to Cart */}
          <Card variant="default" padding="md" style={styles.actionCard}>
            <View style={styles.quantityContainer}>
              <Text variant="subheading" weight="medium">
                Miktar
              </Text>
              <View style={styles.quantityControls}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={decrementQuantity}
                  style={styles.quantityButton}
                >
                  -
                </Button>
                <Text variant="body" weight="semibold" style={styles.quantityText}>
                  {quantity}
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={incrementQuantity}
                  style={styles.quantityButton}
                >
                  +
                </Button>
              </View>
            </View>

            <View style={styles.totalContainer}>
              <Text variant="subheading" weight="semibold">
                Toplam: ₺{(food.price * quantity).toFixed(2)}
              </Text>
            </View>

            <Button
              variant="primary"
              fullWidth
              onPress={handleAddToCart}
              style={styles.addToCartButton}
            >
              Sepete Ekle
            </Button>
          </Card>
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
  imageContainer: {
    height: 300, // Increased height for better display
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md, // Add padding to prevent edge touching
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12, // Add rounded corners like in cards
  },
  detailsContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  infoCard: {
    marginBottom: 0,
  },
  foodName: {
    marginBottom: Spacing.sm,
  },
  cookInfo: {
    marginBottom: Spacing.md,
  },
  rating: {
    marginTop: Spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  metaItem: {
    alignItems: 'center',
  },
  deliveryOptions: {
    marginTop: Spacing.md,
  },
  deliveryTitle: {
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: commonStyles.borderRadius.sm,
  },
  descriptionCard: {
    marginBottom: 0,
  },
  descriptionTitle: {
    marginBottom: Spacing.sm,
  },
  description: {
    lineHeight: 22,
  },
  actionCard: {
    marginBottom: 0,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  quantityButton: {
    minWidth: 40,
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addToCartButton: {
    marginTop: Spacing.sm,
  },
});

