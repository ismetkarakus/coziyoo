import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from './Text';
import { StarRating } from './StarRating';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { Review } from '../../services/reviewService';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from '../../hooks/useTranslation';

interface ReviewCardProps {
  review: Review;
  onHelpfulPress?: () => void;
  onReportPress?: () => void;
  onImagePress?: (imageUrl: string) => void;
  showFoodName?: boolean;
  compact?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpfulPress,
  onReportPress,
  onImagePress,
  showFoodName = false,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return t('reviewCard.dateUnknown');
    
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return t('reviewCard.dateInvalid');
    
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return t('reviewCard.today');
    } else if (diffInDays === 1) {
      return t('reviewCard.yesterday');
    } else if (diffInDays < 7) {
      return t('reviewCard.daysAgo', { count: diffInDays });
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return t('reviewCard.weeksAgo', { count: weeks });
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return t('reviewCard.monthsAgo', { count: months });
    } else {
      return dateObj.toLocaleDateString(currentLanguage === 'en' ? 'en-GB' : 'tr-TR');
    }
  };

  const getAvatarUrl = () => {
    if (review.buyerAvatar) return review.buyerAvatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(review.buyerName)}&background=random&color=fff&size=40`;
  };

  const renderImages = () => {
    if (!review.images || review.images.length === 0) return null;

    return (
      <View style={styles.imagesContainer}>
        {review.images.slice(0, 3).map((imageUrl, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onImagePress?.(imageUrl)}
            style={styles.imageContainer}
          >
            <Image source={{ uri: imageUrl }} style={styles.reviewImage} />
            {index === 2 && review.images!.length > 3 && (
              <View style={[styles.moreImagesOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Text variant="caption" style={{ color: 'white' }}>
                  +{review.images!.length - 3}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text variant="body" weight="medium" style={{ color: colors.text }}>
                {review.buyerName}
              </Text>
              {review.isVerifiedPurchase && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                  <FontAwesome name="check" size={10} color={colors.background} />
                  <Text variant="caption" style={{ color: colors.background, marginLeft: 2 }}>
                    {t('reviewCard.verified')}
                  </Text>
                </View>
              )}
            </View>
            <Text variant="caption" style={{ color: colors.textSecondary }}>
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
        
        <StarRating rating={review.rating} size="small" />
      </View>

      {/* Food Name (if showing) */}
      {showFoodName && (
        <Text variant="body" weight="medium" style={[styles.foodName, { color: colors.primary }]}>
          {review.foodName}
        </Text>
      )}

      {/* Comment */}
      {review.comment && (
        <Text 
          variant="body" 
          style={[styles.comment, { color: colors.text }]}
          numberOfLines={compact ? 3 : undefined}
        >
          {review.comment}
        </Text>
      )}

      {/* Images */}
      {renderImages()}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onHelpfulPress}
          style={styles.actionButton}
        >
          <FontAwesome name="thumbs-up" size={14} color={colors.textSecondary} />
          <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
            {t('reviewCard.helpful', { count: review.helpfulCount })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onReportPress}
          style={styles.actionButton}
        >
          <FontAwesome name="flag" size={14} color={colors.textSecondary} />
          <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: 4 }}>
            {t('reviewCard.report')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: Spacing.sm,
  },
  foodName: {
    marginBottom: Spacing.sm,
  },
  comment: {
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  imageContainer: {
    position: 'relative',
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
});








