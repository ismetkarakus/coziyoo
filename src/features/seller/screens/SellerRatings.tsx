import React, { useMemo } from 'react';
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
          <RatingStats stats={stats} />
        </Card>

        <View style={styles.listHeader}>
          <Text variant="subheading" weight="semibold">
            {t('sellerRatingsScreen.reviewsTitle')}
          </Text>
          <Text variant="caption" color="textSecondary">
            {t('sellerRatingsScreen.reviewsCount', { count: reviews.length })}
          </Text>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="body" color="textSecondary">
              {t('sellerRatingsScreen.empty')}
            </Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {reviews.map((review) => (
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
  },
  sectionTitle: {
    marginBottom: Spacing.md,
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
