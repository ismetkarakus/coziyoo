import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Modal, Alert, Animated } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const screenWidth = Dimensions.get('window').width;

  // Get food details from URL parameters
  const foodName = params.name as string;
  const cookName = params.cookName as string;
  const foodImageUrl = params.imageUrl as string;
  const paramDeliveryType = params.deliveryType as string || 'Pickup';
  console.log('FoodDetail params:', { foodName, cookName, foodImageUrl, paramDeliveryType, allParams: params });
  
  // Load seller profile data whenever screen comes into focus
  const loadSellerProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('sellerProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        console.log('Loaded seller profile in FoodDetail:', profile);
        setSellerProfile(profile);
      }
    } catch (error) {
      console.error('Error loading seller profile:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSellerProfile();
    }, [])
  );

  // Saat ve dakika değiştiğinde selectedTime'ı güncelle
  useEffect(() => {
    handleTimeChange();
  }, [selectedHour, selectedMinute]);
  
  // Create food object with real seller profile data
  const food = {
    ...getMockFoodDetail(foodName, cookName, foodImageUrl),
    cookName: sellerProfile?.formData?.nickname || sellerProfile?.formData?.name || cookName || 'Satıcı',
    cookAvatar: sellerProfile?.avatarUri || sellerProfile?.formData?.profileImage || getCookAvatar(cookName || 'Ayşe Hanım'),
    cookInfo: {
      description: sellerProfile?.formData?.description || sellerProfile?.formData?.about || 'Ev yemekleri konusunda deneyimim var. Lezzetli yemekler hazırlıyorum.',
      specialties: sellerProfile?.specialties || sellerProfile?.formData?.specialties || ['Ev Yemekleri', 'Türk Mutfağı'],
      joinDate: sellerProfile?.formData?.joinDate || 'Ocak 2023',
      totalOrders: sellerProfile?.formData?.totalOrders || 0,
    }
  };

  const handleBackPress = () => {
    console.log('Back button pressed from FoodDetail');
    console.log('Can go back:', router.canGoBack());
    
    // Force navigation to home for now to ensure it works
    router.push('/(tabs)/home');
  };

  const handleMessageSeller = () => {
    console.log(`Opening chat with ${food.cookName}`);
    router.push(`/(tabs)/chat-detail?foodName=${encodeURIComponent(food.name)}&orderStatus=Aktif&sellerId=${food.id}&sellerName=${encodeURIComponent(food.cookName)}`);
  };

  const handleOrderPress = () => {
    setShowOrderModal(true);
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) { // 2 hafta ileriye kadar
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateString = date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
      const shortDate = date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short'
      });
      
      dates.push({
        value: dateString,
        dayName: dayName,
        shortDate: shortDate,
        fullDate: dateString,
        label: i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : dayName,
        date: date
      });
    }
    
    return dates;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0);
    // Ayın ilk gününün haftanın hangi günü olduğu (0=Pazar, 1=Pazartesi, ...)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Pazartesi'yi 0 yapmak için
    
    const days = [];
    const today = new Date();
    
    // Önceki ayın son günlerini ekle (boş alanlar için)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        day: prevDate.getDate(),
        isCurrentMonth: false,
        isSelectable: false,
        dateString: prevDate.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      });
    }
    
    // Bu ayın günlerini ekle
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const dateString = date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      days.push({
        date: date,
        day: day,
        isCurrentMonth: true,
        isSelectable: !isPast,
        isToday: isToday,
        dateString: dateString
      });
    }
    
    // Sonraki ayın ilk günlerini ekle (6x7 grid tamamlamak için)
    const remainingDays = 42 - days.length; // 6 hafta x 7 gün
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        day: day,
        isCurrentMonth: false,
        isSelectable: false,
        dateString: nextDate.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      });
    }
    
    return days;
  };


  const generateHours = () => {
    return Array.from({ length: 14 }, (_, i) => i + 9);
  };

  const generateMinutes = () => {
    return [0, 15, 30, 45];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (dayData: any) => {
    if (dayData.isSelectable) {
      setSelectedDate(dayData.dateString);
    }
  };

  const handleTimeChange = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    setSelectedTime(timeString);
  };


  const getClockPosition = (value: number, max: number, radius: number) => {
    const angle = (value * 360 / max) - 90; // -90 to start from top
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const handleClockTouch = (event: any, type: 'hour' | 'minute') => {
    const { locationX, locationY } = event.nativeEvent;
    const centerX = 100; // Clock radius
    const centerY = 100;
    
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    
    if (type === 'hour') {
      const hour = Math.round(angle / 30) % 12; // 12 hours, 30 degrees each
      const adjustedHour = hour === 0 ? 12 : hour;
      const finalHour = adjustedHour + (selectedHour >= 12 ? 12 : 0);
      if (finalHour >= 9 && finalHour <= 22) {
        setSelectedHour(finalHour);
      }
    } else {
      const minute = Math.round(angle / 6) % 60; // 60 minutes, 6 degrees each
      const roundedMinute = Math.round(minute / 15) * 15; // Round to 15 minute intervals
      setSelectedMinute(roundedMinute === 60 ? 0 : roundedMinute);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedDate) {
      Alert.alert('Hata', 'Lütfen bir tarih seçin.');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Hata', 'Lütfen bir saat seçin.');
      return;
    }

    try {
      const orderData = {
        id: Date.now().toString(),
        foodId: food.id,
        foodName: food.name,
        cookName: food.cookName,
        cookId: sellerProfile?.formData?.id || 'seller1',
        quantity: quantity,
        price: food.price,
        totalPrice: food.price * quantity,
        deliveryType: deliveryType,
        requestedDate: selectedDate,
        requestedTime: selectedTime,
        status: 'pending_seller_approval', // Satıcı onayı bekliyor
        createdAt: new Date().toISOString(),
        buyerId: 'buyer1', // Gerçek uygulamada kullanıcı ID'si
        buyerName: 'Ahmet Yılmaz', // Gerçek uygulamada kullanıcı adı
      };

      // Siparişi AsyncStorage'a kaydet
      const existingOrders = await AsyncStorage.getItem('orders');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.push(orderData);
      await AsyncStorage.setItem('orders', JSON.stringify(orders));

      setShowOrderModal(false);
      Alert.alert(
        'Sipariş Gönderildi',
        `${food.cookName} adlı satıcıya ${selectedDate} ${selectedTime} tarihli sipariş talebiniz gönderildi. Onay bekliyor.`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setSelectedDate('');
              setSelectedTime('');
              setSelectedHour(12);
              setSelectedMinute(0);
              setQuantity(1);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting order:', error);
      Alert.alert('Hata', 'Sipariş gönderilirken bir hata oluştu.');
    }
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
                  <View style={styles.cookNameRow}>
                    <Text variant="body" color="textSecondary">
                      {food.cookName}
                    </Text>
                    <TouchableOpacity
                      style={styles.inlineViewAllButton}
                      onPress={async () => {
                        console.log('Filtering by cook:', food.cookName);
                        // Store filter in AsyncStorage
                        await AsyncStorage.setItem('cookFilter', food.cookName);
                        // Navigate to home
                        router.push('/(tabs)/home');
                      }}
                    >
                      <Text variant="body" style={{ color: colors.primary }}>
                        🍴 hepsini gör
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                      <View key={index} style={styles.cookSpecialtyPlainItem}>
                        <FontAwesome name="check-circle" size={14} color={colors.primary} />
                        <Text style={[styles.cookSpecialtyPlainText, { color: colors.text }]}>
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

      {/* Fixed Bottom Buttons */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleMessageSeller}
          style={[styles.bottomButton, styles.messageButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text variant="body" weight="semibold" style={[styles.bottomButtonText, { color: colors.primary }]}>
            💬 Mesajlaş
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleOrderPress}
          style={[styles.bottomButton, styles.orderButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text variant="body" weight="semibold" style={styles.bottomButtonText}>
            🛒 Sipariş Ver
          </Text>
        </TouchableOpacity>
      </View>

      {/* Order Modal */}
      <Modal
        visible={showOrderModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text variant="heading" weight="semibold">
              Sipariş Ver
            </Text>
            <TouchableOpacity
              onPress={() => setShowOrderModal(false)}
              style={styles.closeButton}
            >
              <FontAwesome name="times" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Food Info */}
            <View style={[styles.foodInfoCard, { backgroundColor: colors.surface }]}>
              <Image source={{ uri: food.imageUrl }} style={styles.modalFoodImage} />
              <View style={styles.modalFoodInfo}>
                <Text variant="subheading" weight="semibold" numberOfLines={2}>
                  {food.name}
                </Text>
                <Text variant="body" color="textSecondary">
                  {food.cookName}
                </Text>
                <Text variant="subheading" weight="semibold" color="primary">
                  ₺{food.price}
                </Text>
              </View>
            </View>

            {/* Date and Time Selection Row */}
            <View style={styles.dateTimeRow}>
              {/* Date Counter */}
              <View style={[styles.counterContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.counterHeader}>
                  <FontAwesome name="calendar" size={18} color={colors.primary} />
                  <Text variant="caption" color="textSecondary">
                    {selectedDate ? new Date(selectedDate).toLocaleDateString('tr-TR', {
                      month: 'long'
                    }) : new Date().toLocaleDateString('tr-TR', {
                      month: 'long'
                    })}
                  </Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      const currentDate = selectedDate ? new Date(selectedDate) : new Date();
                      currentDate.setDate(currentDate.getDate() - 1);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (currentDate >= today) {
                        setSelectedDate(currentDate.toISOString().split('T')[0]);
                      }
                    }}
                  >
                    <FontAwesome name="minus" size={14} color="white" />
                  </TouchableOpacity>
                  
                  <View style={styles.counterValue}>
                    <Text variant="body" weight="bold" style={{ color: colors.text, textAlign: 'center' }}>
                      {selectedDate ? (() => {
                        const date = new Date(selectedDate);
                        const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
                        const dayShort = dayName.substring(0, 3);
                        const dayNumber = date.getDate();
                        return `${dayNumber} ${dayShort}`;
                      })() : (() => {
                        const date = new Date();
                        const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
                        const dayShort = dayName.substring(0, 3);
                        const dayNumber = date.getDate();
                        return `${dayNumber} ${dayShort}`;
                      })()}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      const currentDate = selectedDate ? new Date(selectedDate) : new Date();
                      currentDate.setDate(currentDate.getDate() + 1);
                      setSelectedDate(currentDate.toISOString().split('T')[0]);
                    }}
                  >
                    <FontAwesome name="plus" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Time Counter */}
              <View style={[styles.counterContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.counterHeader}>
                  <FontAwesome name="clock-o" size={18} color={colors.primary} />
                  <Text variant="caption" color="textSecondary">Saat</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (selectedHour > 9) {
                        setSelectedHour(selectedHour - 1);
                        const timeString = `${(selectedHour - 1).toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
                        setSelectedTime(timeString);
                      }
                    }}
                  >
                    <FontAwesome name="minus" size={14} color="white" />
                  </TouchableOpacity>
                  
                  <View style={styles.counterValue}>
                    <Text variant="body" weight="bold" style={{ color: colors.text, textAlign: 'center' }}>
                      {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      if (selectedHour < 22) {
                        setSelectedHour(selectedHour + 1);
                        const timeString = `${(selectedHour + 1).toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
                        setSelectedTime(timeString);
                      }
                    }}
                  >
                    <FontAwesome name="plus" size={14} color="white" />
                  </TouchableOpacity>
                </View>
                
                {/* Minute Counter */}
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.textSecondary }]}
                    onPress={() => {
                      const minutes = [0, 15, 30, 45];
                      const currentIndex = minutes.indexOf(selectedMinute);
                      const newIndex = currentIndex > 0 ? currentIndex - 1 : minutes.length - 1;
                      setSelectedMinute(minutes[newIndex]);
                      const timeString = `${selectedHour.toString().padStart(2, '0')}:${minutes[newIndex].toString().padStart(2, '0')}`;
                      setSelectedTime(timeString);
                    }}
                  >
                    <FontAwesome name="chevron-left" size={12} color="white" />
                  </TouchableOpacity>
                  
                  <View style={styles.minuteValue}>
                    <Text variant="caption" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                      :{selectedMinute.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.textSecondary }]}
                    onPress={() => {
                      const minutes = [0, 15, 30, 45];
                      const currentIndex = minutes.indexOf(selectedMinute);
                      const newIndex = currentIndex < minutes.length - 1 ? currentIndex + 1 : 0;
                      setSelectedMinute(minutes[newIndex]);
                      const timeString = `${selectedHour.toString().padStart(2, '0')}:${minutes[newIndex].toString().padStart(2, '0')}`;
                      setSelectedTime(timeString);
                    }}
                  >
                    <FontAwesome name="chevron-right" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>


            {/* Quantity Selection */}
            <View style={styles.sectionContainer}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                Adet
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: colors.surface }]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <FontAwesome name="minus" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text variant="subheading" weight="semibold" style={styles.quantityText}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: colors.surface }]}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <FontAwesome name="plus" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Delivery Type */}
            <View style={styles.sectionContainer}>
              <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                Teslimat Türü
              </Text>
              <View style={styles.deliveryContainer}>
                <TouchableOpacity
                  style={[
                    styles.deliveryButton,
                    {
                      backgroundColor: deliveryType === 'pickup' ? colors.primary : colors.surface,
                      borderColor: deliveryType === 'pickup' ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setDeliveryType('pickup')}
                >
                  <Text
                    variant="body"
                    weight="medium"
                    style={{
                      color: deliveryType === 'pickup' ? 'white' : colors.text,
                    }}
                  >
                    🏪 Gel Al
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deliveryButton,
                    {
                      backgroundColor: deliveryType === 'delivery' ? colors.primary : colors.surface,
                      borderColor: deliveryType === 'delivery' ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => setDeliveryType('delivery')}
                >
                  <Text
                    variant="body"
                    weight="medium"
                    style={{
                      color: deliveryType === 'delivery' ? 'white' : colors.text,
                    }}
                  >
                    🚗 Teslimat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Price */}
            <View style={[styles.totalContainer, { backgroundColor: colors.surface }]}>
              <Text variant="subheading" weight="semibold">
                Toplam Tutar
              </Text>
              <Text variant="heading" weight="bold" color="primary">
                ₺{(food.price * quantity).toFixed(2)}
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmitOrder}
            >
              <Text variant="body" weight="semibold" style={styles.submitButtonText}>
                Sipariş Talebini Gönder
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

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
    justifyContent: 'flex-start',
  },
  cookSpecialtyPlainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    width: '31%', // 3 sütun için
    minWidth: '31%',
  },
  cookSpecialtyPlainText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    flexShrink: 0,
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
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    gap: Spacing.sm,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  messageButton: {
    borderWidth: 2,
  },
  orderButton: {
    // Primary button styles already applied
  },
  bottomButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  foodInfoCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  modalFoodImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  modalFoodInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  // Date Time Row Styles
  dateTimeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dateTimeButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateTimeButtonText: {
    flex: 1,
  },
  counterContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
  },
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  minuteValue: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  cookNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  inlineViewAllButton: {
    paddingHorizontal: Spacing.xs / 2,
    paddingVertical: 2,
  },
  // Date Picker Modal Styles
  datePickerContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  // Calendar Styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  monthNavButton: {
    padding: Spacing.sm,
    borderRadius: 8,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  dayHeaderText: {
    width: 40,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  // Time Picker Styles
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  timePickerSection: {
    flex: 1,
  },
  timePickerLabel: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  timePickerScroll: {
    maxHeight: 150,
  },
  timePickerOptions: {
    gap: Spacing.xs,
  },
  timePickerOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  separatorText: {
    fontSize: 24,
    color: Colors.light.primary,
  },
  selectedTimeDisplay: {
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  // Time Picker Modal Styles
  timePickerContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  clockSection: {
    marginBottom: Spacing.xl,
  },
  clockTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockFace: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockNumber: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    position: 'absolute',
    width: 4,
    height: 60,
    borderRadius: 2,
    top: 100 - 30, // Center minus half hand length
    left: 100 - 2, // Center minus half width
  },
  confirmTimeButton: {
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  confirmTimeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
  },
  deliveryContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  deliveryButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  submitButton: {
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  submitButtonText: {
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

