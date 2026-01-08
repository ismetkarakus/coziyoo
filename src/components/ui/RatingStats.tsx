import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { StarRating } from './StarRating';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { ReviewStats } from '../../services/reviewService';

interface RatingStatsProps {
  stats: ReviewStats;
  compact?: boolean;
}

export const RatingStats: React.FC<RatingStatsProps> = ({
  stats,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderRatingBar = (rating: number, count: number) => {
    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
    
    return (
      <View key={rating} style={styles.ratingBarContainer}>
        <Text variant="caption" style={[styles.ratingLabel, { color: colors.textSecondary }]}>
          {rating}
        </Text>
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
        <Text variant="caption" style={[styles.countLabel, { color: colors.textSecondary }]}>
          {count}
        </Text>
      </View>
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
          ({stats.totalReviews} değerlendirme)
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
            {stats.totalReviews} değerlendirme
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
  ratingLabel: {
    width: 12,
    textAlign: 'center',
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









