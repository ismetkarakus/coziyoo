import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';

export default function FoodDetailSimple() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { formatCurrency } = useCountry();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const showIngredients = width >= 768;

  const foodName = params.name as string || t('foodDetailSimpleScreen.defaults.foodName');
  const cookName = params.cookName as string || t('foodDetailSimpleScreen.defaults.cookName');
  const foodImageUrl = params.imageUrl as string || 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop';
  const [quantity, setQuantity] = useState(1);
  const basePrice = Number(params.price) || 25;
  const totalPrice = formatCurrency(basePrice * quantity);
  
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Food Image */}
        <Image 
          source={{ uri: foodImageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        
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
          
          {/* İçindekiler/Baharatlar/Tarif */}
          {showIngredients && (
            <View style={styles.ingredientsSection}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                {t('foodDetailSimpleScreen.ingredientsTitle')}
              </Text>
              <Text variant="body" style={styles.ingredientsText}>
                {t('foodDetailSimpleScreen.ingredients')}
              </Text>
            </View>
          )}

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
  image: {
    width: '100%',
    height: 250,
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
