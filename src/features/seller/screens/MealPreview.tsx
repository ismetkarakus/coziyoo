import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, FoodCard } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const MealPreview: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { previewData } = useLocalSearchParams();

  // Format date range for display (e.g., "1-3 Ocak")
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return t('mealPreviewScreen.unknownDate');
    
    try {
      const months =
        currentLanguage === 'en'
          ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
          : ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      
      // Parse dates (assuming DD/MM/YYYY format)
      const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
      const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
      
      // Same month and year
      if (startMonth === endMonth && startYear === endYear) {
        return `${startDay}-${endDay} ${months[startMonth - 1]}`;
      }
      
      // Different months or years
      return `${startDay} ${months[startMonth - 1]} - ${endDay} ${months[endMonth - 1]}`;
    } catch (error) {
      return `${startDate} - ${endDate}`;
    }
  };

  // Parse preview data
  let data = {};
  try {
    if (previewData) {
      const decodedData = decodeURIComponent(previewData as string);
      data = JSON.parse(decodedData);
    }
  } catch (error) {
    console.error('Error parsing preview data:', error);
    data = {};
  }

  const handleBackPress = () => {
    router.back();
  };


  // Debug: Log the incoming data
  console.log('MealPreview - Incoming data:', data);
  console.log('MealPreview - Images:', data.images);
  console.log('MealPreview - Name:', data.name);

  // Get seller name from profile
  const [sellerName, setSellerName] = React.useState(t('mealPreviewScreen.yourName'));

  React.useEffect(() => {
    const loadSellerName = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('sellerProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          if (profile.formData) {
            // Nickname varsa onu kullan, yoksa gerçek ismi kullan
            setSellerName(profile.formData.nickname || profile.formData.name || t('mealPreviewScreen.yourName'));
          }
        }
      } catch (error) {
        console.error('Error loading seller name:', error);
      }
    };
    loadSellerName();
  }, []);

  // Create mock food card data from form data
  const mockFoodData = {
    id: 'preview-' + Date.now(),
    name: data.name || t('mealPreviewScreen.defaultMealName'),
    cookName: sellerName,
    rating: 4.8, // Default rating for preview
    price: parseInt(data.price) || 0,
    distance: data.maxDistance
      ? t('mealPreviewScreen.distanceDelivery', { distance: data.maxDistance })
      : t('mealPreviewScreen.distanceZero'),
    category: data.category || t('mealPreviewScreen.defaultCategory'),
    country: data.country || t('mealPreviewScreen.defaultCountry'),
    hasPickup: data.hasPickup || false,
    hasDelivery: data.hasDelivery || false,
    availableDates: data.availableDates || formatDateRange(data.startDate, data.endDate),
    currentStock: parseInt(data.dailyStock) || 0,
    dailyStock: parseInt(data.dailyStock) || 0,
    maxDeliveryDistance: parseInt(data.maxDistance) || 0,
    imageUrl: data.images && data.images.length > 0 ? data.images[0] : undefined,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('mealPreviewScreen.title')}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.topBarBackButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text variant="subheading" weight="semibold" style={styles.infoTitle}>
            {t('mealPreviewScreen.infoTitle')}
          </Text>
          <Text variant="body" color="textSecondary" style={styles.infoText}>
            {t('mealPreviewScreen.infoDesc')}
          </Text>
        </View>

        {/* Preview Card */}
        <View style={styles.previewSection}>
          <Text variant="body" weight="medium" style={styles.previewLabel}>
            {t('mealPreviewScreen.previewLabel')}
          </Text>
          
          <View style={styles.cardContainer}>
            <View style={styles.fullWidthCard}>
              <FoodCard
                {...mockFoodData}
                isPreview={true} // Önizleme modunda local resimlere izin ver
                onAddToCart={() => {}} // Empty function for preview
                showAvailableDates={true}
              />
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text variant="subheading" weight="semibold" style={styles.detailsTitle}>
            {t('mealPreviewScreen.detailsTitle')}
          </Text>
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.category')}</Text>
            <Text variant="body" color="textSecondary">{data.category || t('mealPreviewScreen.unknown')}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.name')}</Text>
            <Text variant="body" color="textSecondary">{data.name || t('mealPreviewScreen.unknown')}</Text>
          </View>
          
          {data.description && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.description')}</Text>
              <Text variant="body" color="textSecondary">{data.description}</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.price')}</Text>
            <Text variant="body" color="textSecondary">₺{data.price || '0'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.dailyStock')}</Text>
            <Text variant="body" color="textSecondary">
              {data.dailyStock || '0'} {t('mealPreviewScreen.labels.portion')}
            </Text>
          </View>
          
          {data.maxDistance && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.deliveryDistance')}</Text>
              <Text variant="body" color="textSecondary">{data.maxDistance} km</Text>
            </View>
          )}
          
          {data.deliveryFee && data.hasDelivery && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.deliveryFee')}</Text>
              <Text variant="body" color="textSecondary">₺{data.deliveryFee}</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.deliveryOptions')}</Text>
            <Text variant="body" color="textSecondary">
              {data.hasPickup && data.hasDelivery
                ? t('mealPreviewScreen.deliveryOptions.both')
                : data.hasPickup
                ? t('mealPreviewScreen.deliveryOptions.pickup')
                : data.hasDelivery
                ? t('mealPreviewScreen.deliveryOptions.delivery')
                : t('mealPreviewScreen.unknown')}
            </Text>
          </View>
          
          {(data.startDate || data.endDate) && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">{t('mealPreviewScreen.labels.dateRange')}</Text>
              <Text variant="body" color="textSecondary">
                {data.startDate && data.endDate ? 
                  `${data.startDate} - ${data.endDate}` :
                  data.startDate ? t('mealPreviewScreen.dateFrom', { date: data.startDate }) :
                  data.endDate ? t('mealPreviewScreen.dateTo', { date: data.endDate }) :
                  t('mealPreviewScreen.unknown')}
              </Text>
            </View>
          )}
        </View>


        <View style={styles.bottomSpace} />
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
    padding: Spacing.md,
  },
  // Info Section
  infoSection: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.light.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
  },
  infoTitle: {
    marginBottom: Spacing.sm,
    color: Colors.light.primary,
  },
  infoText: {
    lineHeight: 20,
  },
  // Preview Section
  previewSection: {
    marginBottom: Spacing.lg,
  },
  previewLabel: {
    marginBottom: Spacing.sm,
    color: Colors.light.text,
  },
  cardContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    marginHorizontal: -Spacing.md, // Negatif margin ile tam genişlik
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  fullWidthCard: {
    width: '100%', // Tam genişlik
  },
  // Details Section
  detailsSection: {
    marginBottom: Spacing.lg,
  },
  detailsTitle: {
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  // TopBar Back Button
  topBarBackButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
