import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Text } from './Text';
import { Card } from './Card';
import { StarRating } from './StarRating';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { useCountry } from '../../context/CountryContext';

interface FoodOrderCardProps {
  title?: string;
  name: string;
  subtitle?: string;
  description?: string;
  price: number;
  etaLabel?: string;
  distanceLabel?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  onView?: () => void;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export const FoodOrderCard: React.FC<FoodOrderCardProps> = ({
  title = 'Food Order Card',
  name,
  subtitle,
  description,
  price,
  etaLabel,
  distanceLabel,
  rating = 0,
  reviewCount = 0,
  imageUrl,
  onView,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { formatCurrency } = useCountry();

  const pills: { label: string }[] = [];
  pills.push({ label: formatCurrency(price) });
  if (etaLabel) pills.push({ label: etaLabel });
  if (distanceLabel) pills.push({ label: distanceLabel });

  return (
    <Card variant="default" padding="none" style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.headerBar}>
        <Text variant="subheading" weight="bold" style={styles.headerText}>
          {title}
        </Text>
      </View>

      <View style={styles.ratingRow}>
        <StarRating rating={rating} size="large" showNumber={false} />
        <Text variant="body" weight="bold" style={styles.ratingText}>
          {rating.toFixed(1)}
        </Text>
        <Text variant="body" color="textSecondary" style={styles.reviewText}>
          ({reviewCount} Reviews)
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.contentRow}>
        <View style={styles.imageWrap}>
          <Image
            source={
              imageUrl
                ? { uri: imageUrl }
                : { uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=320&h=240&fit=crop' }
            }
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.detailsColumn}>
          <Text variant="subheading" weight="bold" style={styles.titleText}>
            {name}
          </Text>
          {!!subtitle && (
            <Text variant="body" color="textSecondary" style={styles.subtitleText}>
              {subtitle}
            </Text>
          )}

          <View style={styles.detailsDivider} />

          {!!description && (
            <Text variant="body" color="textSecondary" style={styles.descriptionText} numberOfLines={2}>
              {description}
            </Text>
          )}

          <View style={styles.pillRow}>
            {pills.map((pill, index) => (
              <View key={`${pill.label}-${index}`} style={styles.pill}>
                <Text variant="body" weight="medium" style={styles.pillText}>
                  {pill.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionButton, styles.actionOutline]} onPress={onView}>
          <Text variant="body" weight="bold" style={styles.actionOutlineText}>
            View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]} onPress={onAddToCart}>
          <Text variant="body" weight="bold" style={styles.actionPrimaryText}>
            Add to Cart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionGhost]} onPress={onToggleFavorite}>
          <FontAwesome
            name={isFavorite ? 'heart' : 'heart-o'}
            size={22}
            color={isFavorite ? '#F05A28' : '#6B6B6B'}
          />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  headerBar: {
    backgroundColor: '#F28C28',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: 18,
    marginLeft: 6,
    color: '#3B3B3B',
  },
  reviewText: {
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E7E7E7',
  },
  contentRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  imageWrap: {
    width: 150,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F3F3',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsColumn: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleText: {
    fontSize: 20,
    color: '#333333',
  },
  subtitleText: {
    marginTop: 2,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#E7E7E7',
    marginVertical: 8,
  },
  descriptionText: {
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    color: '#3B3B3B',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  actionButton: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
  },
  actionOutlineText: {
    color: '#6B6B6B',
  },
  actionPrimary: {
    flex: 1.6,
    backgroundColor: '#F28C28',
  },
  actionPrimaryText: {
    color: '#FFFFFF',
  },
  actionGhost: {
    width: 56,
    backgroundColor: '#F2F2F2',
  },
});
