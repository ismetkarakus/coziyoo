import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

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

  const handleOrderAction = (orderId: string, action: 'confirm' | 'reject') => {
    const actionText = action === 'confirm' ? 'onaylamak' : 'reddetmek';
    
    Alert.alert(
      'Emin misiniz?',
      `Bu siparişi ${actionText} istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: action === 'confirm' ? 'Onayla' : 'Reddet',
          style: action === 'confirm' ? 'default' : 'destructive',
          onPress: () => {
            setOrders(prev => 
              prev.map(order => 
                order.id === orderId 
                  ? { ...order, status: action === 'confirm' ? 'confirmed' : 'rejected' }
                  : order
              )
            );
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const otherOrders = orders.filter(order => order.status !== 'pending');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="" 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
        rightComponent={
          <Text variant="heading" weight="bold" color="primary" style={{ fontSize: 20 }}>
            Siparişler
          </Text>
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
                    <Text weight="medium">Müşteri:</Text> {order.customerName}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Telefon:</Text> {order.customerPhone}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Miktar:</Text> {order.quantity} adet
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Toplam:</Text> ₺{order.totalPrice}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Sipariş Saati:</Text> {order.orderTime}
                  </Text>
                  <Text variant="body">
                    <Text weight="medium">Teslimat:</Text> {order.deliveryType === 'pickup' ? 'Gel Al' : 'Teslimat'}
                  </Text>
                  {order.address && (
                    <Text variant="body">
                      <Text weight="medium">Adres:</Text> {order.address}
                    </Text>
                  )}
                </View>

                {order.status === 'pending' && (
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

