import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TopBar, Text, Button, Card } from '../../../components/ui';
import { PaymentBreakdownCard } from '../../../components/wallet/PaymentBreakdownCard';
import { PaymentMethodSelector } from '../../../components/wallet/PaymentMethodSelector';
import { Colors, Spacing } from '../../../theme';
import { useWallet, PaymentBreakdown } from '../../../context/WalletContext';
import { useCart } from '../../../context/CartContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cookName: string;
  image?: string;
}

export const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { wallet, calculatePaymentBreakdown, processPayment, loading } = useWallet();
  const { cartItems, clearCart } = useCart();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | undefined>();
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown | null>(null);
  const [processing, setProcessing] = useState(false);

  // Calculate order details
  const orderItems: OrderItem[] = cartItems.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    cookName: item.cookName || 'Bilinmeyen Aşçı',
    image: item.image,
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 50 ? 0 : 5; // Free delivery over ₺50
  const total = subtotal + deliveryFee;

  // Calculate payment breakdown when total changes
  useEffect(() => {
    if (total > 0) {
      const breakdown = calculatePaymentBreakdown(total);
      setPaymentBreakdown(breakdown);
      
      // Auto-select default payment method if card payment is needed
      if (breakdown.card > 0 && wallet.defaultPaymentMethod) {
        setSelectedPaymentMethod(wallet.defaultPaymentMethod);
      }
    }
  }, [total, wallet, calculatePaymentBreakdown]);

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleCompleteOrder = async () => {
    if (!paymentBreakdown) {
      Alert.alert('Hata', 'Ödeme bilgileri hesaplanamadı');
      return;
    }

    // Delivery options are now handled at the food card level, no validation needed

    // Check if card payment is needed but no method selected
    if (paymentBreakdown.card > 0 && !selectedPaymentMethod) {
      Alert.alert('Ödeme Yöntemi Gerekli', 'Lütfen bir ödeme yöntemi seçin');
      return;
    }

    try {
      setProcessing(true);

      // Process payment
      const orderId = `order_${Date.now()}`;
      const description = `${orderItems.length} ürün siparişi`;
      
      await processPayment(total, orderId, description);

      // Clear cart
      clearCart();

      // Show success and navigate
      Alert.alert(
        'Sipariş Tamamlandı! 🎉',
        `Siparişiniz başarıyla alındı.\nSipariş No: ${orderId}`,
        [
          {
            text: 'Siparişlerim',
            onPress: () => router.replace('/(tabs)/orders'),
          },
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Ödeme Hatası', 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar title="Ödeme" showBack />
        <View style={styles.loadingContainer}>
          <Text variant="body" center>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (orderItems.length === 0) {
    return (
      <View style={styles.container}>
        <TopBar title="Ödeme" showBack />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text variant="subheading" center style={styles.emptyTitle}>
            Sepetiniz Boş
          </Text>
          <Text variant="body" center color="textSecondary" style={styles.emptyText}>
            Ödeme yapabilmek için sepetinize ürün ekleyin
          </Text>
          <Button
            title="Alışverişe Devam Et"
            onPress={() => router.replace('/(tabs)/')}
            style={styles.continueButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Ödeme" showBack />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <Card variant="default" padding="md" style={styles.orderSummary}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Sipariş Özeti
          </Text>
          
          {orderItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text variant="body" weight="medium">
                  {item.name}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {item.cookName} • {item.quantity} adet
                  {item.deliveryOption && ` • ${item.deliveryOption === 'pickup' ? '🏪 Gel Al' : '🚚 Teslimat'}`}
                </Text>
              </View>
              <Text variant="body" weight="medium">
                ₺{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View style={styles.orderTotals}>
            <View style={styles.totalRow}>
              <Text variant="body">Ara Toplam</Text>
              <Text variant="body">₺{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text variant="body">Teslimat</Text>
              <Text variant="body" color={deliveryFee === 0 ? 'success' : 'textPrimary'}>
                {deliveryFee === 0 ? 'Ücretsiz' : `₺${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text variant="subheading" weight="bold">Toplam</Text>
              <Text variant="subheading" weight="bold" color="primary">
                ₺{total.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Payment Breakdown */}
        {paymentBreakdown && (
          <PaymentBreakdownCard breakdown={paymentBreakdown} />
        )}

        {/* Payment Method Selection (only if card payment needed) */}
        {paymentBreakdown && paymentBreakdown.card > 0 && (
          <PaymentMethodSelector
            selectedMethodId={selectedPaymentMethod}
            onMethodSelect={handlePaymentMethodSelect}
          />
        )}

        {/* Wallet Info */}
        <Card variant="default" padding="md" style={styles.walletInfo}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Cüzdan Durumu
          </Text>
          <View style={styles.walletRow}>
            <Text variant="body">💰 Bakiye</Text>
            <Text variant="body" weight="medium" color="success">
              ₺{wallet.balance.toFixed(2)}
            </Text>
          </View>
          <View style={styles.walletRow}>
            <Text variant="body">📈 Çekilebilir Kazanç</Text>
            <Text variant="body" weight="medium" color="success">
              ₺{wallet.availableEarnings.toFixed(2)}
            </Text>
          </View>
          {wallet.pendingEarnings > 0 && (
            <View style={styles.walletRow}>
              <Text variant="body">⏳ Bekleyen Kazanç</Text>
              <Text variant="body" weight="medium" color="warning">
                ₺{wallet.pendingEarnings.toFixed(2)}
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Complete Order Button */}
      <View style={styles.footer}>
        <Button
          title={processing ? 'İşleniyor...' : 'Siparişi Tamamla'}
          onPress={handleCompleteOrder}
          disabled={processing || (paymentBreakdown?.card > 0 && !selectedPaymentMethod)}
          style={styles.completeButton}
        />
        
        {paymentBreakdown && paymentBreakdown.card > 0 && !selectedPaymentMethod && (
          <Text variant="caption" color="error" center style={styles.errorText}>
            Lütfen bir ödeme yöntemi seçin
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.md,
  },
  emptyText: {
    marginBottom: Spacing.xl,
  },
  continueButton: {
    marginTop: Spacing.lg,
  },
  orderSummary: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderItemLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  orderTotals: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  finalTotal: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  walletInfo: {
    marginTop: Spacing.md,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  completeButton: {
    marginBottom: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
});
