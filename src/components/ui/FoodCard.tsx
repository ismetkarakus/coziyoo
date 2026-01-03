import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { Colors, Spacing, commonStyles } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';

// Default images for food items (using placeholder URLs for now)
const getDefaultImage = (foodName: string) => {
  const foodImages: { [key: string]: string } = {
    'Ev Yapımı Mantı': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=200&fit=crop',
    'Karnıyarık': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=200&fit=crop',
    'Baklava': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop',
  };
  
  return { uri: foodImages[foodName] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop' };
};

interface FoodCardProps {
  id: string;
  name: string;
  cookName: string;
  rating: number;
  price: number;
  distance: string;
  imageUrl?: string;
  hasPickup?: boolean;
  hasDelivery?: boolean;
  onAddToCart?: (id: string, quantity: number) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  id,
  name,
  cookName,
  rating,
  price,
  distance,
  imageUrl,
  hasPickup = true,
  hasDelivery = false,
  onAddToCart,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [quantity, setQuantity] = useState(0);

  const handlePress = () => {
    const foodImageUrl = imageUrl || getDefaultImage(name).uri;
    router.push(`/(tabs)/food-detail?id=${id}&name=${encodeURIComponent(name)}&imageUrl=${encodeURIComponent(foodImageUrl)}`);
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onAddToCart?.(id, newQuantity);
  };

  const decrementQuantity = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onAddToCart?.(id, newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (quantity === 0) {
      incrementQuantity();
    }
  };

  return (
    <Card variant="default" padding="none" style={styles.card}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.pressable}>
        <View style={styles.content}>
          {/* Food Image - FLUSH LEFT */}
          <View style={styles.imageContainer}>
            <Image 
              source={imageUrl ? { uri: imageUrl } : getDefaultImage(name)} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Food info */}
          <View style={styles.info}>
            <View style={styles.headerRow}>
              <Text variant="subheading" weight="semibold" numberOfLines={1} style={styles.foodName}>
                {name} (Türk)
              </Text>
            </View>
            
            <View style={styles.cookInfo}>
              <Text variant="body" color="textSecondary" style={styles.cookName}>
                {cookName}
              </Text>
            </View>

            <View style={styles.ratingDistance}>
              <Text variant="body" color="textSecondary">
                ⭐ {rating.toFixed(1)} • {distance}
              </Text>
            </View>

            {/* Badges */}
            <View style={styles.badges}>
              {hasPickup && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text variant="caption" style={{ color: 'white', fontWeight: '500' }}>
                    Pickup
                  </Text>
                </View>
              )}
              {hasDelivery && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text variant="caption" style={{ color: 'white', fontWeight: '500' }}>
                    Delivery
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Right side controls */}
          <View style={styles.rightControls}>
            {/* Price */}
            <Text variant="subheading" weight="bold" color="text" style={styles.price}>
              ₺{price}
            </Text>
            
            {/* Quantity controls */}
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                onPress={decrementQuantity}
                style={[styles.quantityButton, { backgroundColor: colors.surface }]}
              >
                <Text variant="body" weight="semibold" color="text">-</Text>
              </TouchableOpacity>
              <Text variant="body" weight="bold" style={styles.quantityText}>
                {quantity}
              </Text>
              <TouchableOpacity 
                onPress={incrementQuantity}
                style={[styles.quantityButton, { backgroundColor: colors.surface }]}
              >
                <Text variant="body" weight="semibold" color="text">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to cart button - Bottom Right Corner */}
          <TouchableOpacity 
            onPress={handleAddToCart}
            style={[styles.addToCartButtonBottomRight, { backgroundColor: colors.primary }]}
          >
            <Text variant="body" weight="medium" style={{ color: 'white', fontSize: 11 }}>
              Sepete Ekle
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.xs, // Reduced from md to xs for tighter spacing
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden', // Ensure image can be flush to edge
  },
  pressable: {
    // No padding - allows image to be flush
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative', // Allow absolute positioning for button
    minHeight: 130, // Increased to match new image height
  },
  imageContainer: {
    width: 120, // Expanded from 90 to 120 (right expansion)
    height: 130, // Further expanded from 110 to 130 (more downward expansion)
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 16, // Added right side rounding
    borderBottomRightRadius: 16, // Added right side rounding
    overflow: 'hidden',
    marginHorizontal: 0, // Ensure no horizontal margins like detail page
    paddingHorizontal: 0, // Ensure no horizontal padding like detail page
  },
  image: {
    width: '100%', // Use percentage like detail page
    height: '100%', // Use percentage like detail page
    marginHorizontal: 0, // No horizontal margins like detail page
    paddingHorizontal: 0, // No horizontal padding like detail page
  },
  info: {
    flex: 1,
    paddingLeft: Spacing.sm, // Reduced gap between image and content
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  foodName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cookInfo: {
    marginBottom: Spacing.xs,
  },
  cookName: {
    fontSize: 14,
  },
  ratingDistance: {
    marginBottom: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rightControls: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start', // Changed from space-between to flex-start
    minWidth: 100,
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  price: {
    fontSize: 16, // Reduced from 20 to 16
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Further reduced gap
    backgroundColor: '#F5F5F5',
    borderRadius: 12, // Smaller radius
    padding: 1, // Further reduced padding
    marginTop: Spacing.md, // Add top margin to push down
    marginBottom: Spacing.xs,
  },
  quantityButton: {
    width: 22, // Further reduced from 26 to 22
    height: 22, // Further reduced from 26 to 22
    borderRadius: 3, // Smaller radius
    ...commonStyles.flex.center,
    backgroundColor: '#FFFFFF',
  },
  quantityText: {
    minWidth: 16, // Further reduced from 20 to 16
    textAlign: 'center',
    fontSize: 12, // Further reduced from 14 to 12
    color: '#2E2E2E',
    fontWeight: 'bold',
  },
  addToCartButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4, // Same as badge padding
    borderRadius: 6, // Same as badge radius
    minWidth: 70,
    alignItems: 'center',
  },
  addToCartButtonBottomRight: {
    position: 'absolute',
    bottom: Spacing.sm, // Distance from bottom edge
    right: Spacing.sm, // Distance from right edge
    paddingHorizontal: Spacing.xs, // Smaller padding
    paddingVertical: 3, // Smaller vertical padding
    borderRadius: 6, // Badge format radius
    minWidth: 60, // Smaller width
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Add shadow for visibility
  },
});
