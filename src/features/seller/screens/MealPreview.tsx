import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, FoodCard } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const MealPreview: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { previewData } = useLocalSearchParams();

  // Format date range for display (e.g., "1-3 Ocak")
  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 'Tarih belirtilmemiş';
    
    try {
      const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      
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



  // Create mock food card data from form data
  const mockFoodData = {
    id: 'preview-' + Date.now(),
    name: data.name || 'Yemek Adı',
    cookName: 'Sizin Adınız', // This would come from user profile
    rating: 4.8, // Default rating for preview
    price: parseInt(data.price) || 0,
    distance: data.maxDistance ? `${data.maxDistance} km teslimat` : '0 km teslimat',
    category: data.category || 'Kategori',
    country: data.country || 'Türk',
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
        title="Önizleme - Müşteri Görünümü"
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
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
            👁️ Müşteri Bu Şekilde Görecek
          </Text>
          <Text variant="body" color="textSecondary" style={styles.infoText}>
            Yemeğiniz ana ekranda aşağıdaki gibi görünecek. Beğenmediyseniz geri dönüp düzenleyebilirsiniz.
          </Text>
        </View>

        {/* Preview Card */}
        <View style={styles.previewSection}>
          <Text variant="body" weight="medium" style={styles.previewLabel}>
            Ana Ekran Görünümü:
          </Text>
          
          <View style={styles.cardContainer}>
            <FoodCard
              {...mockFoodData}
              isPreview={true} // Önizleme modunda local resimlere izin ver
              onAddToCart={() => {}} // Empty function for preview
            />
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text variant="subheading" weight="semibold" style={styles.detailsTitle}>
            📋 Yemek Detayları
          </Text>
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">Kategori:</Text>
            <Text variant="body" color="textSecondary">{data.category || 'Belirtilmemiş'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">Yemek Adı:</Text>
            <Text variant="body" color="textSecondary">{data.name || 'Belirtilmemiş'}</Text>
          </View>
          
          {data.description && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">Açıklama:</Text>
              <Text variant="body" color="textSecondary">{data.description}</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">Fiyat:</Text>
            <Text variant="body" color="textSecondary">₺{data.price || '0'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">Günlük Stok:</Text>
            <Text variant="body" color="textSecondary">{data.dailyStock || '0'} porsiyon</Text>
          </View>
          
          {data.maxDistance && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">Teslimat Mesafesi:</Text>
              <Text variant="body" color="textSecondary">{data.maxDistance} km</Text>
            </View>
          )}
          
          {data.deliveryFee && data.hasDelivery && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">Teslimat Ücreti:</Text>
              <Text variant="body" color="textSecondary">₺{data.deliveryFee}</Text>
            </View>
          )}
          
          <View style={styles.detailItem}>
            <Text variant="body" weight="medium">Teslimat Seçenekleri:</Text>
            <Text variant="body" color="textSecondary">
              {data.hasPickup && data.hasDelivery ? 'Pickup + Delivery' :
               data.hasPickup ? 'Sadece Pickup' :
               data.hasDelivery ? 'Sadece Delivery' : 'Belirtilmemiş'}
            </Text>
          </View>
          
          {(data.startDate || data.endDate) && (
            <View style={styles.detailItem}>
              <Text variant="body" weight="medium">Tarih Aralığı:</Text>
              <Text variant="body" color="textSecondary">
                {data.startDate && data.endDate ? 
                  `${data.startDate} - ${data.endDate}` :
                  data.startDate ? `${data.startDate} tarihinden itibaren` :
                  data.endDate ? `${data.endDate} tarihine kadar` :
                  'Belirtilmemiş'}
              </Text>
            </View>
          )}
        </View>

        {/* Back/Close Button */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={[styles.backButtonStyle, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text variant="body" weight="medium" style={{ color: colors.text }}>
              ✕ Geri Dön
            </Text>
          </TouchableOpacity>
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
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
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
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  publishButton: {
    borderWidth: 0,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
  // Back Button
  backButtonContainer: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  backButtonStyle: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
