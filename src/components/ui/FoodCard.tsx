import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { Colors, Spacing, commonStyles } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { useCart } from '../../context/CartContext';

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
  availableDates?: string;
  currentStock?: number;
  dailyStock?: number;
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
  availableDates,
  currentStock,
  dailyStock,
  onAddToCart,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  
  // Get current quantity from cart
  const cartItem = cartItems.find(item => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handlePress = () => {
    console.log('FoodCard pressed:', name, id, 'by', cookName);
    const foodImageUrl = imageUrl || getDefaultImage(name).uri;
    const deliveryTypeText = selectedDeliveryType === 'pickup' ? 'Pickup' : 'Delivery';
    const route = `/(tabs)/food-detail?id=${id}&name=${encodeURIComponent(name)}&cookName=${encodeURIComponent(cookName)}&imageUrl=${encodeURIComponent(foodImageUrl)}&deliveryType=${encodeURIComponent(deliveryTypeText)}&availableDates=${encodeURIComponent(availableDates || '')}&currentStock=${currentStock || 0}&dailyStock=${dailyStock || 0}`;
    console.log('Navigating to:', route);
    router.push(route);
  };

  const incrementQuantity = () => {
    if (currentStock !== undefined && quantity >= currentStock) {
      Alert.alert('Stok Yetersiz', `Sadece ${currentStock} adet ${name} kaldı.`);
      return;
    }
    
    const newQuantity = quantity + 1;
    addToCart({
      id,
      name,
      cookName,
      price,
      quantity: newQuantity,
      imageUrl,
    });
    onAddToCart?.(id, newQuantity);
  };

  const decrementQuantity = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      if (newQuantity === 0) {
        removeFromCart(id);
      } else {
        addToCart({
          id,
          name,
          cookName,
          price,
          quantity: newQuantity,
          imageUrl,
        });
      }
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
      <View style={styles.content}>
          {/* Clickable Food Image ONLY */}
          <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.imageContainer}>
            <Image 
              source={imageUrl ? { uri: imageUrl } : getDefaultImage(name)} 
              style={styles.image}
              resizeMode="cover"
              defaultSource={{ uri: 'https://via.placeholder.com/120x110/f5f5f5/cccccc?text=📸' }}
            />
          </TouchableOpacity>

          {/* Food info - NOT clickable */}
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

      {/* Date Range and Stock Info */}
      <View style={styles.availabilityInfo}>
        <Text variant="caption" color="textSecondary">
          📅 {availableDates || 'Tarih belirtilmemiş'}
        </Text>
        <Text variant="caption" color={currentStock && currentStock > 0 ? "primary" : "error"}>
          📦 {currentStock || 0}/{dailyStock || 0} kalan
        </Text>
      </View>

            {/* Badges */}
            <View style={styles.badges}>
              {hasPickup && (
                <TouchableOpacity 
                  onPress={() => setSelectedDeliveryType('pickup')}
                  style={[
                    styles.badge, 
                    { 
                      backgroundColor: selectedDeliveryType === 'pickup' ? colors.primary : colors.surface,
                      borderWidth: selectedDeliveryType === 'pickup' ? 0 : 1,
                      borderColor: colors.primary,
                    }
                  ]}
                >
                  <Text variant="caption" style={{ 
                    color: selectedDeliveryType === 'pickup' ? 'white' : colors.primary, 
                    fontWeight: '500' 
                  }}>
                    Pickup
                  </Text>
                </TouchableOpacity>
              )}
              {hasDelivery && (
                <TouchableOpacity 
                  onPress={() => setSelectedDeliveryType('delivery')}
                  style={[
                    styles.badge, 
                    { 
                      backgroundColor: selectedDeliveryType === 'delivery' ? colors.primary : colors.surface,
                      borderWidth: selectedDeliveryType === 'delivery' ? 0 : 1,
                      borderColor: colors.primary,
                    }
                  ]}
                >
                  <Text variant="caption" style={{ 
                    color: selectedDeliveryType === 'delivery' ? 'white' : colors.primary, 
                    fontWeight: '500' 
                  }}>
                    Delivery
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Right side controls - NOT clickable for navigation */}
          <View style={styles.rightControls}>
            {/* Price */}
            <Text variant="subheading" weight="bold" color="text" style={styles.price}>
              ₺{price}
            </Text>
            
            {/* Quantity controls */}
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                onPress={decrementQuantity}
                style={styles.quantityButton}
              >
                <Text variant="body" weight="semibold" style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text variant="body" weight="bold" style={styles.quantityText}>
                {quantity}
              </Text>
              <TouchableOpacity 
                onPress={incrementQuantity}
                style={styles.quantityButton}
              >
                <Text variant="body" weight="semibold" style={styles.quantityButtonText}>+</Text>
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
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative', // Allow absolute positioning for button
    minHeight: 110, // Reduced from 130 to 110
  },
  imageContainer: {
    width: 120,
    height: 110,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
    position: 'relative', // Enable absolute positioning for child image
    backgroundColor: '#f5f5f5', // Light background for loading state
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute', // Position absolute to fill container completely
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  info: {
    flex: 1,
    paddingLeft: Spacing.sm, // Reduced gap between image and content
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs, // Reduced from sm to xs for tighter vertical spacing
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
    marginBottom: Spacing.xs,
  },
  availabilityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs, // Reduced from sm to xs
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
    paddingVertical: Spacing.xs, // Reduced from sm to xs for tighter vertical spacing
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
    gap: 4, // Reduced gap for compact design
    backgroundColor: '#FFFFFF', // White background
    borderRadius: 12, // Smaller radius for compact oval
    paddingHorizontal: 6, // Reduced padding for smaller size
    paddingVertical: 3, // Reduced padding for smaller size
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    marginLeft: 'auto', // Push to right side
    alignSelf: 'flex-end', // Align to right
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Reduced shadow
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light border for definition
  },
  quantityButton: {
    width: 18, // Smaller for compact design
    height: 18, // Smaller for compact design
    borderRadius: 9, // Circular buttons
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quantityButtonText: {
    fontSize: 14, // Smaller for compact design
    fontWeight: 'bold',
    color: '#333333', // Dark color for contrast
    lineHeight: 14, // Better alignment
  },
  quantityText: {
    minWidth: 14, // Smaller for compact design
    textAlign: 'center',
    fontSize: 12, // Smaller font size
    color: '#333333', // Dark color
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
