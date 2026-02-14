import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions, Modal, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Button, Card, StarRating } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';
import { useCart } from '../../../context/CartContext';
import { mockFoodService } from '../../../services/mockFoodService';
import { mockUserService } from '../../../services/mockUserService';
import { useAuth } from '../../../context/AuthContext';
import { getFavoriteMeta, toggleFavorite } from '../../../services/favoriteService';

export default function FoodDetailSimple() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const { addToCart } = useCart();
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const showIngredients = width >= 768;
  const showSideBySideCards = width >= 768;

  const foodName = params.name as string || t('foodDetailSimpleScreen.defaults.foodName');
  const cookName = params.cookName as string || t('foodDetailSimpleScreen.defaults.cookName');
  const foodImageUrl = params.imageUrl as string || 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop';
  const rawImagesParam = params.images as string | undefined;

  const fallbackImages = [
    foodImageUrl,
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
  ];

  const parseImageParam = (value?: string) => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(item => typeof item === 'string');
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    return [];
  };

  const extraImages = parseImageParam(rawImagesParam);
  const foodImages = Array.from(new Set([...extraImages, ...fallbackImages])).slice(0, 5);
  const foodId = params.id as string | undefined;
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const basePrice = Number(params.price) || 25;
  const totalPrice = formatCurrency(basePrice * quantity);
  const [ingredients, setIngredients] = useState<string[] | null>(null);
  const [allergens, setAllergens] = useState<string[] | null>(null);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [allergenModalVisible, setAllergenModalVisible] = useState(false);
  const [allergenModalMatches, setAllergenModalMatches] = useState<string[]>([]);
  const [allergenConfirmChecked, setAllergenConfirmChecked] = useState(false);
  const [pendingFood, setPendingFood] = useState<any | null>(null);
  const [foodMeta, setFoodMeta] = useState({
    rating: 4.8,
    reviewCount: 24,
    distance: '1.2 km',
    prepTime: '30 dk',
    cookDescription: 'Ev yapımı yemeklerde özenli ve hijyenik hazırlık sunar.',
    availableDates: '15-20 Ocak',
    currentStock: 8,
    dailyStock: 10,
    deliveryType: 'pickup' as 'pickup' | 'delivery',
  });
  const endDate = foodMeta.availableDates.includes('-')
    ? foodMeta.availableDates.split('-').pop()?.trim() || foodMeta.availableDates
    : foodMeta.availableDates;
  const deliveryTimeLabel = currentLanguage === 'en' ? 'Delivery Time' : 'Teslimat Süresi';
  const deliveryTypeDescription =
    foodMeta.deliveryType === 'delivery'
      ? (currentLanguage === 'en' ? 'This product is delivered' : 'Bu urun teslim edilir')
      : (currentLanguage === 'en' ? 'This product must be picked up' : 'Bu urunu gelip almaniz gerekir');
  const [sellerAvatar, setSellerAvatar] = useState(
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face'
  );
  const [sellerAvatarError, setSellerAvatarError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const swipeToHomeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dy) < 20,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 22 && Math.abs(gestureState.dy) < 22,
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, gestureState) => {
          const isHorizontalSwipe =
            Math.abs(gestureState.dx) > 70 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.25;

          if (isHorizontalSwipe) {
            router.replace('/(buyer)');
          }
        },
      }),
    []
  );

  useEffect(() => {
    const loadSellerProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('sellerProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          if (profile.avatarUri) {
            setSellerAvatar(profile.avatarUri);
          }
        }
      } catch (error) {
        console.error('Error loading seller profile:', error);
      }
    };

    loadSellerProfile();
  }, []);
  
  const handleBackPress = () => {
    router.back();
  };

  const resolveFoodId = (id?: string) => (id ? id.replace(/^(firebase_|mock_|published_)/, '') : undefined);

  useEffect(() => {
    const loadDetails = async () => {
      const resolvedId = resolveFoodId(foodId);
      if (!resolvedId) return;
      const foods = await mockFoodService.getFoods(0);
      const food = foods.find(item => item.id === resolvedId);
      setIngredients(food?.ingredients ?? null);
      setAllergens(food?.allergens ?? null);
      if (food) {
        setFoodMeta({
          rating: typeof food.rating === 'number' ? food.rating : 4.8,
          reviewCount: typeof food.reviewCount === 'number' ? food.reviewCount : 24,
          distance: food.distance || '1.2 km',
          prepTime: food.prepTime || '30 dk',
          cookDescription: food.cookDescription || 'Ev yapımı yemeklerde özenli ve hijyenik hazırlık sunar.',
          availableDates: food.availableDates || '15-20 Ocak',
          currentStock: typeof food.currentStock === 'number' ? food.currentStock : 8,
          dailyStock: typeof food.dailyStock === 'number' ? food.dailyStock : 10,
          deliveryType: food.hasDelivery && !food.hasPickup ? 'delivery' : 'pickup',
        });
      }
    };

    loadDetails();
  }, [foodId]);

  useEffect(() => {
    const loadFavoriteState = async () => {
      try {
        const resolvedId = resolveFoodId(foodId);
        if (!resolvedId) return;
        const meta = await getFavoriteMeta();
        setIsFavorite(meta.favoriteIds.has(String(resolvedId)));
        setFavoriteCount(Number(meta.favoriteCounts[String(resolvedId)] ?? 0));
      } catch (error) {
        console.error('Error loading detail favorite state:', error);
      }
    };

    loadFavoriteState();
  }, [foodId]);

  useEffect(() => {
    const loadUserAllergies = async () => {
      const userRecord =
        (await mockUserService.getUserByUid(user?.uid || userData?.uid)) ||
        (await mockUserService.getUserByEmail(userData?.email || user?.email));
      const allergies = Array.isArray(userRecord?.allergicTo) ? userRecord.allergicTo : [];
      setUserAllergies(allergies.map((item: string) => item.toLowerCase()));
    };

    loadUserAllergies();
  }, [user?.uid, user?.email, userData?.uid, userData?.email]);

  const performAddToCart = (food: any) => {
    const availableOptions =
      Array.isArray(food.availableDeliveryOptions) && food.availableDeliveryOptions.length > 0
        ? food.availableDeliveryOptions
        : [];
    if (availableOptions.length === 0) {
      if (food.hasPickup) availableOptions.push('pickup');
      if (food.hasDelivery) availableOptions.push('delivery');
    }

    const deliveryOption = availableOptions.length === 1 ? availableOptions[0] : undefined;
    const deliveryFee =
      food.hasDelivery && typeof food.deliveryFee === 'number' ? food.deliveryFee : 0;

    addToCart(
      {
        id: food.id,
        name: food.name,
        cookName: food.cookName,
        price: food.price,
        imageUrl: food.imageUrl,
        currentStock: food.currentStock,
        dailyStock: food.dailyStock,
        deliveryOption,
        availableOptions,
        deliveryFee,
        allergens: food.allergens || [],
      },
      quantity
    );

    router.back();
  };

  const handleAddToCart = async () => {
    const resolvedId = resolveFoodId(foodId);
    if (!resolvedId) return;

    const foods = await mockFoodService.getFoods(0);
    const food = foods.find(item => item.id === resolvedId);
    if (!food) return;

    const userRecord =
      (await mockUserService.getUserByUid(user?.uid || userData?.uid)) ||
      (await mockUserService.getUserByEmail(userData?.email || user?.email));
    const userAllergies = (userRecord?.allergicTo || []).map(item => item.toLowerCase());
    const foodAllergens = (food.allergens || []).map((item: string) => item.toLowerCase());
    const matches = foodAllergens.filter(allergen => userAllergies.includes(allergen));
    if (matches.length > 0) {
      setAllergenModalMatches(matches);
      setAllergenConfirmChecked(false);
      setPendingFood(food);
      setAllergenModalVisible(true);
      return;
    }
    performAddToCart(food);
  };

  const handleFavoritePress = async () => {
    try {
      const resolvedId = resolveFoodId(foodId);
      if (!resolvedId) return;

      const result = await toggleFavorite({
        id: String(resolvedId),
        name: foodName,
        cookName,
        price: basePrice,
        rating: foodMeta.rating,
        imageUrl: foodImageUrl,
        category: (params.category as string) || (currentLanguage === 'en' ? 'Main Dish' : 'Ana Yemek'),
      });
      setIsFavorite(result.isFavorite);
      setFavoriteCount(result.favoriteCount);
    } catch (error) {
      console.error('Error toggling detail favorite:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal
        visible={allergenModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Text variant="caption" weight="bold" style={styles.modalIconText}>!</Text>
              </View>
              <Text variant="subheading" weight="bold" style={styles.modalTitle}>
                {t('allergenWarning.title')}
              </Text>
            </View>
            <View style={styles.modalWarningBox}>
              <Text variant="body" style={styles.modalText}>
                {t('allergenWarning.warningMessage', { allergen: allergenModalMatches.join(', ') })}
              </Text>
              <Text variant="body" weight="bold" style={styles.modalEmphasis}>
                {t('allergenWarning.question')}
              </Text>
              <Text variant="caption" style={styles.modalSecondary}>
                {t('allergenWarning.unsure')}
              </Text>
            </View>
            <View style={styles.modalChip}>
              <Text variant="caption" weight="bold" style={styles.modalChipText}>
                {t('allergenWarning.chipLabel', { allergen: allergenModalMatches.join(', ') })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCheckboxRow}
              onPress={() => setAllergenConfirmChecked(prev => !prev)}
              activeOpacity={0.8}
            >
              <View style={[styles.modalCheckbox, allergenConfirmChecked && styles.modalCheckboxChecked]}>
                {allergenConfirmChecked && <Text style={styles.modalCheckboxCheck}>✓</Text>}
              </View>
              <Text variant="caption" style={styles.modalSecondary}>
                {t('allergenWarning.acknowledge')}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={() => {
                  setAllergenModalVisible(false);
                  setPendingFood(null);
                  setAllergenModalMatches([]);
                  setAllergenConfirmChecked(false);
                }}
              >
                <Text variant="body" weight="bold" style={styles.modalPrimaryButtonText}>
                  {t('allergenWarning.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSecondaryButton,
                  !allergenConfirmChecked && styles.modalSecondaryButtonDisabled,
                ]}
                onPress={() => {
                  if (!allergenConfirmChecked) return;
                  const next = pendingFood;
                  setAllergenModalVisible(false);
                  setPendingFood(null);
                  setAllergenModalMatches([]);
                  setAllergenConfirmChecked(false);
                  if (next) {
                    performAddToCart(next);
                  }
                }}
                activeOpacity={allergenConfirmChecked ? 0.8 : 1}
              >
                <Text
                  variant="body"
                  weight="bold"
                  style={[
                    styles.modalSecondaryButtonText,
                    !allergenConfirmChecked && styles.modalSecondaryButtonTextDisabled,
                  ]}
                >
                  {t('allergenWarning.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top - Spacing.sm, 0),
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.closeButton}
            accessibilityLabel="close"
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text variant="heading" weight="bold" style={styles.headerTitle}>
              {t('foodDetailSimpleScreen.title')}
            </Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Food Images Slider */}
        <View style={styles.imageSliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            style={styles.imageSlider}
          >
            {foodImages.map((imageUrl, index) => (
              <View key={index} style={[styles.imageContainer, { width }]}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.imageIndicators}>
            {foodImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { opacity: currentImageIndex === index ? 1 : 0.35 }
                ]}
              />
            ))}
          </View>

          <View style={styles.imageCounter}>
            <Text variant="caption" style={styles.imageCounterText}>
              {currentImageIndex + 1}/{foodImages.length}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.imageFavorite}
            onPress={() => void handleFavoritePress()}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? '#E53935' : colors.text}
            />
            {favoriteCount > 0 ? <Text style={styles.imageFavoriteCount}>{favoriteCount}</Text> : null}
          </TouchableOpacity>
        </View>

        <View style={styles.swipeExitZone} {...swipeToHomeResponder.panHandlers}>
          <View style={styles.titleRowOutside}>
            <Text variant="heading" weight="semibold" style={styles.foodNameOutside} numberOfLines={2}>
              {foodName}
            </Text>
            <Text variant="heading" weight="semibold" color="primary" style={styles.priceTextOutside}>
              {formatCurrency(basePrice)}
            </Text>
          </View>

          <View style={[styles.cardsRow, showSideBySideCards ? styles.cardsRowSide : styles.cardsRowStack]}>
            <Card variant="default" padding="md" style={styles.cookInfoCard}>
            <View style={styles.cookInfo}>
              <View style={styles.cookProfile}>
                {sellerAvatar && !sellerAvatarError ? (
                  <Image
                    source={{ uri: sellerAvatar }}
                    style={styles.cookAvatar}
                    onError={() => setSellerAvatarError(true)}
                  />
                ) : (
                  <View style={styles.cookAvatarFallback}>
                    <Text variant="body" weight="bold" style={styles.cookAvatarFallbackText}>
                      {cookName?.trim()?.charAt(0) || 'C'}
                    </Text>
                  </View>
                )}
                  <View style={styles.cookDetails}>
                  <View style={styles.cookNameRow}>
                    <Text variant="body" color="textSecondary" style={styles.cookName} numberOfLines={1}>
                      {cookName}
                    </Text>
                  </View>
                  <View style={styles.rating}>
                    <StarRating rating={foodMeta.rating} size="small" showNumber />
                    <Text variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                      {t('foodDetailScreen.reviewCount', { count: foodMeta.reviewCount })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.cookDescriptionRow}>
              <Text variant="caption" color="textSecondary" style={styles.cookDescriptionText}>
                {foodMeta.cookDescription}
              </Text>
            </View>
            </Card>

            <Card variant="default" padding="md" style={styles.metaInfoCard}>
              <View style={styles.deliveryDetailsSection}>
                <Text variant="body" weight="medium" style={styles.deliveryDetailText}>
                  {deliveryTimeLabel}: {foodMeta.prepTime}
                </Text>
                <Text variant="body" weight="medium" style={styles.deliveryDetailText}>
                  {t('foodDetailScreen.distance')}: {foodMeta.distance}
                </Text>
              </View>

              <View style={styles.deliveryTypeRow}>
                <Text variant="body" weight="medium" color="primary" style={styles.deliveryTypeText}>
                  {deliveryTypeDescription}
                </Text>
              </View>

              <View style={styles.availabilitySection}>
                <View style={styles.availabilityItem}>
                  <Text variant="body" weight="medium" color="primary" style={styles.leftAlignedText}>
                    {t('foodDetailSimpleScreen.endDateLabel')}: {endDate}
                  </Text>
                </View>
                <View style={styles.availabilityItem}>
                  <Text
                    variant="body"
                    weight="medium"
                    color={foodMeta.currentStock > 0 ? 'primary' : 'error'}
                    style={styles.leftAlignedText}
                  >
                    {t('foodDetailSimpleScreen.remainingLabel')}: {foodMeta.currentStock} {t('foodDetailSimpleScreen.remainingValue')}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
            {/* İçindekiler */}
            <View style={styles.ingredientsSection}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                {t('foodDetailSimpleScreen.ingredientsTitle')}
              </Text>
              <Text variant="body" style={styles.ingredientsText}>
                {ingredients && ingredients.length > 0
                  ? ingredients.join(', ')
                  : t('foodDetailSimpleScreen.ingredients')}
              </Text>
            </View>

            <View style={styles.allergensSection}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                {t('foodDetailSimpleScreen.allergensTitle')}
              </Text>
              {allergens && allergens.length > 0 ? (
                <View style={styles.allergenPillsContainer}>
                  {allergens.map((allergen, index) => {
                    const isMatched = userAllergies.includes(allergen.toLowerCase());

                    return (
                      <View
                        key={`${allergen}-${index}`}
                        style={[
                          styles.allergenPill,
                          isMatched && styles.allergenPillDanger,
                        ]}
                      >
                        <Text
                          variant="caption"
                          weight="medium"
                          style={[
                            styles.allergenPillText,
                            isMatched && styles.allergenPillTextDanger,
                          ]}
                        >
                          {allergen}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text variant="body" style={styles.ingredientsText}>
                  {t('foodDetailSimpleScreen.allergensEmpty')}
                </Text>
              )}
            </View>

            {/* Tarif */}
            <View style={styles.aboutSection}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                {t('foodDetailSimpleScreen.recipeTitle')}
              </Text>
              <Text variant="body" style={styles.description}>
                {t('foodDetailSimpleScreen.recipe', { food: foodName })}
              </Text>
            </View>

            {/* Reviews Section */}
            <View style={styles.reviewsSection}>
              <Text variant="subheading" weight="semibold" style={styles.reviewsTitle}>
                {t('foodDetailSimpleScreen.reviewsTitle')}
              </Text>
              <View style={styles.reviewItem}>
                <Text variant="body" weight="medium">{t('foodDetailSimpleScreen.review1Name')}</Text>
                <Text variant="caption" color="textSecondary">
                  {t('foodDetailSimpleScreen.review1Text')}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text variant="body" weight="medium">{t('foodDetailSimpleScreen.review2Name')}</Text>
                <Text variant="caption" color="textSecondary">
                  {t('foodDetailSimpleScreen.review2Text')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.fixedBottomBar, { backgroundColor: colors.card }]}>
        <View style={[styles.counterGroup, { borderColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              if (quantity === 1) {
                router.back();
                return;
              }
              setQuantity(quantity - 1);
            }}
            style={styles.counterButton}
            accessibilityLabel="decrease-quantity"
          >
            <MaterialIcons
              name={quantity === 1 ? 'delete' : 'remove'}
              size={18}
              color={quantity === 1 ? '#E53935' : colors.text}
            />
          </TouchableOpacity>
          <View style={styles.counterDivider} />
          <Text variant="subheading" weight="bold" style={styles.counterText}>
            {quantity}
          </Text>
          <View style={styles.counterDivider} />
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={styles.counterButton}
            accessibilityLabel="increase-quantity"
          >
            <MaterialIcons name="add" size={18} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          accessibilityLabel="add-to-cart"
          onPress={handleAddToCart}
        >
          <Text variant="body" weight="bold" style={styles.addButtonText}>
            {t('foodDetailSimpleScreen.addButtonLabel', { price: totalPrice })}
          </Text>
        </TouchableOpacity>
      </View>
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
  contentContainer: {
    paddingBottom: 96,
  },
  swipeExitZone: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  headerRightSpacer: {
    width: 36,
  },
  imageSliderContainer: {
    position: 'relative',
  },
  imageSlider: {
    width: '100%',
  },
  imageContainer: {
    height: 250,
  },
  image: {
    width: '100%',
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  imageFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageFavoriteCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  imageCounterText: {
    color: '#FFFFFF',
  },
  titleRowOutside: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  foodNameOutside: {
    flex: 1,
    color: '#2E2E2E',
  },
  priceTextOutside: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 12,
  },
  cookInfoCard: {
    marginBottom: Spacing.md,
    flex: 1,
  },
  metaInfoCard: {
    marginBottom: Spacing.md,
    flex: 1,
  },
  cardsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  cardsRowSide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardsRowStack: {
    flexDirection: 'column',
  },
  foodNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  foodName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cookInfo: {
    marginBottom: Spacing.md,
  },
  cookProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  cookAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
    backgroundColor: '#E8E6E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cookAvatarFallbackText: {
    color: '#8B9D8A',
  },
  cookDetails: {
    flex: 1,
  },
  cookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    justifyContent: 'space-between',
  },
  cookName: {
    flexShrink: 1,
    marginRight: Spacing.sm,
  },
  rating: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookDescriptionRow: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: Spacing.sm,
  },
  cookDescriptionText: {
    lineHeight: 18,
  },
  deliveryTypeRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  deliveryTypeText: {
    textAlign: 'center',
  },
  deliveryDetailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  deliveryDetailText: {
    flex: 1,
  },
  availabilityItem: {
    alignItems: 'flex-start',
    flex: 1,
  },
  leftAlignedText: {
    textAlign: 'left',
  },
  availabilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  metaItem: {
    alignItems: 'center',
  },
  description: {
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  reviewsSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: Spacing.sm,
  },
  reviewsTitle: {
    marginBottom: Spacing.md,
  },
  reviewItem: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  ingredientsSection: {
    marginBottom: Spacing.lg,
  },
  allergensSection: {
    marginBottom: Spacing.lg,
  },
  allergenPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  allergenPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#F2F4F7',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  allergenPillDanger: {
    borderColor: '#FECACA',
    backgroundColor: '#FEE2E2',
  },
  allergenPillText: {
    color: '#344054',
  },
  allergenPillTextDanger: {
    color: '#B42318',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: 22,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EAECF0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconText: {
    color: '#FFFFFF',
  },
  modalTitle: {
    marginBottom: Spacing.sm,
    color: '#101828',
    fontSize: 18,
  },
  modalWarningBox: {
    backgroundColor: '#FEF3F2',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: Spacing.md,
  },
  modalText: {
    marginBottom: Spacing.sm,
    color: '#101828',
  },
  modalEmphasis: {
    color: '#101828',
    marginBottom: Spacing.xs,
  },
  modalSecondary: {
    color: '#475467',
  },
  modalChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3F2',
    borderColor: '#FEE4E2',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  modalChipText: {
    color: '#B42318',
  },
  modalCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCheckboxChecked: {
    backgroundColor: '#B42318',
  },
  modalCheckboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalPrimaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryButtonText: {
    color: '#FFFFFF',
  },
  modalSecondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalSecondaryButtonDisabled: {
    borderColor: '#D0D5DD',
    backgroundColor: '#F9FAFB',
  },
  modalSecondaryButtonText: {
    color: '#B42318',
  },
  modalSecondaryButtonTextDisabled: {
    color: '#98A2B3',
  },
  aboutSection: {
    marginBottom: Spacing.md,
  },
  aboutSellerSection: {
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  ingredientsText: {
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  fixedBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
  counterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '60%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 14,
  },
  counterButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 20,
  },
  counterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
  },
  addButton: {
    marginTop: Spacing.sm,
    width: '60%',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
  },
  closeButton: {
    width: 36,
    padding: Spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
