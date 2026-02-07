import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { StarRating } from './StarRating';
import { AllergenWarningModal } from './AllergenWarningModal';
import { Colors, Spacing, commonStyles } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { useCart } from '../../context/CartContext';
import { useCountry } from '../../context/CountryContext';
import { AllergenId } from '../../constants/allergens';
import { useTranslation } from '../../hooks/useTranslation';

// Category-based images for food items
const getCategoryImage = (category: string) => {
  const categoryImages: { [key: string]: string } = {
    'Ana Yemek': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop',
    'Main Dish': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop',
    'Çorba': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=320&h=280&fit=crop',
    'Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=320&h=280&fit=crop',
    'Kahvaltı': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=320&h=280&fit=crop',
    'Breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=320&h=280&fit=crop',
    'Salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop',
    'Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop',
    'Tatlı': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop',
    'Tatlı/Kek': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop',
    'Dessert': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop',
    'Dessert/Cake': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop',
    'Meze': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=320&h=280&fit=crop', // Meze tabağı
    'Appetizer': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=320&h=280&fit=crop',
    'Vejetaryen': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop', // Sebze yemekleri
    'Vegetarian': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=280&fit=crop',
    'Gluten Free': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=280&fit=crop', // Glutensiz ekmek
    'Glutensiz': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=320&h=280&fit=crop',
    'İçecekler': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=320&h=280&fit=crop', // İçecekler
    'Drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=320&h=280&fit=crop',
  };
  
  return { uri: categoryImages[category] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=320&h=280&fit=crop' };
};

// Default images for food items (fallback)
const getDefaultImage = (foodName: string) => {
  const foodImages: { [key: string]: string } = {
    'Ev Yapımı Mantı': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=320&h=280&fit=crop',
    'Homemade Manti': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=320&h=280&fit=crop',
    'Karnıyarık': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop',
    'Stuffed Eggplant': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=280&fit=crop',
    'Baklava': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop',
    'Homemade Baklava': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=320&h=280&fit=crop',
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
  onAddToCart?: (id: string, quantity: number, deliveryOption?: 'pickup' | 'delivery') => void;
  maxDeliveryDistance?: number; // Satıcının belirlediği maksimum teslimat mesafesi
  country?: string; // Ülke bilgisi
  category?: string; // Yemek kategorisi
  isPreview?: boolean; // Önizleme modunda local resimlere izin ver
  allergens?: AllergenId[]; // Alerjen bilgileri
  hygieneRating?: string; // Hijyen puanı (0-5 or 'Pending')
  availableDeliveryOptions?: ('pickup' | 'delivery')[];
  isGridMode?: boolean; // Grid düzeni için kompakt mod
  showAvailableDates?: boolean; // Ana sayfada tarih gösterimi için
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
  country,
  category, // Yemek kategorisi
  isPreview = false, // Default olarak false
  allergens, // Alerjen bilgileri
  hygieneRating, // Hijyen puanı
  availableDeliveryOptions, // Mevcut teslimat seçenekleri
  isGridMode = false, // Grid modu
  showAvailableDates = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const { cartItems, addToCart, removeFromCart } = useCart();
  const resolvedCountry = country || (currentLanguage === 'en' ? 'Turkish' : 'Türk');
  
  // Determine available options and set default selection
  const getAvailableOptions = () => {
    if (availableDeliveryOptions && availableDeliveryOptions.length > 0) {
      return availableDeliveryOptions;
    }
    // Fallback to hasPickup/hasDelivery for backward compatibility
    const options: ('pickup' | 'delivery')[] = [];
    if (hasPickup) options.push('pickup');
    if (hasDelivery) options.push('delivery');
    return options;
  };
  
  const availableOptions = getAvailableOptions();
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'pickup' | 'delivery' | null>(
    availableOptions.length === 1 ? availableOptions[0] : null // Tek seçenek varsa otomatik seç, çift seçenek varsa null
  );
  
  // Local quantity state (not in cart yet)
  const [localQuantity, setLocalQuantity] = useState(0);
  const [showAllergenModal, setShowAllergenModal] = useState(false);
  
  // Reset delivery selection when quantity becomes 0
  useEffect(() => {
    if (localQuantity === 0 && availableOptions.length > 1) {
      setSelectedDeliveryType(null); // Reset selection when quantity is 0
    }
  }, [localQuantity, availableOptions.length]);
  
  // Get current quantity from cart (for display purposes)
  const cartItem = cartItems.find(item => item.id === id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handlePress = () => {
    console.log('FoodCard pressed:', name, id, 'by', cookName);
    const foodImageUrl = imageUrl || getDefaultImage(name).uri;
    const route = `/food-detail-simple?id=${id}&name=${encodeURIComponent(name)}&cookName=${encodeURIComponent(cookName)}&imageUrl=${encodeURIComponent(foodImageUrl)}`;
    console.log('Navigating to SIMPLE FOOD DETAIL (no getTime errors):', route);
    router.push(route);
  };

  const incrementQuantity = () => {
    if (currentStock !== undefined && localQuantity >= currentStock) {
      Alert.alert(
        t('foodCard.alerts.stockInsufficientTitle'),
        t('foodCard.alerts.stockInsufficientMessage', { count: currentStock, name })
      );
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
      // Alerjen uyarısı: Sepete eklemeden önce zorunlu göster
      setShowAllergenModal(true);
    } else {
      Alert.alert(t('foodCard.alerts.warningTitle'), t('foodCard.alerts.selectQuantity'));
    }
  };

  const proceedWithAddToCart = () => {
    // Check if user needs to select delivery option
    if (availableOptions.length > 1 && selectedDeliveryType === null) {
      Alert.alert(
        t('foodCard.alerts.deliveryRequiredTitle'),
        t('foodCard.alerts.deliveryRequiredMessage'),
        [{ text: t('foodCard.alerts.ok') }]
      );
      return;
    }
    
    const deliveryText = selectedDeliveryType 
      ? `\n\n${t('foodCard.deliveryLabel')}: ${selectedDeliveryType === 'pickup' ? t('foodCard.pickupWithIcon') : t('foodCard.deliveryWithIcon')}`
      : '';
    
    Alert.alert(
      t('foodCard.alerts.addToCartTitle'),
      t('foodCard.alerts.addToCartMessage', { count: localQuantity, name }) + deliveryText,
      [
        {
          text: t('foodCard.alerts.no'),
          style: 'cancel',
        },
        {
          text: t('foodCard.alerts.yes'),
          onPress: () => {
            // Add to actual cart
            addToCart({
              id,
              name,
              cookName,
              price,
              imageUrl,
              availableOptions: availableOptions,
              deliveryOption: selectedDeliveryType!, // selectedDeliveryType artık null olamaz bu noktada
            }, localQuantity);
            
            // Call parent callback
            onAddToCart?.(id, localQuantity, selectedDeliveryType!);
            
            // Reset local quantity
            setLocalQuantity(0);
            
            // No success dialog - just add to cart silently
          },
        },
      ]
    );
  };

  const handleAllergenConfirm = () => {
    setShowAllergenModal(false);
    proceedWithAddToCart();
  };

  const handleAllergenCancel = () => {
    setShowAllergenModal(false);
  };

  return (
    <>
    <Card variant="default" padding="none" style={[styles.card, isGridMode && styles.gridCard]}>
      <View style={[styles.content, isGridMode && styles.gridContent]}>
          {/* Clickable Food Image ONLY */}
          <View style={[styles.imageContainer, isGridMode && styles.gridImageContainer]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.imageClickable}>
              <Image 
                source={(() => {
                  // Önizleme modunda veya local file varsa kullan
                  if (imageUrl && (isPreview || imageUrl.startsWith('file://') || imageUrl.startsWith('http'))) {
                    return { uri: imageUrl };
                  }
                  
                  // Kategori tabanlı resim kullan
                  if (category) {
                    return getCategoryImage(category);
                  }
                  
                  // Fallback: yemek ismine göre resim kullan
                  return getDefaultImage(name);
                })()} 
                style={[styles.image, isGridMode && styles.gridImage]}
                resizeMode="cover"
                defaultSource={{ uri: 'https://via.placeholder.com/160x140/f5f5f5/cccccc?text=📸' }}
              />
            </TouchableOpacity>
          </View>


          {/* Food details column */}
          <View style={styles.detailsColumn}>
            <View style={styles.detailsTopRow}>
          {/* Food info - NOT clickable */}
          <View style={[styles.info, isGridMode && styles.gridInfo]}>
            <View style={styles.headerRow}>
              <Text variant="subheading" weight="semibold" numberOfLines={1} style={styles.foodName}>
                {name}
              </Text>
            </View>
            
                   <View style={styles.cookInfo}>
                     <TouchableOpacity 
                       onPress={() => {
                         console.log('Cook name pressed:', cookName);
                         router.push(`/seller-profile?cookName=${encodeURIComponent(cookName)}`);
                       }}
                       activeOpacity={0.7}
                     >
                       <Text variant="body" color="primary" style={[styles.cookName, { textDecorationLine: 'underline' }]}>
                         {cookName} →
                       </Text>
                     </TouchableOpacity>
                   </View>

      <View style={styles.ratingDistance}>
        <View style={styles.ratingsRow}>
          <StarRating rating={rating} size="small" showNumber maxRating={1} />
          <View style={styles.hygieneRatingInline}>
            <StarRating 
              rating={5} 
              size="small" 
              showNumber 
              maxRating={1}
              color="#2D5A4A"
            />
          </View>
        </View>
      </View>

          </View>

          {/* Right side controls - NOT clickable for navigation */}
          <View style={[styles.rightControls, isGridMode && styles.gridRightControls]}>
            {/* Price - aligned with quantity controls */}
            <Text variant="subheading" weight="bold" color="primary" style={styles.priceAligned}>
              {formatCurrency(price)}
            </Text>
            
            {/* Quantity controls */}
            <View style={[styles.quantityControls, isGridMode && styles.gridQuantityControls]}>
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
            </View>

          {/* Bottom meta info (near buttons) */}
          <View style={styles.bottomMetaRow}>
            <Text variant="caption" color="textSecondary" style={[styles.compactDateText, styles.bottomMetaText, styles.bottomMetaDate]}>
              • {showAvailableDates
                ? (availableDates || t('foodCard.unknownDate'))
                : (maxDeliveryDistance ? t('foodCard.deliveryDistance', { distance: maxDeliveryDistance }) : distance)}
            </Text>
            <Text variant="caption" color="textSecondary" style={[styles.compactDateText, styles.bottomMetaText]}>
              {t('foodCard.countryMeal', { country: resolvedCountry, count: currentStock || 0 })}
            </Text>
          </View>

          {/* Bottom actions row */}
          <View style={styles.bottomActionsRow}>
            <View style={styles.deliveryButtonsRow}>
              {availableOptions.length > 1 ? (
                availableOptions.map((option) => {
                  const isSelected = selectedDeliveryType === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => setSelectedDeliveryType(option)}
                      style={[
                        styles.deliveryButton,
                        {
                          backgroundColor: isSelected ? colors.primary : '#F5F5F5',
                          borderWidth: 1,
                          borderColor: isSelected ? colors.primary : '#E0E0E0',
                        },
                      ]}
                    >
                      <Text
                        variant="body"
                        weight="medium"
                        style={{ color: isSelected ? 'white' : '#888888', fontSize: 11 }}
                      >
                        {option === 'pickup' ? t('foodDetailScreen.pickup') : t('foodDetailScreen.delivery')}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                availableOptions.length === 1 && (
                  <View
                    style={[
                      styles.deliveryButton,
                      {
                        backgroundColor: colors.primary,
                        borderWidth: 0,
                      },
                    ]}
                  >
                    <Text variant="body" weight="medium" style={{ color: 'white', fontSize: 11 }}>
                      {availableOptions[0] === 'pickup'
                        ? t('foodDetailScreen.pickup')
                        : t('foodDetailScreen.delivery')}
                    </Text>
                  </View>
                )
              )}
            </View>

            <TouchableOpacity
              onPress={handleAddToCart}
              style={[styles.addToCartButtonBottomRight, { backgroundColor: colors.primary }]}
            >
              <Text variant="body" weight="medium" style={{ color: 'white', fontSize: 11 }}>
                {t('foodCard.addToCart')}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>

      </Card>
      
      {/* Alerjen Uyarı Modalı */}
      <AllergenWarningModal
        visible={showAllergenModal}
        onClose={handleAllergenCancel}
        onConfirm={handleAllergenConfirm}
        allergens={allergens || []}
        foodName={name}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8, // Back to previous spacing
    borderRadius: 16, // Back to original radius
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
    minHeight: 160, // Back to original height
  },
  detailsColumn: {
    flex: 1,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  detailsTopRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 180, // Back to original size
    height: 160, // Back to original size
    borderRadius: 16, // Back to original radius
    overflow: 'hidden', // Back to hidden
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
    borderRadius: 16, // Back to original radius
  },
  info: {
    flex: 1,
    paddingLeft: 10, // Back to original
    paddingRight: 4, // Back to original
    paddingVertical: 3, // Slightly lower to sit closer to buttons
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Normal hizalama
    alignItems: 'flex-start',
    marginBottom: 1, // Minimal margin
  },
  foodName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cookInfo: {
    marginTop: 4,
    marginBottom: 1, // Minimal margin
  },
  cookName: {
    fontSize: 13, // Slightly larger
  },
  ratingDistance: {
    marginTop: 4,
    marginBottom: 0,
  },
  availabilityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -6,
    marginTop: 2,
  },
  bottomMetaRow: {
    marginTop: 0,
    marginBottom: 0,
    transform: [{ translateY: -12 }],
  },
  bottomMetaText: {
    fontSize: 13,
  },
  bottomMetaDate: {
    transform: [{ translateY: -4 }],
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingBottom: 2,
    paddingTop: 0,
    marginTop: -6,
  },
  deliveryButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  deliveryButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 5,
    minWidth: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    paddingHorizontal: 4, // Reduced padding for smaller size
    paddingVertical: 2, // Reduced padding for smaller size
    marginTop: 38, // Increased margin to push down even closer to sepete ekle
    marginBottom: 2, // Keep minimal bottom margin
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
    width: 16, // Smaller for compact design
    height: 16, // Smaller for compact design
    borderRadius: 8, // Circular buttons
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quantityButtonText: {
    fontSize: 13, // Slightly larger
    fontWeight: 'bold',
    color: '#333333', // Dark color for contrast
    lineHeight: 13, // Better alignment
  },
  quantityText: {
    minWidth: 12, // Smaller for compact design
    textAlign: 'center',
    fontSize: 12, // Slightly larger
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
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 56,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  compactDateText: {
    fontSize: 12, // Slightly larger
    paddingHorizontal: 4, // Narrower from sides
  },
  // Grid Mode Styles
  gridCard: {
    marginBottom: 4, // Reduced spacing for grid
  },
  gridContent: {
    flexDirection: 'column', // Stack vertically for grid
    minHeight: 200, // Compact height for grid
  },
  gridImageContainer: {
    width: '100%', // Full width in grid
    height: 100, // Compact height for grid
    borderRadius: 12,
  },
  gridImage: {
    borderRadius: 12,
  },
  gridInfo: {
    paddingLeft: 8, // Reduced padding for grid
    paddingRight: 8,
    paddingVertical: 6,
    flex: 0, // Don't flex in grid mode
  },
  gridRightControls: {
    flexDirection: 'row', // Horizontal layout for grid
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 'auto',
  },
  gridPrice: {
    fontSize: 12, // Smaller price for grid
    marginBottom: 0,
  },
  gridQuantityControls: {
    gap: 2, // Tighter spacing for grid
  },
  imageClickable: {
    width: '100%',
    height: '100%',
  },
  priceAligned: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8, // Sayaç ile arasında boşluk
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hygieneRatingInline: {
    marginLeft: 4, // Daha yakın
  },
  hygienePending: {
    fontSize: 10,
    color: '#FF9500',
    fontWeight: '600',
    marginLeft: 4, // Daha yakın
  },
});
