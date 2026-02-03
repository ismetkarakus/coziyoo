import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCart } from '../../../context/CartContext';
import { useTranslation } from '../../../hooks/useTranslation';

export const Cart: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { cartItems, updateQuantity, getTotalPrice } = useCart();
  const { t } = useTranslation();
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');

  const subtotal = getTotalPrice();
  const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    router.push('/(tabs)/payment');
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar title={t('cartScreen.title')} />
        <View style={styles.emptyContainer}>
          <Text variant="heading" center>
            {t('cartScreen.emptyTitle')}
          </Text>
          <Text variant="body" center color="textSecondary" style={styles.emptyText}>
            {t('cartScreen.emptyDesc')}
          </Text>
          <Button 
            variant="primary" 
            onPress={() => router.push('/(tabs)')}
            style={styles.browseButton}
          >
            {t('cartScreen.browse')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('cartScreen.title')} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cartItems.map((item) => (
            <Card key={item.id} variant="default" padding="md" style={styles.itemCard}>
              <View style={styles.itemContent}>
                <View style={[styles.itemImage, { backgroundColor: colors.surface }]}>
                  <Text variant="body">📸</Text>
                </View>
                
                <View style={styles.itemInfo}>
                  <Text variant="subheading" weight="semibold" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {item.cookName}
                  </Text>
                  <Text variant="body" weight="semibold" color="primary">
                    ₺{item.price}
                  </Text>
                </View>

                <View style={styles.quantityControls}>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    style={styles.quantityButton}
                  >
                    -
                  </Button>
                  <Text variant="body" weight="semibold" style={styles.quantityText}>
                    {item.quantity}
                  </Text>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.quantityButton}
                  >
                    +
                  </Button>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Delivery Selection */}
        <Card variant="default" padding="md" style={styles.deliveryCard}>
          <Text variant="subheading" weight="semibold" style={styles.deliveryTitle}>
            {t('cartScreen.deliveryTitle')}
          </Text>
          
          <View style={styles.deliveryOptions}>
            <Button
              variant={deliveryType === 'pickup' ? 'primary' : 'outline'}
              onPress={() => setDeliveryType('pickup')}
              style={styles.deliveryButton}
            >
              {deliveryType === 'pickup' ? '✓ ' : ''}{t('cartScreen.pickup')}
            </Button>
            <Button
              variant={deliveryType === 'delivery' ? 'primary' : 'outline'}
              onPress={() => setDeliveryType('delivery')}
              style={styles.deliveryButton}
            >
              {deliveryType === 'delivery' ? '✓ ' : ''}{t('cartScreen.delivery')}
            </Button>
          </View>
        </Card>

        {/* Order Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.summaryTitle}>
            {t('cartScreen.summaryTitle')}
          </Text>
          
          <View style={styles.summaryRow}>
            <Text variant="body">{t('cartScreen.subtotal')}</Text>
            <Text variant="body">₺{subtotal.toFixed(2)}</Text>
          </View>
          
          {deliveryType === 'delivery' && (
            <View style={styles.summaryRow}>
              <Text variant="body">{t('cartScreen.deliveryFee')}</Text>
              <Text variant="body">₺{deliveryFee.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text variant="subheading" weight="semibold">{t('cartScreen.total')}</Text>
            <Text variant="subheading" weight="semibold" color="primary">
              ₺{total.toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Checkout Button */}
      <View style={[styles.checkoutContainer, { backgroundColor: colors.background }]}>
        <Button
          variant="primary"
          fullWidth
          onPress={handleCheckout}
          style={styles.checkoutButton}
        >
          {t('cartScreen.checkout')}
        </Button>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyText: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  browseButton: {
    minWidth: 200,
  },
  itemsContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  itemCard: {
    marginBottom: 0,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quantityButton: {
    minWidth: 36,
  },
  quantityText: {
    minWidth: 24,
    textAlign: 'center',
  },
  deliveryCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  deliveryTitle: {
    marginBottom: Spacing.md,
  },
  deliveryOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  deliveryButton: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  totalRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  checkoutContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  checkoutButton: {
    marginBottom: 0,
  },
});
