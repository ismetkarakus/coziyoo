import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, ReviewCard, RatingStats, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { Review, ReviewStats } from '../../../services/reviewService';
import sellerMock from '../../../mock/seller.json';

const getMockSellerReviews = (language: 'tr' | 'en', sellerName: string): Review[] => {
  if (language === 'en') {
    return [
      {
        id: 'rev-1',
        foodId: 'food-1',
        foodName: 'Homemade Manti',
        buyerId: 'buyer-1',
        buyerName: 'Ahmet K.',
        buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
        sellerId: 'seller-1',
        sellerName,
        rating: 5,
        comment: 'Amazing taste, felt like home. Will order again!',
        helpfulCount: 12,
        reportCount: 0,
        isVerifiedPurchase: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'rev-2',
        foodId: 'food-2',
        foodName: 'Karniyarik',
        buyerId: 'buyer-2',
        buyerName: 'Zeynep M.',
        buyerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
        sellerId: 'seller-1',
        sellerName,
        rating: 4,
        comment: 'Tasty and portion is good. Delivery was quick.',
        helpfulCount: 5,
        reportCount: 0,
        isVerifiedPurchase: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'rev-3',
        foodId: 'food-3',
        foodName: 'Veggie Kofte',
        buyerId: 'buyer-3',
        buyerName: 'Can Y.',
        buyerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
        sellerId: 'seller-1',
        sellerName,
        rating: 5,
        comment: 'Fresh and well seasoned. Great for vegetarian option.',
        helpfulCount: 3,
        reportCount: 0,
        isVerifiedPurchase: false,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
  }

  return [
    {
      id: 'rev-1',
      foodId: 'food-1',
      foodName: 'Ev Yapımı Mantı',
      buyerId: 'buyer-1',
      buyerName: 'Ahmet K.',
      buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
      sellerId: 'seller-1',
      sellerName,
      rating: 5,
      comment: 'Harika bir lezzet, ev yemeği tadında. Tekrar sipariş vereceğim!',
      helpfulCount: 12,
      reportCount: 0,
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: 'rev-2',
      foodId: 'food-2',
      foodName: 'Karnıyarık',
      buyerId: 'buyer-2',
      buyerName: 'Zeynep M.',
      buyerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
      sellerId: 'seller-1',
      sellerName,
      rating: 4,
      comment: 'Lezzetli, porsiyon güzel. Teslimat hızlıydı.',
      helpfulCount: 5,
      reportCount: 0,
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    {
      id: 'rev-3',
      foodId: 'food-3',
      foodName: 'Vejetaryen Köfte',
      buyerId: 'buyer-3',
      buyerName: 'Can Y.',
      buyerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
      sellerId: 'seller-1',
      sellerName,
      rating: 5,
      comment: 'Taze ve iyi baharatlı. Vejetaryen için çok iyi seçenek.',
      helpfulCount: 3,
      reportCount: 0,
      isVerifiedPurchase: false,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];
};

const buildStats = (reviews: Review[]): ReviewStats => {
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewStats['ratingDistribution'];
  let totalRating = 0;
  reviews.forEach((review) => {
    const rating = Math.round(review.rating) as keyof typeof ratingDistribution;
    ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    totalRating += review.rating;
  });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
  return { averageRating, totalReviews, ratingDistribution };
};

export const SellerRatings: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const localizedSeller = (sellerMock as any)[currentLanguage] ?? sellerMock.tr;
  const sellerName = localizedSeller.profile.nickname?.trim() || localizedSeller.profile.name;

  const reviews = useMemo(() => getMockSellerReviews(currentLanguage, sellerName), [currentLanguage, sellerName]);
  const stats = useMemo(() => buildStats(reviews), [reviews]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isRatingGuideVisible, setIsRatingGuideVisible] = useState(false);
  const [isRatingFilterEnabled, setIsRatingFilterEnabled] = useState(false);

  const filteredReviews = useMemo(() => {
    if (!selectedRating) return reviews;
    return reviews.filter((review) => Math.round(review.rating) === selectedRating);
  }, [reviews, selectedRating]);

  const handleRatingPress = (rating: number) => {
    if (!isRatingFilterEnabled) {
      return;
    }
    setIsRatingGuideVisible(false);
    setSelectedRating((prev) => (prev === rating ? null : rating));
  };

  const handleGuidePress = () => {
    setIsRatingFilterEnabled(true);
    setIsRatingGuideVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('sellerRatingsScreen.title')}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t('sellerRatingsScreen.summaryTitle', { name: sellerName })}
          </Text>
          <RatingStats
            stats={stats}
            onRatingPress={isRatingFilterEnabled ? handleRatingPress : undefined}
            selectedRating={selectedRating}
          />
          <View style={styles.guideInlineRow}>
            <TouchableOpacity
              onPress={handleGuidePress}
              activeOpacity={0.8}
              style={[styles.guideIconButton, { backgroundColor: colors.primary + '20' }]}
            >
              <MaterialIcons name="touch-app" size={18} color={colors.primary} />
            </TouchableOpacity>
            {isRatingGuideVisible ? (
              <View style={[styles.guideBubble, { borderColor: colors.primary, backgroundColor: colors.primary + '14' }]}>
                <Text variant="caption" style={{ color: colors.text }}>
                  {t('sellerRatingsScreen.guideText')}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>

        <View style={styles.listHeader}>
          <Text variant="subheading" weight="semibold">
            {selectedRating
              ? `${selectedRating}★ ${t('sellerRatingsScreen.reviewsTitle')}`
              : t('sellerRatingsScreen.reviewsTitle')}
          </Text>
          <Text variant="caption" color="textSecondary">
            {t('sellerRatingsScreen.reviewsCount', { count: filteredReviews.length })}
          </Text>
        </View>

        {filteredReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="body" color="textSecondary">
              {selectedRating
                ? (currentLanguage === 'en'
                  ? `No ${selectedRating}-star reviews yet.`
                  : `Henüz ${selectedRating} yıldızlı yorum yok.`)
                : t('sellerRatingsScreen.empty')}
            </Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} showFoodName />
            ))}
          </View>
        )}

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
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  summaryCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    position: 'relative',
    overflow: 'visible',
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  guideInlineRow: {
    position: 'absolute',
    left: Spacing.md,
    bottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideBubble: {
    marginLeft: Spacing.xs,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    maxWidth: 260,
  },
  guideIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  emptyState: {
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  reviewsList: {
    marginHorizontal: Spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
