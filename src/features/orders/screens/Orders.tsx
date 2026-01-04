import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock order data
const MOCK_ORDERS = [
  {
    id: '1',
    orderNumber: '#ORD-2024-001',
    date: '4 Ocak 2024',
    status: 'preparing',
    statusText: 'Hazırlanıyor',
    items: [
      { name: 'Ev Yapımı Mantı', quantity: 2, price: 35 },
      { name: 'Mercimek Çorbası', quantity: 1, price: 15 },
    ],
    total: 85,
    cookName: 'Ayşe Hanım',
    estimatedTime: '30-45 dk',
  },
  {
    id: '2',
    orderNumber: '#ORD-2024-002',
    date: '3 Ocak 2024',
    status: 'completed',
    statusText: 'Tamamlandı',
    items: [
      { name: 'Karnıyarık', quantity: 1, price: 28 },
    ],
    total: 33,
    cookName: 'Mehmet Usta',
    estimatedTime: 'Teslim edildi',
  },
];

export const Orders: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return colors.warning || '#F59E0B';
      case 'ready':
        return colors.success || '#10B981';
      case 'completed':
        return colors.success || '#10B981';
      case 'cancelled':
        return colors.error || '#EF4444';
      default:
        return colors.textSecondary;
    }
  };

  const renderOrder = (order: any) => (
    <Card key={order.id} variant="default" padding="md" style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text variant="subheading" weight="semibold">
            {order.orderNumber}
          </Text>
          <Text variant="caption" color="textSecondary">
            {order.date} • {order.cookName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text variant="caption" style={{ color: 'white', fontSize: 11 }}>
            {order.statusText}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item: any, index: number) => (
          <View key={index} style={styles.orderItem}>
            <Text variant="body">
              {item.quantity}x {item.name}
            </Text>
            <Text variant="body" weight="medium">
              ₺{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text variant="body" weight="semibold">
            Toplam: ₺{order.total.toFixed(2)}
          </Text>
          <Text variant="caption" color="textSecondary">
            {order.estimatedTime}
          </Text>
        </View>
        
        <View style={styles.orderActions}>
          {order.status === 'preparing' && (
            <Button variant="outline" size="sm" style={styles.actionButton}>
              Takip Et
            </Button>
          )}
          <Button variant="outline" size="sm" style={styles.actionButton}>
            Detaylar
          </Button>
        </View>
      </View>
    </Card>
  );

  if (MOCK_ORDERS.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title="Siparişlerim" />
        <View style={styles.emptyContainer}>
          <Text variant="heading" center>
            Henüz Siparişiniz Yok
          </Text>
          <Text variant="body" center color="textSecondary" style={styles.emptyText}>
            İlk siparişinizi vermek için ana sayfaya dönün.
          </Text>
          <Button 
            variant="primary" 
            onPress={() => router.push('/(tabs)/')}
            style={styles.browseButton}
          >
            Yemekleri Keşfet
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="" leftComponent={
        <Text variant="heading" weight="bold" color="primary" style={{ fontSize: 24 }}>
          Siparişlerim
        </Text>
      } />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ordersContainer}>
          {MOCK_ORDERS.map(renderOrder)}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyText: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    minWidth: 200,
  },
  ordersContainer: {
    padding: Spacing.md,
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
  orderInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderItems: {
    marginBottom: Spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: Spacing.md,
  },
  orderTotal: {
    marginBottom: Spacing.md,
  },
  orderActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
