import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { SearchFilters } from '../../services/searchService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const categories = [
    'Tümü', 'Ana Yemek', 'Çorba', 'Kahvaltı', 'Salata', 
    'Tatlı', 'İçecek', 'Atıştırmalık', 'Vegan', 'Diyet'
  ];

  const priceRanges = [
    { label: '0-25 ₺', min: 0, max: 25 },
    { label: '25-50 ₺', min: 25, max: 50 },
    { label: '50-75 ₺', min: 50, max: 75 },
    { label: '75-100 ₺', min: 75, max: 100 },
    { label: '100+ ₺', min: 100, max: 1000 },
  ];

  const ratingOptions = [
    { label: '4+ Yıldız', value: 4 },
    { label: '3+ Yıldız', value: 3 },
    { label: '2+ Yıldız', value: 2 },
    { label: '1+ Yıldız', value: 1 },
  ];

  const sortOptions = [
    { label: 'En Yeni', value: 'newest' as const },
    { label: 'En Popüler', value: 'popularity' as const },
    { label: 'En Yüksek Puan', value: 'rating_desc' as const },
    { label: 'Fiyat (Düşük-Yüksek)', value: 'price_asc' as const },
    { label: 'Fiyat (Yüksek-Düşük)', value: 'price_desc' as const },
  ];

  const handleCategorySelect = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'Tümü' ? undefined : category
    }));
  };

  const handlePriceRangeSelect = (range: { min: number; max: number }) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  const handleRatingSelect = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? undefined : rating
    }));
  };

  const handleDeliveryOptionToggle = (option: 'pickup' | 'delivery') => {
    setFilters(prev => {
      const currentOptions = prev.deliveryOptions || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];
      
      return {
        ...prev,
        deliveryOptions: newOptions.length > 0 ? newOptions : undefined
      };
    });
  };

  const handleSortSelect = (sortBy: SearchFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy
    }));
  };

  const handleDistanceChange = (distance: number) => {
    setFilters(prev => ({
      ...prev,
      maxDistance: distance
    }));
  };

  const handlePreparationTimeChange = (time: number) => {
    setFilters(prev => ({
      ...prev,
      preparationTime: { max: time }
    }));
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.priceRange) count++;
    if (filters.rating) count++;
    if (filters.deliveryOptions?.length) count++;
    if (filters.maxDistance) count++;
    if (filters.preparationTime) count++;
    if (filters.sortBy && filters.sortBy !== 'newest') count++;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome name="times" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text variant="heading" style={styles.title}>
            Filtreler
          </Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text variant="body" color="primary">Temizle</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <Card style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Kategori
            </Text>
            <View style={styles.chipContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: filters.category === category || (category === 'Tümü' && !filters.category)
                        ? colors.primary
                        : colors.surface,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text
                    variant="body"
                    style={{
                      color: filters.category === category || (category === 'Tümü' && !filters.category)
                        ? colors.background
                        : colors.text
                    }}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Price Range */}
          <Card style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Fiyat Aralığı
            </Text>
            <View style={styles.chipContainer}>
              {priceRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                        ? colors.primary
                        : colors.surface,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handlePriceRangeSelect(range)}
                >
                  <Text
                    variant="body"
                    style={{
                      color: filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                        ? colors.background
                        : colors.text
                    }}
                  >
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Rating */}
          <Card style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Minimum Puan
            </Text>
            <View style={styles.chipContainer}>
              {ratingOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: filters.rating === option.value
                        ? colors.primary
                        : colors.surface,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => handleRatingSelect(option.value)}
                >
                  <Text
                    variant="body"
                    style={{
                      color: filters.rating === option.value
                        ? colors.background
                        : colors.text
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Delivery Options */}
          <Card style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Teslimat Seçenekleri
            </Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: filters.deliveryOptions?.includes('pickup')
                      ? colors.primary
                      : colors.surface,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleDeliveryOptionToggle('pickup')}
              >
                <Text
                  variant="body"
                  style={{
                    color: filters.deliveryOptions?.includes('pickup')
                      ? colors.background
                      : colors.text
                  }}
                >
                  🏃‍♂️ Gel Al
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: filters.deliveryOptions?.includes('delivery')
                      ? colors.primary
                      : colors.surface,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => handleDeliveryOptionToggle('delivery')}
              >
                <Text
                  variant="body"
                  style={{
                    color: filters.deliveryOptions?.includes('delivery')
                      ? colors.background
                      : colors.text
                  }}
                >
                  🚚 Teslimat
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Max Distance */}
          <Card style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Maksimum Mesafe: {filters.maxDistance || 10} km
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              value={filters.maxDistance || 10}
              onValueChange={handleDistanceChange}
              step={1}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </Card>

          {/* Preparation Time */}
          <Card style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Maksimum Hazırlık Süresi: {filters.preparationTime?.max || 60} dk
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={15}
              maximumValue={120}
              value={filters.preparationTime?.max || 60}
              onValueChange={handlePreparationTimeChange}
              step={15}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </Card>

          {/* Sort Options */}
          <Card style={styles.section}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              Sıralama
            </Text>
            <View style={styles.radioContainer}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => handleSortSelect(option.value)}
                >
                  <View style={[
                    styles.radioButton,
                    { borderColor: colors.border }
                  ]}>
                    {filters.sortBy === option.value && (
                      <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text variant="body" style={{ color: colors.text }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button
            variant="primary"
            fullWidth
            onPress={handleApply}
          >
            Filtreleri Uygula {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  resetButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radioContainer: {
    gap: Spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
});
