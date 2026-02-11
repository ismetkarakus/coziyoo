import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card, WebSafeIcon } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useCountry } from '../../../context/CountryContext';

export const OrderHistory: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { formatCurrency } = useCountry();
  const [orders, setOrders] = useState<any[]>([]);
  const locale = currentLanguage === 'en' ? 'en-GB' : 'tr-TR';

  // Load orders from AsyncStorage when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        // Filter orders for this buyer (in real app, use buyer ID)
        const buyerOrders = allOrders.filter((order: any) => 
          order.buyerId === 'buyer1' // Gerçek uygulamada kullanıcı ID'si
        );
        setOrders(buyerOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleBackPress = () => {
    console.log('Back button pressed from OrderHistory');
    // Go back to previous page (should be profile)
    router.back();
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
                  <Card key={order.id} variant="default" padding="md" style={styles.orderCard}>
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
                  <Card key={order.id} variant="default" padding="md" style={styles.orderCard}>
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
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
});
