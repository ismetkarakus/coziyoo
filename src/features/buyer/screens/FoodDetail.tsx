import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock data - in real app, this would come from API
const getMockFoodDetail = (name: string, cookName: string, imageUrl: string) => ({
  id: '1',
  name: name || 'Ev Yapımı Mantı',
  cookName: cookName || 'Ayşe Hanım',
  rating: 4.8,
  reviewCount: 24,
  price: 25,
  distance: '1.2 km',
  prepTime: '30 dk',
  description: 'Geleneksel yöntemlerle hazırlanan, ince açılmış hamur ile sarılmış, özel baharatlarla tatlandırılmış ev yapımı mantı. Yanında yoğurt ve tereyağlı sos ile servis edilir.',
  hasPickup: true,
  hasDelivery: true,
  imageUrl: imageUrl,
});

export const FoodDetail: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  // Get food details from URL parameters
  const foodName = params.name as string;
  const cookName = params.cookName as string;
  const foodImageUrl = params.imageUrl as string;
  console.log('FoodDetail params:', { foodName, cookName, foodImageUrl, allParams: params });
  const food = getMockFoodDetail(foodName, cookName, foodImageUrl);

  const handleMessageSeller = () => {
    console.log(`Opening chat with ${food.cookName}`);
    router.push(`/(tabs)/chat-detail?sellerId=${food.id}&sellerName=${encodeURIComponent(food.cookName)}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={`${food.name} - ${food.cookName}`} />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Food Image - Full Width */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
          {food.imageUrl ? (
            <Image 
              source={{ uri: food.imageUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text variant="title" color="textSecondary">
              📸
            </Text>
          )}
        </View>

        <View style={styles.detailsContainer}>
          {/* Basic Info */}
          <Card variant="default" padding="md" style={styles.infoCard}>
            <Text variant="heading" weight="semibold" style={styles.foodName}>
              {food.name}
            </Text>
            
            <View style={styles.cookInfo}>
              <Text variant="body" color="textSecondary">
                {food.cookName}
              </Text>
              <View style={styles.rating}>
                <Text variant="body" color="textSecondary">
                  ⭐ {food.rating} ({food.reviewCount} değerlendirme)
                </Text>
              </View>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">Mesafe</Text>
                <Text variant="body" weight="medium">{food.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">Hazırlık</Text>
                <Text variant="body" weight="medium">{food.prepTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">Fiyat</Text>
                <Text variant="body" weight="semibold" color="primary">₺{food.price}</Text>
              </View>
            </View>

          </Card>

          {/* Description */}
          <Card variant="default" padding="md" style={styles.descriptionCard}>
            <Text variant="subheading" weight="medium" style={styles.descriptionTitle}>
              Açıklama
            </Text>
            <Text variant="body" style={styles.description}>
              {food.description}
            </Text>
          </Card>

          {/* Seller Reviews */}
          <Card variant="default" padding="md" style={styles.reviewsCard}>
            <Text variant="subheading" weight="medium" style={styles.reviewsTitle}>
              {food.cookName} Hakkında Yorumlar
            </Text>
            
            {/* Overall Rating */}
            <View style={styles.overallRating}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={styles.star}>
                    {star <= Math.floor(food.rating) ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
              <Text variant="body" color="textSecondary" style={styles.ratingText}>
                {food.rating} ({food.reviewCount} değerlendirme)
              </Text>
            </View>

            {/* Sample Reviews */}
            <View style={styles.reviewsList}>
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text variant="body" weight="semibold">Ahmet K.</Text>
                  <View style={styles.reviewStars}>
                    <Text style={styles.smallStar}>⭐⭐⭐⭐⭐</Text>
                  </View>
                </View>
                <Text variant="body" color="textSecondary" style={styles.reviewText}>
                  "Çok lezzetli ve taze. Kesinlikle tavsiye ederim!"
                </Text>
              </View>

              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text variant="body" weight="semibold">Zeynep M.</Text>
                  <View style={styles.reviewStars}>
                    <Text style={styles.smallStar}>⭐⭐⭐⭐☆</Text>
                  </View>
                </View>
                <Text variant="body" color="textSecondary" style={styles.reviewText}>
                  "Güzel bir deneyimdi, tekrar sipariş vereceğim."
                </Text>
              </View>

              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text variant="body" weight="semibold">Can Y.</Text>
                  <View style={styles.reviewStars}>
                    <Text style={styles.smallStar}>⭐⭐⭐⭐⭐</Text>
                  </View>
                </View>
                <Text variant="body" color="textSecondary" style={styles.reviewText}>
                  "Harika bir tat! Ev yemeği tadında."
                </Text>
              </View>
            </View>
          </Card>

          {/* Message Seller */}
          <Card variant="default" padding="md" style={styles.messageCard}>
            <Button
              variant="primary"
              fullWidth
              onPress={handleMessageSeller}
              style={styles.messageButton}
            >
              💬 {food.cookName} ile Mesajlaş
            </Button>
          </Card>
        </View>
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
  scrollContent: {
    paddingBottom: 20, // Only bottom padding for scroll
  },
  imageContainer: {
    height: 300, // Increased height for better display
    width: '100%',
    marginHorizontal: 0, // Ensure no horizontal margins
    paddingHorizontal: 0, // Ensure no horizontal padding
    // Full width container - no spacing on sides
  },
  image: {
    width: '100%',
    height: '100%',
    marginHorizontal: 0, // No horizontal margins
    paddingHorizontal: 0, // No horizontal padding
    // Full screen width coverage
  },
  detailsContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  infoCard: {
    marginBottom: 0,
  },
  foodName: {
    marginBottom: Spacing.sm,
  },
  cookInfo: {
    marginBottom: Spacing.md,
  },
  rating: {
    marginTop: Spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  metaItem: {
    alignItems: 'center',
  },
  descriptionCard: {
    marginBottom: 0,
  },
  descriptionTitle: {
    marginBottom: Spacing.sm,
  },
  description: {
    lineHeight: 22,
  },
  reviewsCard: {
    marginBottom: 0,
  },
  reviewsTitle: {
    marginBottom: Spacing.md,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  star: {
    fontSize: 20,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
  },
  reviewsList: {
    gap: Spacing.md,
  },
  reviewItem: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  smallStar: {
    fontSize: 12,
  },
  reviewText: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  messageCard: {
    marginBottom: 0,
  },
  messageButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
  },
});

