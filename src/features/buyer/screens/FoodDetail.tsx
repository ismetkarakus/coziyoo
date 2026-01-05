import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock review data
const MOCK_REVIEWS = [
  {
    id: '1',
    userName: 'Ahmet K.',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    comment: 'Çok lezzetli ve taze. Kesinlikle tavsiye ederim!',
    date: '2 gün önce',
  },
  {
    id: '2',
    userName: 'Zeynep M.',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
    rating: 4,
    comment: 'Güzel bir deneyimdi, tekrar sipariş vereceğim.',
    date: '1 hafta önce',
  },
  {
    id: '3',
    userName: 'Can Y.',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    rating: 5,
    comment: 'Harika bir tat! Ev yemeği tadında.',
    date: '2 hafta önce',
  },
];

// Mock cook avatars based on cook name
const getCookAvatar = (cookName: string) => {
  const cookAvatars: { [key: string]: string } = {
    'Ayşe Hanım': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
    'Mehmet Usta': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
    'Fatma Teyze': 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
    'Ali Usta': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
    'Zeynep Hanım': 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=60&h=60&fit=crop&crop=face',
  };
  return cookAvatars[cookName] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face';
};

// Mock cook data - in real app, this would come from API
const getMockCookInfo = (cookName: string) => {
  const cookData: { [key: string]: any } = {
    'Ayşe Hanım': {
      description: 'Ev yemekleri konusunda 15 yıllık deneyimim var. Geleneksel Türk mutfağının lezzetlerini sizlerle paylaşmaktan mutluluk duyuyorum.',
      specialties: ['Türk Mutfağı', 'Ev Yemekleri', 'Hamur İşleri', 'Çorbalar'],
      joinDate: 'Ocak 2023',
      totalOrders: 156,
    },
    'Mehmet Usta': {
      description: 'Profesyonel aşçı olarak 20 yıllık deneyimim var. Özellikle et yemekleri ve kebap çeşitlerinde uzmanım.',
      specialties: ['Et Yemekleri', 'Kebap', 'Izgara', 'Türk Mutfağı'],
      joinDate: 'Mart 2022',
      totalOrders: 203,
    },
    'Fatma Teyze': {
      description: 'Geleneksel ev yemeklerini modern dokunuşlarla hazırlıyorum. Özellikle hamur işleri ve tatlılarım çok sevilir.',
      specialties: ['Hamur İşleri', 'Tatlılar', 'Börek', 'Ev Yemekleri'],
      joinDate: 'Haziran 2023',
      totalOrders: 89,
    },
  };
  return cookData[cookName] || cookData['Ayşe Hanım'];
};

// Mock data - in real app, this would come from API
const getMockFoodDetail = (name: string, cookName: string, imageUrl: string) => ({
  id: '1',
  name: name || 'Ev Yapımı Mantı',
  cookName: cookName || 'Ayşe Hanım',
  cookAvatar: getCookAvatar(cookName || 'Ayşe Hanım'),
  cookInfo: getMockCookInfo(cookName || 'Ayşe Hanım'),
  rating: 4.8,
  reviewCount: 24,
  price: 25,
  distance: '1.2 km',
  prepTime: '30 dk',
  availableDates: '15-20 Ocak',
  currentStock: 8,
  dailyStock: 10,
  description: 'Geleneksel yöntemlerle hazırlanan, ince açılmış hamur ile sarılmış, özel baharatlarla tatlandırılmış ev yapımı mantı. Yanında yoğurt ve tereyağlı sos ile servis edilir.',
  hasPickup: true,
  hasDelivery: true,
  imageUrl: imageUrl,
  images: [
    imageUrl || 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
  ],
});

export const FoodDetail: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  // Get food details from URL parameters
  const foodName = params.name as string;
  const cookName = params.cookName as string;
  const foodImageUrl = params.imageUrl as string;
  const deliveryType = params.deliveryType as string || 'Pickup';
  console.log('FoodDetail params:', { foodName, cookName, foodImageUrl, deliveryType, allParams: params });
  const food = getMockFoodDetail(foodName, cookName, foodImageUrl);

  const handleBackPress = () => {
    console.log('Back button pressed from FoodDetail');
    router.back();
  };

  const handleMessageSeller = () => {
    console.log(`Opening chat with ${food.cookName}`);
    router.push(`/(tabs)/chat-detail?sellerId=${food.id}&sellerName=${encodeURIComponent(food.cookName)}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={food.name}
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
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Food Images Slider */}
        <View style={styles.imageSliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
            style={styles.imageSlider}
          >
            {food.images.map((imageUrl, index) => (
              <View key={index} style={[styles.imageContainer, { width: screenWidth, backgroundColor: colors.surface }]}>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {food.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: currentImageIndex === index ? colors.primary : 'rgba(255, 255, 255, 0.5)',
                  }
                ]}
              />
            ))}
          </View>

          {/* Image Counter */}
          <View style={styles.imageCounter}>
            <Text variant="caption" style={styles.imageCounterText}>
              {currentImageIndex + 1}/{food.images.length}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {/* Basic Info */}
          <Card variant="default" padding="md" style={styles.infoCard}>
            <View style={styles.foodNameContainer}>
              <Text variant="heading" weight="semibold" style={styles.foodName}>
                {food.name}
              </Text>
              <Text variant="heading" weight="semibold" color="primary" style={styles.priceText}>
                ₺{food.price}
              </Text>
            </View>
            
            <View style={styles.cookInfo}>
              <View style={styles.cookProfile}>
                <Image 
                  source={{ uri: food.cookAvatar }}
                  style={styles.cookAvatar}
                  defaultSource={{ uri: 'https://via.placeholder.com/50x50/7FAF9A/FFFFFF?text=C' }}
                />
                <View style={styles.cookDetails}>
                  <Text variant="body" color="textSecondary">
                    {food.cookName}
                  </Text>
                  <View style={styles.rating}>
                    <Text variant="body" color="textSecondary">
                      ⭐ {food.rating} ({food.reviewCount} değerlendirme)
                    </Text>
                  </View>
                </View>
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
                <Text variant="body" weight="medium" color="primary">{deliveryType}</Text>
              </View>
            </View>

            {/* Availability Info */}
            <View style={styles.availabilitySection}>
              <View style={styles.availabilityItem}>
                <Text variant="caption" color="textSecondary">Satış Tarihleri</Text>
                <Text variant="body" weight="medium" color="primary">📅 {food.availableDates}</Text>
              </View>
              <View style={styles.availabilityItem}>
                <Text variant="caption" color="textSecondary">Stok Durumu</Text>
                <Text variant="body" weight="medium" color={food.currentStock > 0 ? "primary" : "error"}>
                  📦 {food.currentStock}/{food.dailyStock} kalan
                </Text>
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

          {/* Cook About Section */}
          <Card variant="default" padding="md" style={styles.cookAboutCard}>
            <Text variant="subheading" weight="medium" style={styles.cookAboutTitle}>
              {food.cookName} Hakkında
            </Text>
            
            <View style={styles.cookAboutContent}>
              <Text variant="body" style={styles.cookDescription}>
                {food.cookInfo.description}
              </Text>
              
              {/* Cook Stats */}
              <View style={styles.cookStats}>
                <View style={styles.cookStatItem}>
                  <Text variant="body" weight="semibold" color="primary">
                    {food.cookInfo.totalOrders}
                  </Text>
                  <Text variant="caption" color="textSecondary">Toplam Sipariş</Text>
                </View>
                <View style={styles.cookStatItem}>
                  <Text variant="body" weight="semibold" color="primary">
                    ⭐ {food.rating}
                  </Text>
                  <Text variant="caption" color="textSecondary">Ortalama Puan</Text>
                </View>
                <View style={styles.cookStatItem}>
                  <Text variant="body" weight="semibold" color="primary">
                    {food.cookInfo.joinDate}
                  </Text>
                  <Text variant="caption" color="textSecondary">Üyelik Tarihi</Text>
                </View>
              </View>

              {/* Specialties */}
              {food.cookInfo.specialties && food.cookInfo.specialties.length > 0 && (
                <View style={styles.cookSpecialtiesSection}>
                  <Text variant="body" weight="medium" style={styles.cookSpecialtiesTitle}>
                    Uzmanlık Alanları
                  </Text>
                  <View style={styles.cookSpecialtiesGrid}>
                    {food.cookInfo.specialties.map((specialty: string, index: number) => (
                      <View key={index} style={[styles.cookSpecialtyGridItem, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                        <FontAwesome name="check-circle" size={14} color={colors.primary} />
                        <Text variant="caption" style={[styles.cookSpecialtyGridText, { color: colors.primary }]} numberOfLines={1}>
                          {specialty}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
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
              {MOCK_REVIEWS.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserInfo}>
                      <Image 
                        source={{ uri: review.userAvatar }}
                        style={styles.reviewAvatar}
                        defaultSource={{ uri: 'https://via.placeholder.com/40x40/7FAF9A/FFFFFF?text=U' }}
                      />
                      <View style={styles.reviewUserDetails}>
                        <Text variant="body" weight="semibold">{review.userName}</Text>
                        <Text variant="caption" color="textSecondary">{review.date}</Text>
                      </View>
                    </View>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text key={star} style={styles.starIcon}>
                          {star <= review.rating ? '⭐' : '☆'}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <Text variant="body" color="textSecondary" style={styles.reviewText}>
                    "{review.comment}"
                  </Text>
                </View>
              ))}
            </View>
          </Card>

        </View>
      </ScrollView>

      {/* Fixed Bottom Message Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleMessageSeller}
          style={[styles.bottomMessageButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text variant="body" weight="semibold" style={styles.bottomMessageButtonText}>
            💬 {food.cookName} ile Mesajlaş
          </Text>
        </TouchableOpacity>
      </View>
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
  imageSliderContainer: {
    height: 300,
    position: 'relative',
  },
  imageSlider: {
    height: 300,
  },
  imageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  infoCard: {
    marginBottom: 0,
  },
  foodNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  foodName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  priceText: {
    fontSize: 20, // Slightly larger for price emphasis
    fontWeight: 'bold',
  },
  cookInfo: {
    marginBottom: Spacing.md,
  },
  cookProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  cookDetails: {
    flex: 1,
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
  availabilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  availabilityItem: {
    alignItems: 'center',
    flex: 1,
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
  // Cook About Section Styles
  cookAboutCard: {
    marginBottom: 0,
  },
  cookAboutTitle: {
    marginBottom: Spacing.md,
  },
  cookAboutContent: {
    gap: Spacing.md,
  },
  cookDescription: {
    lineHeight: 22,
  },
  cookStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  cookStatItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cookSpecialtiesSection: {
    gap: Spacing.sm,
  },
  cookSpecialtiesTitle: {
    marginBottom: Spacing.sm,
  },
  cookSpecialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cookSpecialtyGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.xs,
    maxWidth: '48%', // İki sütun için
  },
  cookSpecialtyGridText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
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
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  reviewUserDetails: {
    flex: 1,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 1,
  },
  smallStar: {
    fontSize: 12,
  },
  reviewText: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomMessageButton: {
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bottomMessageButtonText: {
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

