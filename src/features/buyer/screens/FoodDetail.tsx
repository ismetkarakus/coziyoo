import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Modal, Alert, Animated, Platform } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card, WebSafeIcon, StarRating, ReviewCard, RatingStats, ReviewModal, PaymentModal } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { foodService, Food } from '../../../services/foodService';
import { chatService } from '../../../services/chatService';
import { reviewService, Review, ReviewStats } from '../../../services/reviewService';
import { paymentService, PaymentRequest } from '../../../services/paymentService';

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
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { sendOrderNotification } = useNotifications();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('Ocak 2024');
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [firebaseFood, setFirebaseFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const screenWidth = Dimensions.get('window').width;

  // Get food details from URL parameters
  const foodId = params.id as string;
  const foodName = params.name as string;
  const cookName = params.cookName as string;
  const foodImageUrl = params.imageUrl as string;
  const paramDeliveryType = params.deliveryType as string || 'Pickup';
  console.log('FoodDetail params:', { foodId, foodName, cookName, foodImageUrl, paramDeliveryType, allParams: params });

  // Load Firebase food data
  useEffect(() => {
    loadFoodData();
  }, [foodId]);

  const loadFoodData = async () => {
    console.log('🚀 Hızlı yükleme modu - Mock data kullanılıyor');
    setLoading(false);
    return;
    
    // Firebase yavaş olduğu için geçici olarak kapatıldı
    /*
    if (!foodId) {
      console.log('No foodId provided, using mock data');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const food = await foodService.getFoodById(foodId);
      if (food) {
        setFirebaseFood(food);
        console.log('Firebase food loaded:', food);
      } else {
        console.log('Food not found in Firebase, using mock data');
      }
    } catch (error) {
      console.error('Error loading food from Firebase:', error);
    } finally {
      setLoading(false);
    }
    */
  };
  
  // Load seller profile data whenever screen comes into focus
  const loadSellerProfile = async () => {
    console.log('🚀 Hızlı yükleme - Mock seller profile kullanılıyor');
    setSellerProfile({
      name: cookName || 'Ayşe Hanım',
      avatar: getCookAvatar(cookName || 'Ayşe Hanım'),
      rating: 4.8,
      totalOrders: 245,
      responseTime: '~15 dk'
    });
    try {
      // İsocan verilerini temizle
      await AsyncStorage.removeItem('sellerProfile');
      console.log('🧹 Seller profile cleared (İsocan data removed)');
      setSellerProfile(null);
    } catch (error) {
      console.error('Error clearing seller profile:', error);
    }
  };

  // Load reviews and stats
  const loadReviews = async () => {
    console.log('🚀 Hızlı yükleme - Mock reviews kullanılıyor');
    setReviews(MOCK_REVIEWS as any);
    setReviewStats({
      averageRating: 4.7,
      totalReviews: 156,
      ratingDistribution: { 5: 89, 4: 45, 3: 15, 2: 5, 1: 2 }
    });
    setHasUserReviewed(false);
    return;
    
    // Firebase yavaş olduğu için geçici olarak kapatıldı
    /*
    if (!food.id) return;
    
    try {
      const [reviewsData, statsData, hasReviewed] = await Promise.all([
        reviewService.getFoodReviews(food.id, 10),
        reviewService.getReviewStats(food.id),
        user ? reviewService.hasUserReviewedFood(user.uid, food.id) : Promise.resolve(false)
      ]);
      
      setReviews(reviewsData);
      setReviewStats(statsData);
      setHasUserReviewed(hasReviewed);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
    */
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSellerProfile();
      loadReviews();
    }, [params.id, user])
  );

  // Saat ve dakika değiştiğinde selectedTime'ı güncelle
  useEffect(() => {
    handleTimeChange();
  }, [selectedHour, selectedMinute]);
  
  // Create food object with simple mock data for fast loading
  const food = {
    id: '1',
    name: foodName || 'Ev Yapımı Mantı',
    cookName: cookName || 'Ayşe Hanım',
    cookAvatar: getCookAvatar(cookName || 'Ayşe Hanım'),
    rating: 4.8,
    reviewCount: 24,
    price: 25,
    distance: '1.2 km',
    prepTime: '30 dk',
    availableDates: '15-20 Ocak',
    currentStock: 8,
    dailyStock: 10,
    description: 'Geleneksel yöntemlerle hazırlanan, ince açılmış hamur ile sarılmış, özel baharatlarla tatlandırılmış ev yapımı mantı. Yanında yoğurt ve tereyağlı sos ile servis edilir.',
    recipe: '1. Hamur malzemelerini yoğurun ve ince açın.\n2. İç harcı hazırlayıp hamura yerleştirin ve kapatın.\n3. Haşlayıp sos ile servis edin.',
    hasPickup: true,
    hasDelivery: true,
    imageUrl: foodImageUrl || 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
    images: [
      foodImageUrl || 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
    ],
    ingredients: ['Hamur', 'Kıyma', 'Soğan', 'Baharat', 'Yoğurt', 'Tereyağı'],
    preparationTime: 30,
    servingSize: '2-3 kişilik',
    category: 'Ana Yemek',
    cookInfo: {
      description: 'Ev yemekleri konusunda 15 yıllık deneyimim var. Geleneksel Türk mutfağının lezzetlerini sizlerle paylaşmaktan mutluluk duyuyorum.',
      specialties: ['Türk Mutfağı', 'Ev Yemekleri', 'Hamur İşleri', 'Çorbalar'],
      joinDate: 'Ocak 2023',
      totalOrders: 156,
    }
  };

  const handleBackPress = () => {
    console.log('Back button pressed from FoodDetail');
    
    try {
      // Always go to home - safer since FoodDetail is now in main stack
      console.log('Going to home page...');
      router.push('/(tabs)');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home
      router.replace('/(tabs)');
    }
  };

  const handleMessageSeller = async () => {
    if (!user || !firebaseFood) {
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.loginToMessage'));
      return;
    }

    try {
      // Create or get existing chat
      const chatId = await chatService.getOrCreateChat(
        user.uid,
        user.displayName || user.email || 'Alıcı',
        firebaseFood.cookId,
        firebaseFood.cookName,
        undefined, // no specific order
        firebaseFood.id,
        firebaseFood.name
      );

      // Navigate to chat
      router.push(`/chat?id=${chatId}&name=${encodeURIComponent(firebaseFood.cookName)}&type=buyer`);
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.chatFailed'));
    }
  };

  const handleOrderPress = () => {
    setShowOrderModal(true);
  };

  const generateAvailableDates = () => {
    // Basit mock tarihler - performans için
    return [
      { value: '15.01.2024', dayName: 'Pazartesi', shortDate: '15 Oca', fullDate: '15.01.2024', label: 'Bugün', date: '2024-01-15' },
      { value: '16.01.2024', dayName: 'Salı', shortDate: '16 Oca', fullDate: '16.01.2024', label: 'Yarın', date: '2024-01-16' },
      { value: '17.01.2024', dayName: 'Çarşamba', shortDate: '17 Oca', fullDate: '17.01.2024', label: 'Çarşamba', date: '2024-01-17' },
    ];
  };

  const generateCalendarDays = () => {
    // Basit mock takvim - performans için
    return [
      { date: '2024-01-15', day: 15, isCurrentMonth: true, isSelectable: true, isToday: true, dateString: '15.01.2024' },
      { date: '2024-01-16', day: 16, isCurrentMonth: true, isSelectable: true, isToday: false, dateString: '16.01.2024' },
      { date: '2024-01-17', day: 17, isCurrentMonth: true, isSelectable: true, isToday: false, dateString: '17.01.2024' },
    ];
    
    /*
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    */
  };


  const generateHours = () => {
    return Array.from({ length: 14 }, (_, i) => i + 9);
  };

  const generateMinutes = () => {
    return [0, 15, 30, 45];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    // Basit ay değiştirme - performans için
    console.log(`${direction} ay seçildi`);
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
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.selectDate'));
      return;
    }

    if (!selectedTime) {
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.selectTime'));
      return;
    }

    if (!user) {
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.loginToOrder'));
      return;
    }

    try {
      // Önce stok kontrolü yap
      if (firebaseFood?.id) {
        const stockDecreased = await foodService.decreaseStock(firebaseFood.id, quantity);
        if (!stockDecreased) {
          Alert.alert(t('foodDetailScreen.alerts.stockTitle'), t('foodDetailScreen.alerts.stockMessage'));
          return;
        }
      }

      // Firebase'e sipariş oluştur
      const orderId = await foodService.createOrder({
        foodId: food.id || 'mock_food_id',
        buyerId: user.uid,
        sellerId: firebaseFood?.cookId || 'mock_seller_id',
        quantity: quantity,
        totalPrice: food.price * quantity,
        status: 'pending',
        deliveryAddress: deliveryType === 'delivery' ? 'Kullanıcı adresi' : 'Gel al',
      });

      // AsyncStorage'a da kaydet (backward compatibility için)
      const orderData = {
        id: orderId,
        foodId: food.id,
        foodName: food.name,
        cookName: food.cookName,
        cookId: firebaseFood?.cookId || 'seller1',
        quantity: quantity,
        price: food.price,
        totalPrice: food.price * quantity,
        deliveryType: deliveryType,
        requestedDate: selectedDate,
        requestedTime: selectedTime,
        status: 'pending',
        createdAt: '2024-01-15T12:00:00Z',
        buyerId: user.uid,
        buyerName: user.displayName || 'Kullanıcı',
      };

      const existingOrders = await AsyncStorage.getItem('orders');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.push(orderData);
      await AsyncStorage.setItem('orders', JSON.stringify(orders));

      // Send notification to seller about new order
      await sendOrderNotification(orderId, 'pending_seller_approval', user.displayName || 'Müşteri', food.name);

      // Create chat for this order
      try {
        const chatId = await chatService.getOrCreateChat(
          user.uid,
          user.displayName || user.email || 'Alıcı',
          firebaseFood?.cookId || 'seller_id',
          food.cookName,
          orderId,
          firebaseFood?.id || food.id,
          food.name
        );

        // Send initial order message to chat
        await chatService.sendOrderUpdateMessage(
          chatId,
          orderId,
          'pending',
          food.name,
          user.uid,
          user.displayName || user.email || 'Alıcı',
          'buyer'
        );
      } catch (error) {
        console.error('Error creating chat for order:', error);
        // Don't fail the order if chat creation fails
      }

      // Prepare payment request
      const totalAmount = food.price * quantity;
      const paymentReq: PaymentRequest = {
        amount: totalAmount,
        currency: 'TRY',
        orderId: orderId,
        description: `${food.name} - ${food.cookName}`,
        paymentMethodId: '', // Will be selected in payment modal
        customerInfo: {
          name: user.displayName || user.email || 'Kullanıcı',
          email: user.email || '',
          phone: user.phoneNumber || undefined,
        },
      };

      setPaymentRequest(paymentReq);
      setShowOrderModal(false);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.orderError'));
    }
  };

  // Review handlers
  const handleSubmitReview = async (rating: number, comment: string, images: string[]) => {
    if (!user || !food.id) {
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.loginToReview'));
      return;
    }

    try {
      setReviewLoading(true);
      
      await reviewService.addReview({
        foodId: food.id,
        foodName: food.name,
        buyerId: user.uid,
        buyerName: user.displayName || user.email || 'Kullanıcı',
        buyerAvatar: user.photoURL || undefined,
        sellerId: firebaseFood?.cookId || 'seller_id',
        sellerName: food.cookName,
        rating,
        comment,
        images,
        isVerifiedPurchase: true, // Gerçek uygulamada sipariş geçmişinden kontrol edilecek
      });

      setShowReviewModal(false);
      Alert.alert(t('foodDetailScreen.alerts.reviewSuccessTitle'), t('foodDetailScreen.alerts.reviewSuccessMessage'));
      
      // Refresh reviews
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.reviewError'));
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewHelpful = async (reviewId: string) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      // Refresh reviews to show updated helpful count
      loadReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
      Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.actionFailed'));
    }
  };

  const handleReviewReport = async (reviewId: string) => {
    Alert.alert(
      t('foodDetailScreen.alerts.reportTitle'),
      t('foodDetailScreen.alerts.reportQuestion'),
      [
        { text: t('foodDetailScreen.alerts.cancel'), style: 'cancel' },
        {
          text: t('foodDetailScreen.alerts.report'),
          style: 'destructive',
          onPress: async () => {
            try {
              await reviewService.reportReview(reviewId);
              Alert.alert(t('foodDetailScreen.alerts.thanksTitle'), t('foodDetailScreen.alerts.thanksMessage'));
            } catch (error) {
              console.error('Error reporting review:', error);
              Alert.alert(t('foodDetailScreen.alerts.errorTitle'), t('foodDetailScreen.alerts.reportFailed'));
            }
          }
        }
      ]
    );
  };

  // Payment handlers
  const handlePaymentSuccess = (transactionId: string) => {
    Alert.alert(
      t('foodDetailScreen.alerts.orderCompleteTitle'),
      t('foodDetailScreen.alerts.paymentSuccessMessage', { orderId: paymentRequest?.orderId ?? '', transactionId }),
      [
        {
          text: t('foodDetailScreen.alerts.ok'),
          onPress: () => {
            // Reset form
            setSelectedDate('2024-01-15');
            setSelectedTime('12:00');
            setSelectedHour(12);
            setSelectedMinute(0);
            setQuantity(1);
            setPaymentRequest(null);
            
            // Navigate to orders or home
            router.push('/(tabs)/orders');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar 
          title={t('foodDetailScreen.loadingTitle')}
          leftComponent={
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textSecondary">
            {t('foodDetailScreen.loadingText')}
          </Text>
        </View>
      </View>
    );
  }

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
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
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
                        try {
                          // Store filter in AsyncStorage
                          await AsyncStorage.setItem('cookFilter', food.cookName);
                          console.log('Cook filter saved to AsyncStorage');
                          
                          // Navigate directly to home with filter
                          router.push('/(tabs)');
                        } catch (error) {
                          console.error('Error setting cook filter:', error);
                          // Fallback to home
                          router.push('/(tabs)');
                        }
                      }}
                    >
                      <Text variant="body" style={{ color: colors.primary }}>
                        {t('foodDetailScreen.viewAllCook')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.rating}>
                    <StarRating rating={food.rating} size="small" showNumber />
                    <Text variant="caption" color="textSecondary" style={{ marginLeft: 8 }}>
                      {t('foodDetailScreen.reviewCount', { count: food.reviewCount })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">{t('foodDetailScreen.distance')}</Text>
                <Text variant="body" weight="medium">{food.distance}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text variant="caption" color="textSecondary">{t('foodDetailScreen.prep')}</Text>
                <Text variant="body" weight="medium">{food.prepTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text variant="body" weight="medium" color="primary">
                  {deliveryType === 'pickup' ? t('foodDetailScreen.pickup') : t('foodDetailScreen.delivery')}
                </Text>
              </View>
            </View>

            {/* Availability Info */}
            <View style={styles.availabilitySection}>
              <View style={styles.availabilityItem}>
                <Text variant="caption" color="textSecondary">{t('foodDetailScreen.saleDates')}</Text>
                <Text variant="body" weight="medium" color="primary">📅 {food.availableDates}</Text>
              </View>
              <View style={styles.availabilityItem}>
                <Text variant="caption" color="textSecondary">{t('foodDetailScreen.stockStatus')}</Text>
                <Text variant="body" weight="medium" color={food.currentStock > 0 ? "primary" : "error"}>
                  {t('foodDetailScreen.stockRemaining', { current: food.currentStock, total: food.dailyStock })}
                </Text>
              </View>
            </View>

          </Card>

          {/* Description */}
          <Card variant="default" padding="md" style={styles.descriptionCard}>
            <Text variant="subheading" weight="medium" style={styles.descriptionTitle}>
              {t('foodDetailScreen.descriptionTitle')}
            </Text>
            <Text variant="body" style={styles.description}>
              {food.description}
            </Text>
          </Card>

          {/* Recipe */}
          {food.recipe && (
            <Card variant="default" padding="md" style={styles.descriptionCard}>
              <Text variant="subheading" weight="medium" style={styles.descriptionTitle}>
                {t('foodDetailSimpleScreen.recipeTitle')}
              </Text>
              <Text variant="body" style={styles.description}>
                {food.recipe}
              </Text>
            </Card>
          )}

          {/* Reviews Section */}
          <Card variant="default" padding="md" style={styles.reviewsCard}>
            <View style={styles.reviewsHeader}>
              <Text variant="subheading" weight="medium" style={styles.reviewsTitle}>
                {t('foodDetailScreen.reviewsTitle')}
              </Text>
              {user && !hasUserReviewed && (
                <TouchableOpacity
                  onPress={() => setShowReviewModal(true)}
                  style={[styles.addReviewButton, { backgroundColor: colors.primary }]}
                >
                  <Text variant="caption" style={{ color: colors.background }}>
                    {t('foodDetailScreen.addReview')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Rating Stats */}
            {reviewStats && (
              <RatingStats stats={reviewStats} compact />
            )}

            {/* Recent Reviews */}
            <View style={styles.reviewsList}>
              {reviews.length > 0 ? (
                reviews.slice(0, 3).map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onHelpfulPress={() => handleReviewHelpful(review.id!)}
                    onReportPress={() => handleReviewReport(review.id!)}
                    compact
                  />
                ))
              ) : (
                <View style={styles.noReviews}>
                  <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                    {t('foodDetailScreen.noReviews')}
                  </Text>
                  {user && (
                    <TouchableOpacity
                      onPress={() => setShowReviewModal(true)}
                      style={[styles.firstReviewButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                    >
                      <Text variant="body" style={{ color: colors.primary }}>
                        {t('foodDetailScreen.firstReview')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {reviews.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllReviews}
                onPress={() => {
                  // Navigate to all reviews page
                  // router.push(`/reviews?foodId=${food?.id || params.id}&foodName=${encodeURIComponent(food?.name || '')}`);
                }}
              >
                <Text variant="body" style={{ color: colors.primary }}>
                  {t('foodDetailScreen.viewAllReviews', { count: reviews.length })}
                </Text>
              </TouchableOpacity>
            )}
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
            {t('foodDetailScreen.message')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleOrderPress}
          style={[styles.bottomButton, styles.orderButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text variant="body" weight="semibold" style={styles.bottomButtonText}>
            {t('foodDetailScreen.order')}
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
              {t('foodDetailScreen.orderModalTitle')}
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
                    {t('foodDetailScreen.monthLabel')}
                  </Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      // Basit tarih değiştirme - performans için
                      console.log('Önceki gün seçildi');
                    }}
                  >
                    <FontAwesome name="minus" size={14} color="white" />
                  </TouchableOpacity>
                  
                  <View style={styles.counterValue}>
                    <Text variant="body" weight="bold" style={{ color: colors.text, textAlign: 'center' }}>
                      15 Oca
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      // Basit tarih değiştirme - performans için
                      console.log('Sonraki gün seçildi');
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
                  <Text variant="caption" color="textSecondary">{t('foodDetailScreen.timeLabel')}</Text>
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
                {t('foodDetailScreen.quantityLabel')}
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
                {t('foodDetailScreen.deliveryType')}
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
                    {t('foodDetailScreen.pickup')}
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
                    {t('foodDetailScreen.delivery')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Price */}
            <View style={[styles.totalContainer, { backgroundColor: colors.surface }]}>
              <Text variant="subheading" weight="semibold">
                {t('foodDetailScreen.total')}
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
                {t('foodDetailScreen.submit')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        foodName={food.name}
        loading={reviewLoading}
      />

      {/* Payment Modal */}
      {paymentRequest && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentRequest(null);
          }}
          onPaymentSuccess={handlePaymentSuccess}
          paymentRequest={paymentRequest}
        />
      )}

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
  reviewsCard: {
    marginBottom: 0,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  reviewsTitle: {
    flex: 1,
  },
  addReviewButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  firstReviewButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllReviews: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
