import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card, WebSafeIcon } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';
import { useAuth } from '../../../context/AuthContext';

const buildMockBuyerOrders = (buyerId: string, locale: string) => {
  const now = Date.now();
  const dateLabel = (offsetDays: number) =>
    new Date(now + offsetDays * 24 * 60 * 60 * 1000).toLocaleDateString(locale);

  return [
    {
      id: `mock_order_${buyerId}_1`,
      buyerId,
      foodName: 'Ev Yapımı Mantı',
      cookName: 'Ayşe Hanım',
      quantity: 2,
      totalPrice: 70,
      requestedDate: dateLabel(1),
      requestedTime: '19:00',
      deliveryType: 'delivery',
      status: 'seller_approved',
      createdAt: new Date(now - 60 * 60 * 1000).toISOString(),
    },
    {
      id: `mock_order_${buyerId}_2`,
      buyerId,
      foodName: 'Karnıyarık',
      cookName: 'Mehmet Usta',
      quantity: 1,
      totalPrice: 28,
      requestedDate: dateLabel(0),
      requestedTime: '13:30',
      deliveryType: 'pickup',
      status: 'pending_seller_approval',
      createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `mock_order_${buyerId}_3`,
      buyerId,
      foodName: 'Mercimek Çorbası',
      cookName: 'Zeynep Hanım',
      quantity: 3,
      totalPrice: 45,
      requestedDate: dateLabel(-1),
      requestedTime: '12:00',
      deliveryType: 'delivery',
      status: 'confirmed',
      buyerApprovedAt: new Date(now - 20 * 60 * 60 * 1000).toISOString(),
      paymentCompleted: true,
      createdAt: new Date(now - 28 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const OrderHistory: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const { user, userData } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittedReviewsByOrderId, setSubmittedReviewsByOrderId] = useState<Record<string, boolean>>({});
  const locale = currentLanguage === 'en' ? 'en-GB' : 'tr-TR';
  const isTR = currentLanguage === 'tr';
  const REVIEW_STORAGE_KEY = 'order_reviews';

  // Load orders from AsyncStorage when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      const allOrders = savedOrders ? JSON.parse(savedOrders) : [];
      const buyerId = user?.uid || userData?.uid || userData?.email || user?.email || 'buyer1';
      const buyerOrders = allOrders.filter((order: any) => order.buyerId === buyerId);

      if (buyerOrders.length > 0) {
        setOrders(buyerOrders);
        return;
      }

      const mockOrders = buildMockBuyerOrders(String(buyerId), locale);
      const updatedOrders = [...allOrders, ...mockOrders];
      await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadSubmittedReviews = async () => {
    try {
      const savedReviews = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
      const reviews = savedReviews ? JSON.parse(savedReviews) : [];
      const buyerId = user?.uid || userData?.uid || userData?.email || user?.email || 'buyer1';
      const nextMap = (reviews as any[]).reduce<Record<string, boolean>>((acc, review) => {
        if (review?.buyerId === buyerId && review?.orderId) {
          acc[String(review.orderId)] = true;
        }
        return acc;
      }, {});
      setSubmittedReviewsByOrderId(nextMap);
    } catch (error) {
      console.error('Error loading submitted reviews:', error);
    }
  };

  useEffect(() => {
    loadSubmittedReviews();
  }, [user?.uid, userData?.uid, user?.email, userData?.email]);

  const handleBackPress = () => {
    console.log('Back button pressed from OrderHistory');
    router.replace('/(buyer)/buyer-profile');
  };

  const handleBuyerApproval = async (orderId: string, action: 'approve' | 'reject') => {
    const actionText = action === 'approve'
      ? t('orderHistoryScreen.approveFlow.approveAction')
      : t('orderHistoryScreen.approveFlow.rejectAction');
    
    Alert.alert(
      t('orderHistoryScreen.approveFlow.confirmTitle'),
      t('orderHistoryScreen.approveFlow.confirmMessage', { action: actionText }),
      [
        { text: t('orderHistoryScreen.approveFlow.cancel'), style: 'cancel' },
        {
          text: action === 'approve'
            ? t('orderHistoryScreen.approveFlow.approvePay')
            : t('orderHistoryScreen.approveFlow.reject'),
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              // Update AsyncStorage
              const savedOrders = await AsyncStorage.getItem('orders');
              if (savedOrders) {
                const allOrders = JSON.parse(savedOrders);
                const updatedOrders = allOrders.map((order: any) => 
                  order.id === orderId 
                    ? { 
                        ...order, 
                        status: action === 'approve' ? 'confirmed' : 'rejected',
                        buyerApprovedAt: action === 'approve' ? new Date().toISOString() : undefined,
                        paymentCompleted: action === 'approve' ? true : false
                      }
                    : order
                );
                await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
                
                // Reload orders
                loadOrders();
              }

              Alert.alert(
                t('orderHistoryScreen.approveFlow.successTitle'),
                action === 'approve'
                  ? t('orderHistoryScreen.approveFlow.successApprove')
                  : t('orderHistoryScreen.approveFlow.successReject')
              );
            } catch (error) {
              console.error('Error updating order:', error);
              Alert.alert(
                t('orderHistoryScreen.approveFlow.errorTitle'),
                t('orderHistoryScreen.approveFlow.errorMessage')
              );
            }
          },
        },
      ]
    );
  };

  const openOrderChat = (order: any) => {
    router.push({
      pathname: '/(buyer)/chat-detail',
      params: {
        orderId: String(order.id),
        foodName: String(order.foodName || ''),
        orderStatus: getStatusText(order.status),
        name: String(order.cookName || (currentLanguage === 'en' ? 'Seller' : 'Satıcı')),
        type: 'buyer',
        returnTo: '/order-history',
      },
    } as any);
  };

  const getOrderCompletionDate = (order: any): Date => {
    const rawDate = order?.buyerApprovedAt || order?.updatedAt || order?.createdAt;
    const parsed = rawDate ? new Date(rawDate) : new Date();
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const canReviewOrder = (order: any): boolean => {
    if (order?.status !== 'confirmed') return false;
    if (submittedReviewsByOrderId[String(order.id)]) return false;
    const completionDate = getOrderCompletionDate(order);
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - completionDate.getTime() <= sevenDaysMs;
  };

  const getRemainingReviewDays = (order: any): number => {
    const completionDate = getOrderCompletionDate(order).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const remainingMs = Math.max(0, completionDate + sevenDaysMs - Date.now());
    return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  };

  const openReviewModal = (order: any) => {
    if (!canReviewOrder(order)) {
      if (submittedReviewsByOrderId[String(order.id)]) {
        Alert.alert(
          isTR ? 'Yorum Gönderildi' : 'Review Sent',
          isTR ? 'Bu sipariş için zaten yorum yaptınız.' : 'You already reviewed this order.'
        );
        return;
      }
      Alert.alert(
        isTR ? 'Yorum Süresi Doldu' : 'Review Period Ended',
        isTR
          ? 'Sipariş tamamlandıktan sonra yalnızca 7 gün içinde yorum yapılabilir.'
          : 'You can review only within 7 days after completion.'
      );
      return;
    }
    setSelectedOrderForReview(order);
    setSelectedRating(0);
    setReviewComment('');
    setReviewModalVisible(true);
  };

  const submitOrderReview = async () => {
    if (!selectedOrderForReview) return;
    if (selectedRating < 1 || selectedRating > 5) {
      Alert.alert(
        isTR ? 'Puan Gerekli' : 'Rating Required',
        isTR ? 'Lütfen 1-5 arası yıldız seçin.' : 'Please select a rating between 1 and 5.'
      );
      return;
    }
    if (reviewComment.trim().length < 10) {
      Alert.alert(
        isTR ? 'Yorum Kısa' : 'Comment Too Short',
        isTR ? 'Yorum en az 10 karakter olmalı.' : 'Comment must be at least 10 characters.'
      );
      return;
    }

    try {
      const buyerId = user?.uid || userData?.uid || userData?.email || user?.email || 'buyer1';
      const buyerName = userData?.displayName || user?.email || (isTR ? 'Alıcı' : 'Buyer');
      const savedReviews = await AsyncStorage.getItem(REVIEW_STORAGE_KEY);
      const reviews = savedReviews ? JSON.parse(savedReviews) : [];
      const newReview = {
        id: `order_review_${Date.now()}`,
        orderId: String(selectedOrderForReview.id),
        foodName: String(selectedOrderForReview.foodName || ''),
        sellerName: String(selectedOrderForReview.cookName || ''),
        buyerId: String(buyerId),
        buyerName: String(buyerName),
        rating: selectedRating,
        comment: reviewComment.trim(),
        createdAt: new Date().toISOString(),
      };
      const nextReviews = [...reviews, newReview];
      await AsyncStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(nextReviews));
      setSubmittedReviewsByOrderId((prev) => ({ ...prev, [String(selectedOrderForReview.id)]: true }));
      setReviewModalVisible(false);
      setSelectedOrderForReview(null);
      setSelectedRating(0);
      setReviewComment('');

      Alert.alert(
        isTR ? 'Teşekkürler' : 'Thank You',
        isTR ? 'Yorumunuz başarıyla kaydedildi.' : 'Your review has been saved.'
      );
    } catch (error) {
      console.error('Error saving order review:', error);
      Alert.alert(
        isTR ? 'Hata' : 'Error',
        isTR ? 'Yorum kaydedilemedi. Tekrar deneyin.' : 'Failed to save review. Please try again.'
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_seller_approval':
        return colors.warning;
      case 'seller_approved':
        return colors.info;
      case 'confirmed':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_seller_approval':
        return t('orderHistoryScreen.statuses.pendingSeller');
      case 'seller_approved':
        return t('orderHistoryScreen.statuses.sellerApproved');
      case 'confirmed':
        return t('orderHistoryScreen.statuses.confirmed');
      case 'rejected':
        return t('orderHistoryScreen.statuses.rejected');
      default:
        return status;
    }
  };

  const pendingOrders = orders.filter(order => 
    order.status === 'pending_seller_approval' || order.status === 'seller_approved'
  );
  const completedOrders = orders.filter(order => 
    order.status === 'confirmed' || order.status === 'rejected'
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={currentLanguage === 'tr' ? 'Siparislerim' : 'My Orders'}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <WebSafeIcon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              {t('orderHistoryScreen.emptyTitle')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              {t('orderHistoryScreen.emptyDesc')}
            </Text>
          </View>
        ) : (
          <>
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <View style={styles.section}>
                <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                  {t('orderHistoryScreen.pendingTitle', { count: pendingOrders.length })}
                </Text>
                
                {pendingOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    activeOpacity={0.85}
                    onPress={() => openOrderChat(order)}
                  >
                    <Card variant="default" padding="md" style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text variant="subheading" weight="semibold">
                        {order.foodName}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text variant="caption" style={{ color: 'white' }}>
                          {getStatusText(order.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderInfo}>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.seller')}</Text> {order.cookName}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.quantity')}</Text> {order.quantity} {t('orderHistoryScreen.quantityUnit')}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.total')}</Text> {formatCurrency(order.totalPrice)}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.requestedDate')}</Text> {order.requestedDate}
                        {order.requestedTime && ` - ${order.requestedTime}`}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.delivery')}</Text> {order.deliveryType === 'pickup' ? t('orderHistoryScreen.pickup') : t('orderHistoryScreen.deliveryOption')}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {t('orderHistoryScreen.orderTime')} {new Date(order.createdAt).toLocaleString(locale)}
                      </Text>
                    </View>

                    {order.status === 'seller_approved' && (
                      <View style={styles.orderActions}>
                        <Button
                          variant="outline"
                          onPress={() => handleBuyerApproval(order.id, 'reject')}
                          style={[styles.actionButton, { borderColor: colors.error }]}
                        >
                          <Text color="error">{t('orderHistoryScreen.approveFlow.reject')}</Text>
                        </Button>
                        <Button
                          variant="primary"
                          onPress={() => handleBuyerApproval(order.id, 'approve')}
                          style={styles.actionButton}
                        >
                          {t('orderHistoryScreen.approveFlow.approvePay')}
                        </Button>
                      </View>
                    )}
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <View style={styles.section}>
                <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                  {t('orderHistoryScreen.completedTitle', { count: completedOrders.length })}
                </Text>
                
                {completedOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    activeOpacity={canReviewOrder(order) ? 0.85 : 1}
                    onPress={() => openReviewModal(order)}
                  >
                    <Card variant="default" padding="md" style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <Text variant="subheading" weight="semibold">
                        {order.foodName}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text variant="caption" style={{ color: 'white' }}>
                          {getStatusText(order.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderInfo}>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.seller')}</Text> {order.cookName}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.quantity')}</Text> {order.quantity} {t('orderHistoryScreen.quantityUnit')}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.total')}</Text> {formatCurrency(order.totalPrice)}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.requestedDate')}</Text> {order.requestedDate}
                        {order.requestedTime && ` - ${order.requestedTime}`}
                      </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('orderHistoryScreen.delivery')}</Text> {order.deliveryType === 'pickup' ? t('orderHistoryScreen.pickup') : t('orderHistoryScreen.deliveryOption')}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {t('orderHistoryScreen.orderTime')} {new Date(order.createdAt).toLocaleString(locale)}
                      </Text>
                      {order.buyerApprovedAt && (
                        <Text variant="caption" color="success">
                          {t('orderHistoryScreen.paymentTime')} {new Date(order.buyerApprovedAt).toLocaleString('tr-TR')}
                        </Text>
                      )}
                      {canReviewOrder(order) ? (
                        <View style={[styles.reviewStatusChip, { backgroundColor: colors.primary }]}>
                          <WebSafeIcon name="star" size={14} color="white" />
                          <Text variant="caption" style={styles.reviewStatusChipText}>
                            {isTR
                              ? `Kartta tikla: ${getRemainingReviewDays(order)} gun icinde yildiz + yorum yap`
                              : `Tap card: rate + comment within ${getRemainingReviewDays(order)} day(s)`}
                          </Text>
                        </View>
                      ) : submittedReviewsByOrderId[String(order.id)] ? (
                        <View style={[styles.reviewStatusChip, { backgroundColor: colors.success }]}>
                          <WebSafeIcon name="check-circle" size={14} color="white" />
                          <Text variant="caption" style={styles.reviewStatusChipText}>
                            {isTR ? 'Bu siparis icin yorum ve yildiz kaydedildi' : 'Review and rating submitted for this order'}
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.reviewStatusChip, styles.reviewStatusChipMuted, { borderColor: colors.border }]}>
                          <WebSafeIcon name="schedule" size={14} color={colors.textSecondary} />
                          <Text variant="caption" color="textSecondary">
                            {isTR ? 'Yorum suresi doldu (7 gun)' : 'Review window ended (7 days)'}
                          </Text>
                        </View>
                      )}
                    </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        transparent
        visible={reviewModalVisible}
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            style={styles.reviewModalAvoider}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          >
            <View style={styles.reviewModalOverlay}>
              <View style={[styles.reviewModalCard, { backgroundColor: colors.card }]}>
                <Text variant="subheading" weight="semibold">
                  {isTR ? 'Ustaya Yildiz ve Yorum Ver' : 'Rate and Review the Seller'}
                </Text>
                <Text variant="caption" color="textSecondary" style={styles.reviewModalSubtitle}>
                  {selectedOrderForReview?.foodName || ''}
                </Text>

                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setSelectedRating(star)}
                      style={styles.starButton}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.starText, { color: star <= selectedRating ? '#F5A623' : colors.border }]}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder={isTR ? 'Yorumunuz (min. 10 karakter)' : 'Your comment (min. 10 chars)'}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  style={[
                    styles.reviewInput,
                    { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
                  ]}
                />

                <View style={styles.reviewActions}>
                  <Button
                    variant="outline"
                    onPress={() => setReviewModalVisible(false)}
                    style={styles.reviewActionButton}
                  >
                    {isTR ? 'Vazgec' : 'Cancel'}
                  </Button>
                  <Button
                    variant="primary"
                    onPress={submitOrderReview}
                    style={styles.reviewActionButton}
                  >
                    {isTR ? 'Gonder' : 'Submit'}
                  </Button>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: 100,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  orderCard: {
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  orderInfo: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  orderActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  reviewModalAvoider: {
    flex: 1,
  },
  reviewModalCard: {
    borderRadius: 14,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  reviewModalSubtitle: {
    marginTop: -2,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  starButton: {
    paddingHorizontal: Spacing.xs,
  },
  starText: {
    fontSize: 32,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.sm,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  reviewActionButton: {
    flex: 1,
  },
  reviewStatusChip: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  reviewStatusChipText: {
    color: 'white',
  },
  reviewStatusChipMuted: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});
