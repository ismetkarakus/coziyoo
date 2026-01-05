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
    'Ev Yapımı Mantı': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=320&h=280&fit=crop',
    'Karnıyarık': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop',
    'Baklava': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop',
    'Kuru fasülye pilav': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=320&h=280&fit=crop',
    'Tavuk pilav': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=320&h=280&fit=crop',
    'Helva': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=320&h=280&fit=crop',
  };
  
  return { uri: foodImages[foodName] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=320&h=280&fit=crop' };
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
  maxDeliveryDistance?: number; // Satıcının belirlediği maksimum teslimat mesafesi
  country?: string; // Ülke bilgisi
  isPreview?: boolean; // Önizleme modunda local resimlere izin ver
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
  maxDeliveryDistance,
  country = 'Türk', // Default olarak Türk
  isPreview = false, // Default olarak false
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { cartItems, addToCart, removeFromCart } = useCart();
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  
  // Local quantity state (not in cart yet)
  const [localQuantity, setLocalQuantity] = useState(0);
  
  // Get current quantity from cart (for display purposes)
  const cartItem = cartItems.find(item => item.id === id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handlePress = () => {
    console.log('FoodCard pressed:', name, id, 'by', cookName);
    const foodImageUrl = imageUrl || getDefaultImage(name).uri;
    const deliveryTypeText = selectedDeliveryType === 'pickup' ? 'Pickup' : 'Delivery';
    const route = `/(tabs)/food-detail?id=${id}&name=${encodeURIComponent(name)}&cookName=${encodeURIComponent(cookName)}&imageUrl=${encodeURIComponent(foodImageUrl)}&deliveryType=${encodeURIComponent(deliveryTypeText)}&availableDates=${encodeURIComponent(availableDates || '')}&currentStock=${currentStock || 0}&dailyStock=${dailyStock || 0}`;
    console.log('Navigating to:', route);
    router.push(route);
  };

  const incrementQuantity = () => {
    if (currentStock !== undefined && localQuantity >= currentStock) {
      Alert.alert('Stok Yetersiz', `Sadece ${currentStock} adet ${name} kaldı.`);
      return;
    }
    
    setLocalQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (localQuantity > 0) {
      setLocalQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (localQuantity > 0) {
      // Show confirmation dialog
      Alert.alert(
        'Sepete Ekle', 
        `${localQuantity} adet ${name} sepete eklensin mi?`,
        [
          {
            text: 'Hayır',
            style: 'cancel',
          },
          {
            text: 'Evet',
            onPress: () => {
              // Add to actual cart
              addToCart({
                id,
                name,
                cookName,
                price,
                imageUrl,
              }, localQuantity);
              
              // Call parent callback
              onAddToCart?.(id, localQuantity);
              
              // Reset local quantity
              setLocalQuantity(0);
              
              // No success dialog - just add to cart silently
            },
          },
        ]
      );
    } else {
      Alert.alert('Uyarı', 'Lütfen önce miktar seçin.');
    }
  };

  return (
    <Card variant="default" padding="none" style={styles.card}>
      <View style={styles.content}>
          {/* Clickable Food Image ONLY */}
          <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.imageContainer}>
            <Image 
              source={(() => {
                // Önizleme modunda veya local file varsa kullan
                if (imageUrl && (isPreview || imageUrl.startsWith('file://') || imageUrl.startsWith('http'))) {
                  return { uri: imageUrl };
                }
                
                // Default resim kullan
                return getDefaultImage(name);
              })()} 
              style={styles.image}
              resizeMode="cover"
              defaultSource={{ uri: 'https://via.placeholder.com/160x140/f5f5f5/cccccc?text=📸' }}
            />
          </TouchableOpacity>

          {/* Food info - NOT clickable */}
          <View style={styles.info}>
            <View style={styles.headerRow}>
              <Text variant="subheading" weight="semibold" numberOfLines={1} style={styles.foodName}>
                {name} ({country})
              </Text>
            </View>
            
            <View style={styles.cookInfo}>
              <Text variant="body" color="textSecondary" style={styles.cookName}>
                {cookName}
              </Text>
            </View>

      <View style={styles.ratingDistance}>
        <Text variant="caption" color="textSecondary" style={{ fontSize: 11 }}>
          ⭐ {rating.toFixed(1)} • {maxDeliveryDistance ? `${maxDeliveryDistance} km teslimat` : distance}
        </Text>
      </View>

      {/* Date Range and Stock Info */}
      <View style={styles.availabilityInfo}>
        <Text variant="caption" color="textSecondary" style={styles.compactDateText}>
          📅 {availableDates || 'Tarih belirtilmemiş'} • {currentStock || 0} adet
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
                  <Text variant="body" weight="medium" style={{ 
                    color: selectedDeliveryType === 'pickup' ? 'white' : colors.primary, 
                    fontSize: 11 // Same as sepete ekle button
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
                  <Text variant="body" weight="medium" style={{ 
                    color: selectedDeliveryType === 'delivery' ? 'white' : colors.primary, 
                    fontSize: 11 // Same as sepete ekle button
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
                {localQuantity}
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
    marginBottom: 4, // Minimal spacing between cards
    borderRadius: 16, // Restore original radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden', // Ensure image can be flush to edge
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Back to flex-start
    position: 'relative', // Allow absolute positioning for button
    minHeight: 140, // Slightly reduced height
  },
  imageContainer: {
    width: 160, // Narrower width - reduced from 180 to 160
    height: 140, // Same height
    borderRadius: 16, // ✅ Tüm köşeler oval (container da)
    overflow: 'hidden',
    position: 'relative', // Enable absolute positioning for child image
    backgroundColor: '#f5f5f5', // Light background for loading state
    margin: 0,
    padding: 0,
    justifyContent: 'center', // Center the image
    alignItems: 'center', // Center the image
  },
  image: {
    width: '100%', // Full width like detail page
    height: '100%', // Full height like detail page
    position: 'absolute', // Position absolute to fill container completely
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    padding: 0,
    borderRadius: 16, // ✅ Tüm köşeler oval
  },
  info: {
    flex: 1,
    paddingLeft: 10, // Slightly more space for readability
    paddingRight: 4,
    paddingVertical: 4, // Reduced vertical spacing
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 1, // Minimal margin
  },
  foodName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cookInfo: {
    marginBottom: 1, // Minimal margin
  },
  cookName: {
    fontSize: 12, // Smaller font
  },
  ratingDistance: {
    marginBottom: 1, // Minimal margin
  },
  availabilityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1, // Minimal margin
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.xs, // Same as sepete ekle button
    paddingVertical: 1, // Reduced from 3 to 1 for thinner buttons
    borderRadius: 6, // Same as sepete ekle button
    minWidth: 60, // Same as sepete ekle button
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Same shadow as sepete ekle button
  },
  rightControls: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start', // Changed from space-between to flex-start
    minWidth: 80,
    paddingVertical: 2, // Minimal vertical padding
    paddingRight: 8,
  },
  price: {
    fontSize: 14, // Further reduced font size
    fontWeight: 'bold',
    marginBottom: 2, // Minimal margin
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
  compactDateText: {
    fontSize: 11, // Slightly smaller for compact look
    paddingHorizontal: 4, // Narrower from sides
  },
});
