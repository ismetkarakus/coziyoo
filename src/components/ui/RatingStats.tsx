import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { StarRating } from './StarRating';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { ReviewStats } from '../../services/reviewService';
import { useTranslation } from '../../hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface RatingStatsProps {
  stats: ReviewStats;
  compact?: boolean;
  onRatingPress?: (rating: number) => void;
  selectedRating?: number | null;
}

export const RatingStats: React.FC<RatingStatsProps> = ({
  stats,
  compact = false,
  onRatingPress,
  selectedRating = null,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const renderRatingBar = (rating: number, count: number) => {
    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
    const isInteractive = typeof onRatingPress === 'function';
    const isSelected = selectedRating === rating;

    return (
      <TouchableOpacity
        key={rating}
        style={[
          styles.ratingBarContainer,
          isInteractive ? styles.ratingBarTouchable : null,
          isSelected
            ? {
                backgroundColor: colors.primary + '22',
              }
            : null,
        ]}
        activeOpacity={isInteractive ? 0.75 : 1}
        onPress={isInteractive ? () => onRatingPress?.(rating) : undefined}
        disabled={!isInteractive}
      >
        <View style={styles.ratingLabelWrap}>
          {isInteractive && isSelected ? (
            <MaterialIcons
              name="touch-app"
              size={12}
              color={isSelected ? colors.primary : colors.textSecondary}
            />
          ) : <View style={styles.ratingIconSpacer} />}
          <Text
            variant="caption"
            style={[
              styles.ratingLabel,
              { color: isSelected ? colors.primary : colors.textSecondary },
              isSelected ? styles.selectedText : null,
            ]}
          >
            {rating}
          </Text>
        </View>
        <StarRating rating={1} maxRating={1} size="small" />
        <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.barFill, 
              { 
                backgroundColor: colors.primary,
                width: `${percentage}%`
              }
            ]} 
          />
        </View>
        <Text
          variant="caption"
          style={[
            styles.countLabel,
            { color: isSelected ? colors.primary : colors.textSecondary },
            isSelected ? styles.selectedText : null,
          ]}
        >
          {count}
        </Text>
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <StarRating 
          rating={stats.averageRating} 
          size="medium" 
          showNumber 
        />
        <Text variant="caption" style={[styles.reviewCount, { color: colors.textSecondary }]}>
          {t('ratingStats.reviewCountCompact', { count: stats.totalReviews })}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overall Rating */}
      <View style={styles.overallRating}>
        <Text variant="title" style={[styles.averageRating, { color: colors.text }]}>
          {stats.averageRating.toFixed(1)}
        </Text>
        <View style={styles.ratingInfo}>
          <StarRating rating={stats.averageRating} size="large" />
          <Text variant="body" style={[styles.totalReviews, { color: colors.textSecondary }]}>
            {t('ratingStats.reviewCount', { count: stats.totalReviews })}
          </Text>
        </View>
      </View>

      {/* Rating Distribution */}
      <View style={styles.distribution}>
        {[5, 4, 3, 2, 1].map(rating => 
          renderRatingBar(rating, stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reviewCount: {
    marginLeft: Spacing.xs,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: Spacing.lg,
  },
  ratingInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  totalReviews: {
    marginTop: Spacing.xs,
  },
  distribution: {
    gap: Spacing.sm,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingBarTouchable: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  selectedText: {
    fontWeight: '600',
  },
  ratingLabel: {
    width: 12,
    textAlign: 'center',
  },
  ratingLabelWrap: {
    width: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingIconSpacer: {
    width: 12,
    height: 12,
  },
  barBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  countLabel: {
    width: 30,
    textAlign: 'right',
  },
});
