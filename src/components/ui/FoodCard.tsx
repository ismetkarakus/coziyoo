import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Text } from './Text';
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
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const resolvedCountry = country || (currentLanguage === 'en' ? 'Turkish' : 'Türk');
  const { width: windowWidth } = useWindowDimensions();
  const imageWidth = windowWidth < 768 ? '40%' : '30%';
  
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

  useEffect(() => {
    setLocalQuantity(cartQuantity);
  }, [cartQuantity]);

  const handlePress = () => {
    console.log('FoodCard pressed:', name, id, 'by', cookName);
    const foodImageUrl = imageUrl || getDefaultImage(name).uri;
    const route = `/food-detail-simple?id=${id}&name=${encodeURIComponent(name)}&cookName=${encodeURIComponent(cookName)}&imageUrl=${encodeURIComponent(foodImageUrl)}`;
    console.log('Navigating to SIMPLE FOOD DETAIL (no getTime errors):', route);
    router.push(route);
  };

  const ensureDeliverySelection = () => {
    if (availableOptions.length > 1 && selectedDeliveryType === null) {
      Alert.alert(
        t('foodCard.alerts.deliveryRequiredTitle'),
        t('foodCard.alerts.deliveryRequiredMessage'),
        [{ text: t('foodCard.alerts.ok') }]
      );
      return false;
    }
    return true;
  };

  const incrementQuantity = () => {
    if (!ensureDeliverySelection()) return;

    if (currentStock !== undefined && localQuantity >= currentStock) {
      Alert.alert(
        t('foodCard.alerts.stockInsufficientTitle'),
        t('foodCard.alerts.stockInsufficientMessage', { count: currentStock, name })
      );
      return;
    }

    const nextQuantity = localQuantity + 1;
    setLocalQuantity(nextQuantity);

    if (localQuantity === 0) {
      setShowAllergenModal(true);
      return;
    }

    updateQuantity(id, nextQuantity);
  };

  const removeItem = () => {
    if (localQuantity > 0) {
      removeFromCart(id);
      setLocalQuantity(0);
    }
  };

  const proceedWithAddToCart = () => {
    if (!ensureDeliverySelection()) return;
    
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
    setLocalQuantity(cartQuantity);
  };

  return (
    <>
    <Card
      variant="default"
      padding="none"
      style={[styles.card, isGridMode && styles.gridCard, { backgroundColor: colors.card }]}
    >
      <View style={styles.headerFullWidth}>
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={styles.headerNameTouchable}>
          <Text variant="subheading" weight="semibold" numberOfLines={1} style={styles.headerFoodName}>
            {name}
          </Text>
        </TouchableOpacity>
        <Text variant="subheading" weight="bold" color="primary" style={styles.headerPrice}>
          {formatCurrency(price)}
        </Text>
      </View>

      <View style={[styles.content, isGridMode && styles.gridContent]}>
          {/* Clickable Food Image ONLY */}
          <View
            style={[
              styles.imageContainer,
              isGridMode && styles.gridImageContainer,
              { backgroundColor: colors.card, width: imageWidth },
            ]}
          >
            <View style={[styles.imageWrapper, { backgroundColor: colors.card }]}>
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

            <TouchableOpacity
              onPress={incrementQuantity}
              activeOpacity={0.85}
              style={[styles.floatingAddButton, { backgroundColor: '#FFFFFF' }]}
            >
              <FontAwesome name="plus" size={26} color={colors.primary} />
            </TouchableOpacity>

            {localQuantity > 0 && (
              <View style={styles.floatingQuantityBadge}>
                <TouchableOpacity onPress={removeItem} style={styles.badgeIconButton}>
                  <FontAwesome name="trash" size={12} color="#333333" />
                </TouchableOpacity>
                <Text variant="body" weight="bold" style={styles.badgeQuantityText}>
                  {localQuantity}
                </Text>
              </View>
            )}
          </View>


          {/* Food details column */}
          <View style={styles.detailsColumn}>

          {/* Bottom meta info (near buttons) */}
          <View style={styles.bottomMetaRow}>
            <Text variant="caption" color="textSecondary" style={[styles.metaText, styles.bottomMetaDate]}>
              <Text weight="bold">{t('foodCard.dateLabel')}:</Text>{' '}
              {showAvailableDates
                ? (availableDates || t('foodCard.unknownDate'))
                : (maxDeliveryDistance ? t('foodCard.deliveryDistance', { distance: maxDeliveryDistance }) : distance)}
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.metaText}>
              <Text weight="bold">{t('foodCard.countryLabel')}:</Text> {resolvedCountry}
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.metaText}>
              <Text weight="bold">{t('foodCard.quantityLabel')}:</Text>{' '}
              {dailyStock !== undefined && currentStock !== undefined
                ? `${Math.max(dailyStock - currentStock, 0)}/${dailyStock}`
                : `${currentStock || 0}`}
            </Text>
          </View>

          {/* Delivery options row */}
          <View style={styles.deliveryRow}>
            <Text variant="caption" color="textSecondary" style={styles.metaText}>
              <Text weight="bold">{t('foodCard.deliveryOptionsLabel')}</Text>
            </Text>
            <View style={styles.deliveryButtonsRow}>
              {(['pickup', 'delivery'] as const).map((option) => {
                const isAvailable = availableOptions.includes(option);
                return (
                  <View
                    key={option}
                    style={[
                      styles.infoPill,
                      {
                        backgroundColor: 'transparent',
                        borderColor: isAvailable ? '#00C853' : '#8E8E93',
                      },
                    ]}
                  >
                    <View style={styles.infoPillContent}>
                      <FontAwesome
                        name={isAvailable ? 'check' : 'times'}
                        size={12}
                        color={isAvailable ? '#00C853' : '#8E8E93'}
                      />
                      <Text
                        variant="body"
                        weight="medium"
                        style={{ color: isAvailable ? '#00C853' : '#8E8E93', fontSize: 13 }}
                      >
                        {option === 'pickup' ? t('foodDetailScreen.pickup') : t('foodDetailScreen.delivery')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          </View>
        </View>

        {/* Cook row at bottom */}
        <View style={styles.cookRow}>
          <TouchableOpacity
            onPress={() => {
              console.log('Cook pill pressed:', cookName);
              router.push(`/seller-profile?cookName=${encodeURIComponent(cookName)}`);
            }}
            activeOpacity={0.85}
            style={[styles.cookPill, { borderColor: colors.textSecondary, backgroundColor: colors.card }]}
          >
            <Text variant="body" color="primary" weight="bold" style={styles.cookName}>
              {cookName} →
            </Text>
            <StarRating rating={rating} size="large" showNumber maxRating={1} />
          </TouchableOpacity>
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
    marginBottom: 16,
    borderRadius: 16, // Back to original radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'visible',
  },
  headerFullWidth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 6,
  },
  headerNameTouchable: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  headerFoodName: {
    fontSize: 20,
  },
  headerPrice: {
    fontSize: 18,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Back to flex-start
    position: 'relative', // Allow absolute positioning for button
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    zIndex: 1,
  },
  detailsColumn: {
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    borderRadius: 16, // Back to original radius
    overflow: 'visible',
    position: 'relative', // Enable absolute positioning for child image
    zIndex: 2,
    margin: 0,
    padding: 0,
    justifyContent: 'center', // Center the image
    alignItems: 'center', // Center the image
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  image: {
    width: '100%', // Full width like detail page
    height: '100%', // Full height like detail page
    margin: 0,
    padding: 0,
    borderRadius: 12,
  },
  cookName: {
    fontSize: 15,
  },
  cookPill: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 0,
    borderRadius: 999,
    borderWidth: 1,
  },
  bottomMetaRow: {
    marginTop: 0,
    marginBottom: 0,
    alignItems: 'flex-start',
  },
  metaText: {
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 4,
    textAlign: 'left',
  },
  bottomMetaDate: {
    transform: [{ translateY: -4 }],
  },
  deliveryRow: {
    marginTop: 'auto',
    marginBottom: 4,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  cookRow: {
    marginTop: 4,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  deliveryButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  infoPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  imageClickable: {
    width: '100%',
    height: '100%',
  },
  floatingAddButton: {
    position: 'absolute',
    right: -22,
    bottom: -12,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 20,
    zIndex: 999,
  },
  floatingQuantityBadge: {
    position: 'absolute',
    right: 8,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeIconButton: {
    marginRight: 6,
  },
  badgeQuantityText: {
    fontSize: 13,
    color: '#333333',
  },
});
