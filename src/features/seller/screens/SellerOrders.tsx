import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, PanResponder, Animated, useWindowDimensions, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const getMockOrders = (t: (key: string, params?: Record<string, string | number>) => string) => ([
  {
    id: 'ORD-001',
    customerName: t('sellerOrdersScreen.mock.customer1'),
    foodName: t('sellerOrdersScreen.mock.food1'),
    quantity: 2,
    totalPrice: 50,
    orderTime: '14:30',
    deliveryType: 'pickup',
    status: 'pending',
    customerPhone: t('sellerOrdersScreen.mock.phone1'),
  },
  {
    id: 'ORD-002',
    customerName: t('sellerOrdersScreen.mock.customer2'),
    foodName: t('sellerOrdersScreen.mock.food2'),
    quantity: 1,
    totalPrice: 18,
    orderTime: '13:45',
    deliveryType: 'delivery',
    status: 'pending',
    customerPhone: t('sellerOrdersScreen.mock.phone2'),
    address: t('sellerOrdersScreen.mock.address2'),
  },
  {
    id: 'ORD-003',
    customerName: t('sellerOrdersScreen.mock.customer3'),
    foodName: t('sellerOrdersScreen.mock.food3'),
    quantity: 3,
    totalPrice: 45,
    orderTime: '12:15',
    deliveryType: 'pickup',
    status: 'confirmed',
    customerPhone: t('sellerOrdersScreen.mock.phone3'),
  },
]);

export const SellerOrders: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const [orders, setOrders] = useState(() => getMockOrders(t));
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const locale = currentLanguage === 'en' ? 'en-GB' : 'tr-TR';
  const { width } = useWindowDimensions();
  const swipeTranslateX = React.useRef(new Animated.Value(0)).current;
  const swipeToPanelResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 18 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2,
        onPanResponderMove: (_, gestureState) => {
          swipeTranslateX.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldClose =
            Math.abs(gestureState.dx) > 85 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;
          if (shouldClose) {
            const targetX = gestureState.dx >= 0 ? width : -width;
            Animated.timing(swipeTranslateX, {
              toValue: targetX,
              duration: 170,
              useNativeDriver: true,
            }).start(() => {
              swipeTranslateX.setValue(0);
              router.replace('/(seller)/seller-panel');
            });
            return;
          }
          Animated.spring(swipeTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(swipeTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        },
      }),
    [swipeTranslateX, width]
  );
  const isWeb = Platform.OS === 'web';
  const panHandlers = isWeb ? {} : swipeToPanelResponder.panHandlers;

  // Load orders from AsyncStorage when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
      if (isWeb && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }, [])
  );

  useEffect(() => {
    setOrders(getMockOrders(t));
  }, [currentLanguage, t]);

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        // Filter orders for this seller (in real app, use seller ID)
        const sellerOrders = allOrders.filter((order: any) => 
          order.status === 'pending_seller_approval' || 
          order.status === 'seller_approved' ||
          order.status === 'pending_buyer_approval' ||
          order.status === 'confirmed' ||
          order.status === 'rejected'
        );
        setRealOrders(sellerOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'confirm' | 'reject') => {
    const actionText = action === 'confirm'
      ? t('sellerOrdersScreen.alerts.actionConfirm')
      : t('sellerOrdersScreen.alerts.actionReject');
    
    Alert.alert(
      t('sellerOrdersScreen.alerts.confirmTitle'),
      t('sellerOrdersScreen.alerts.confirmMessage', { action: actionText }),
      [
        { text: t('sellerOrdersScreen.alerts.cancel'), style: 'cancel' },
        {
          text: action === 'confirm' ? t('sellerOrdersScreen.actions.confirm') : t('sellerOrdersScreen.actions.reject'),
          style: action === 'confirm' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              // Update local state
              setOrders(prev => 
                prev.map(order => 
                  order.id === orderId 
                    ? { ...order, status: action === 'confirm' ? 'confirmed' : 'rejected' }
                    : order
                )
              );

              // Update AsyncStorage
              const savedOrders = await AsyncStorage.getItem('orders');
              if (savedOrders) {
                const allOrders = JSON.parse(savedOrders);
                const updatedOrders = allOrders.map((order: any) => 
                  order.id === orderId 
                    ? { 
                        ...order, 
                        status: action === 'confirm' ? 'seller_approved' : 'rejected',
                        sellerApprovedAt: action === 'confirm' ? new Date().toISOString() : undefined
                      }
                    : order
                );
                await AsyncStorage.setItem('orders', JSON.stringify(updatedOrders));
                
                // Reload orders
                loadOrders();
              }

              Alert.alert(
                t('sellerOrdersScreen.alerts.successTitle'),
                action === 'confirm' 
                  ? t('sellerOrdersScreen.alerts.successConfirm') 
                  : t('sellerOrdersScreen.alerts.successReject')
              );
            } catch (error) {
              console.error('Error updating order:', error);
              Alert.alert(t('sellerOrdersScreen.alerts.errorTitle'), t('sellerOrdersScreen.alerts.errorMessage'));
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'confirmed':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const handleBackPress = () => {
    console.log('Back button pressed from SellerOrders');
    router.replace('/(seller)/seller-panel');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_seller_approval':
        return t('sellerOrdersScreen.status.pending');
      case 'seller_approved':
        return t('sellerOrdersScreen.status.sellerApproved');
      case 'pending_buyer_approval':
        return t('sellerOrdersScreen.status.pendingBuyerApproval');
      case 'confirmed':
        return t('sellerOrdersScreen.status.confirmed');
      case 'rejected':
        return t('sellerOrdersScreen.status.rejected');
      default:
        return t('sellerOrdersScreen.status.unknown', { status });
    }
  };

  // Combine mock orders with real orders for display
  const allOrders = [...orders, ...realOrders];
  const pendingOrders = allOrders.filter(order => 
    order.status === 'pending' || order.status === 'pending_seller_approval'
  );
  const otherOrders = allOrders.filter(order => 
    order.status !== 'pending' && order.status !== 'pending_seller_approval'
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          transform: [{ translateX: isWeb ? 0 : swipeTranslateX }],
        },
      ]}
      // Dragging the page reveals the underlying screen for a native-like transition feel.
      {...panHandlers}
    >
      <TopBar 
        title={t('sellerOrdersScreen.title')}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <View style={styles.section}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {t('sellerOrdersScreen.pendingTitle', { count: pendingOrders.length })}
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
                    <Text weight="medium">{t('sellerOrdersScreen.labels.customer')}</Text> {order.customerName || order.buyerName}
                  </Text>
                  {(order.customerPhone || order.buyerPhone) && (
                    <Text variant="body">
                      <Text weight="medium">{t('sellerOrdersScreen.labels.phone')}</Text> {order.customerPhone || order.buyerPhone || t('sellerOrdersScreen.labels.unknown')}
                    </Text>
                  )}
                  <Text variant="body">
                    <Text weight="medium">{t('sellerOrdersScreen.labels.quantity')}</Text> {order.quantity} {t('sellerOrdersScreen.labels.quantityUnit')}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">{t('sellerOrdersScreen.labels.total')}</Text> ₺{order.totalPrice}
                  </Text>
                      <Text variant="body">
                        <Text weight="medium">{t('sellerOrdersScreen.labels.orderDate')}</Text> {order.requestedDate || order.orderTime || t('sellerOrdersScreen.labels.unknown')}
                        {order.requestedTime && ` - ${order.requestedTime}`}
                      </Text>
                  <Text variant="body">
                    <Text weight="medium">{t('sellerOrdersScreen.labels.delivery')}</Text> {order.deliveryType === 'pickup' ? t('sellerOrdersScreen.delivery.pickup') : t('sellerOrdersScreen.delivery.delivery')}
                  </Text>
                  {order.address && (
                    <Text variant="body">
                      <Text weight="medium">{t('sellerOrdersScreen.labels.address')}</Text> {order.address}
                    </Text>
                  )}
                  {order.createdAt && (
                    <Text variant="caption" color="textSecondary">
                      {t('sellerOrdersScreen.labels.orderTime')} {new Date(order.createdAt).toLocaleString(locale)}
                    </Text>
                  )}
                </View>

                {(order.status === 'pending' || order.status === 'pending_seller_approval') && (
                  <View style={styles.orderActions}>
                    <Button
                      variant="outline"
                      onPress={() => handleOrderAction(order.id, 'reject')}
                      style={[styles.actionButton, { borderColor: colors.error }]}
                    >
                      <Text color="error">{t('sellerOrdersScreen.actions.reject')}</Text>
                    </Button>
                    <Button
                      variant="primary"
                      onPress={() => handleOrderAction(order.id, 'confirm')}
                      style={styles.actionButton}
                    >
                      {t('sellerOrdersScreen.actions.confirm')}
                    </Button>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Other Orders */}
        {otherOrders.length > 0 && (
          <View style={styles.section}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {t('sellerOrdersScreen.otherTitle')}
            </Text>
            
            {otherOrders.map((order) => (
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
                    <Text weight="medium">{t('sellerOrdersScreen.labels.customer')}</Text> {order.customerName}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">{t('sellerOrdersScreen.labels.quantity')}</Text> {order.quantity} {t('sellerOrdersScreen.labels.quantityUnit')} • ₺{order.totalPrice}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">{t('sellerOrdersScreen.labels.orderTimeShort')}</Text> {order.orderTime}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              {t('sellerOrdersScreen.emptyTitle')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              {t('sellerOrdersScreen.emptyDesc')}
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
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
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  orderCard: {
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
