import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';
import { useCart } from '../../../context/CartContext';
import { mockFoodService } from '../../../services/mockFoodService';
import { mockUserService } from '../../../services/mockUserService';
import { useAuth } from '../../../context/AuthContext';

export default function FoodDetailSimple() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formatCurrency } = useCountry();
  const { addToCart } = useCart();
  const { user, userData } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const showIngredients = width >= 768;

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
  const [allergenModalVisible, setAllergenModalVisible] = useState(false);
  const [allergenModalMatches, setAllergenModalMatches] = useState<string[]>([]);
  const [allergenConfirmChecked, setAllergenConfirmChecked] = useState(false);
  const [pendingFood, setPendingFood] = useState<any | null>(null);
  
  // Satıcı profil resmi için state
  const [sellerAvatar, setSellerAvatar] = useState('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face');

  // Satıcı profil verilerini yükle
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
    };

    loadDetails();
  }, [foodId]);

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
            <FontAwesome name="times" size={20} color={colors.text} />
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
        </View>

        <View style={styles.chefStrip}>
          <Image
            source={{ uri: sellerAvatar }}
            style={styles.chefAvatar}
          />
          <Text variant="body" weight="semibold" style={styles.chefName}>
            {cookName}
          </Text>
        </View>
        
        {/* Food Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.titleRow}>
            <Text variant="heading" weight="bold" style={styles.title}>
              {foodName}
            </Text>
            <View style={styles.priceCorner}>
              <Text variant="subheading" weight="bold" color="primary">
                ₺25 <Text variant="caption" color="textSecondary">{t('foodDetailSimpleScreen.portion')}</Text>
              </Text>
            </View>
          </View>
          
          {/* Satıcı Profil Kartı - Satıcı Panelinden */}
          <Card variant="default" padding="md" style={styles.sellerCard}>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerAvatarContainer}>
                <Image
                  source={{ uri: sellerAvatar }}
                  style={styles.sellerAvatarImage}
                  defaultSource={{ uri: 'https://via.placeholder.com/60x60/7FAF9A/FFFFFF?text=S' }}
                />
              </View>
              <View style={styles.sellerDetails}>
                <Text variant="subheading" weight="semibold">
                  {cookName}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {t('foodDetailSimpleScreen.sellerMeta')}
                </Text>
              </View>
              {/* Yıldız Değerlendirme - Sağ Üst Köşe */}
              <View style={styles.ratingCorner}>
                <Text variant="body" weight="bold" color="text">
                  ⭐ 4.8
                </Text>
              </View>
            </View>
          </Card>

          {/* Favoriye Ekle Butonu - Çerçevesiz */}
          <TouchableOpacity 
            style={[styles.favoriteButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              // Favorilere ekle
              alert(t('foodDetailSimpleScreen.addFavoriteToast'));
            }}
          >
            <Text variant="body" color="primary">{t('foodDetailSimpleScreen.addFavorite')}</Text>
          </TouchableOpacity>
          
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
            <Text variant="body" style={styles.ingredientsText}>
              {allergens && allergens.length > 0
                ? allergens.join(', ')
                : t('foodDetailSimpleScreen.allergensEmpty')}
            </Text>
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
            <FontAwesome
              name={quantity === 1 ? 'trash' : 'minus'}
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
            <FontAwesome name="plus" size={18} color="#2E7D32" />
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
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  imageCounterText: {
    color: '#FFFFFF',
  },
  chefStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chefAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  chefName: {
    fontSize: 14,
  },
  infoContainer: {
    padding: Spacing.lg,
    margin: Spacing.md,
    borderRadius: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
    marginRight: Spacing.md,
  },
  priceCorner: {
    alignItems: 'flex-end',
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
  favoriteButton: {
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sellerCard: {
    marginBottom: Spacing.md,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  sellerAvatarContainer: {
    marginRight: Spacing.md,
  },
  sellerAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#7FAF9A',
  },
  sellerDetails: {
    flex: 1,
  },
  ratingCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  ingredientsSection: {
    marginBottom: Spacing.lg,
  },
  allergensSection: {
    marginBottom: Spacing.lg,
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
