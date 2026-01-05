import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Mock orders data
const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    customerName: 'Ahmet Yılmaz',
    foodName: 'Ev Yapımı Mantı',
    quantity: 2,
    totalPrice: 50,
    orderTime: '14:30',
    deliveryType: 'pickup',
    status: 'pending',
    customerPhone: '0532 123 45 67',
  },
  {
    id: 'ORD-002',
    customerName: 'Ayşe Demir',
    foodName: 'Karnıyarık',
    quantity: 1,
    totalPrice: 18,
    orderTime: '13:45',
    deliveryType: 'delivery',
    status: 'pending',
    customerPhone: '0533 987 65 43',
    address: 'Kadıköy, İstanbul',
  },
  {
    id: 'ORD-003',
    customerName: 'Mehmet Kaya',
    foodName: 'Ev Böreği',
    quantity: 3,
    totalPrice: 45,
    orderTime: '12:15',
    deliveryType: 'pickup',
    status: 'confirmed',
    customerPhone: '0534 555 44 33',
  },
];

export const SellerOrders: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [realOrders, setRealOrders] = useState<any[]>([]);

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
    const actionText = action === 'confirm' ? 'onaylamak' : 'reddetmek';
    
    Alert.alert(
      'Emin misiniz?',
      `Bu siparişi ${actionText} istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: action === 'confirm' ? 'Onayla' : 'Reddet',
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
                'Başarılı',
                action === 'confirm' 
                  ? 'Sipariş onaylandı. Müşteri bilgilendirildi.' 
                  : 'Sipariş reddedildi.'
              );
            } catch (error) {
              console.error('Error updating order:', error);
              Alert.alert('Hata', 'Sipariş güncellenirken bir hata oluştu.');
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
    router.back();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_seller_approval':
        return 'Onay Bekliyor';
      case 'seller_approved':
        return 'Onaylandı (Müşteri Onayı Bekliyor)';
      case 'pending_buyer_approval':
        return 'Müşteri Onayı Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Siparişler"
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
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <View style={styles.section}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              Bekleyen Siparişler ({pendingOrders.length})
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
                    <Text weight="medium">Müşteri:</Text> {order.customerName || order.buyerName}
                  </Text>
                  {(order.customerPhone || order.buyerPhone) && (
                    <Text variant="body">
                      <Text weight="medium">Telefon:</Text> {order.customerPhone || order.buyerPhone || 'Belirtilmemiş'}
                    </Text>
                  )}
                  <Text variant="body">
                    <Text weight="medium">Miktar:</Text> {order.quantity} adet
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Toplam:</Text> ₺{order.totalPrice}
                  </Text>
                      <Text variant="body">
                        <Text weight="medium">Sipariş Tarihi:</Text> {order.requestedDate || order.orderTime || 'Belirtilmemiş'}
                        {order.requestedTime && ` - ${order.requestedTime}`}
                      </Text>
                  <Text variant="body">
                    <Text weight="medium">Teslimat:</Text> {order.deliveryType === 'pickup' ? 'Gel Al' : 'Teslimat'}
                  </Text>
                  {order.address && (
                    <Text variant="body">
                      <Text weight="medium">Adres:</Text> {order.address}
                    </Text>
                  )}
                  {order.createdAt && (
                    <Text variant="caption" color="textSecondary">
                      Sipariş Zamanı: {new Date(order.createdAt).toLocaleString('tr-TR')}
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
                      <Text color="error">Reddet</Text>
                    </Button>
                    <Button
                      variant="primary"
                      onPress={() => handleOrderAction(order.id, 'confirm')}
                      style={styles.actionButton}
                    >
                      Onayla
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
              Diğer Siparişler
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
                    <Text weight="medium">Müşteri:</Text> {order.customerName}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Miktar:</Text> {order.quantity} adet • ₺{order.totalPrice}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Sipariş Saati:</Text> {order.orderTime}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              Sipariş Yok
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              Henüz hiç siparişiniz yok.
            </Text>
          </View>
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

