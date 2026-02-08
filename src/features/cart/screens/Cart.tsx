import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCart } from '../../../context/CartContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';
import { mockUserService } from '../../../services/mockUserService';

export const Cart: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { cartItems, updateQuantity, updateDeliveryOption, getTotalPrice } = useCart();
  const { t } = useTranslation();
  const { user, userData } = useAuth();
  const [userAllergies, setUserAllergies] = React.useState<string[]>([]);

  const getAvailableOptions = (item: typeof cartItems[number]) => {
    if (item.availableOptions && item.availableOptions.length > 0) {
      return item.availableOptions;
    }
    return ['pickup', 'delivery'] as ('pickup' | 'delivery')[];
  };

  const resolveDeliveryOption = (item: typeof cartItems[number]) => {
    if (item.deliveryOption) return item.deliveryOption;
    const options = getAvailableOptions(item);
    return options.includes('pickup') ? 'pickup' : options[0];
  };

  useEffect(() => {
    cartItems.forEach(item => {
      if (!item.deliveryOption) {
        updateDeliveryOption(item.id, resolveDeliveryOption(item));
      }
    });
  }, [cartItems, updateDeliveryOption]);

  useEffect(() => {
    const loadAllergies = async () => {
      const record =
        (await mockUserService.getUserByUid(user?.uid || userData?.uid)) ||
        (await mockUserService.getUserByEmail(userData?.email || user?.email));
      setUserAllergies((record?.allergicTo || []).map(item => item.toLowerCase()));
    };
    loadAllergies();
  }, [user?.uid, userData?.uid, user?.email, userData?.email]);

  const getAllergenMatches = useMemo(() => {
    return new Map(
      cartItems.map(item => {
        const allergens = (item as any).allergens || [];
        const matches = allergens
          .map((a: string) => a.toLowerCase())
          .filter((a: string) => userAllergies.includes(a));
        return [item.id, matches];
      })
    );
  }, [cartItems, userAllergies]);

  const subtotal = getTotalPrice();
  const deliveryFee = cartItems.reduce((sum, item) => {
    const deliveryOption = resolveDeliveryOption(item);
    return deliveryOption === 'delivery' ? sum + (item.deliveryFee || 0) : sum;
  }, 0);
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

              {getAllergenMatches.get(item.id)?.length ? (
                <View style={styles.allergenCard}>
                  <View style={styles.allergenBar} />
                  <View style={styles.allergenContent}>
                    <View style={styles.allergenHeader}>
                      <View style={styles.allergenIcon}>
                        <Text variant="caption" weight="bold" style={styles.allergenIconText}>!</Text>
                      </View>
                      <Text variant="body" weight="semibold" style={styles.allergenTitle}>
                        Alerjen: {getAllergenMatches.get(item.id)?.join(', ')}
                      </Text>
                    </View>
                    <Text variant="caption" style={styles.allergenSubtitle}>
                      Alerjin varsa sipariş vermeden önce kontrol et.
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.itemDeliveryRow}>
                <Text variant="caption" color="textSecondary">
                  {t('cartScreen.deliveryTitle')}
                </Text>
                {getAvailableOptions(item).length === 1 ? (
                  <Text variant="caption" color="textSecondary">
                    {getAvailableOptions(item)[0] === 'pickup'
                      ? t('cartScreen.onlyPickupNotice')
                      : t('cartScreen.onlyDeliveryNotice', {
                          fee: (item.deliveryFee || 0).toFixed(2),
                        })}
                  </Text>
                ) : (
                  <View style={styles.itemDeliveryOptions}>
                    {getAvailableOptions(item).includes('pickup') && (
                      <Button
                        variant={resolveDeliveryOption(item) === 'pickup' ? 'primary' : 'outline'}
                        size="sm"
                        onPress={() => updateDeliveryOption(item.id, 'pickup')}
                        style={styles.deliveryButton}
                      >
                        {t('cartScreen.pickup')}
                      </Button>
                    )}
                    {getAvailableOptions(item).includes('delivery') && (
                      <Button
                        variant={resolveDeliveryOption(item) === 'delivery' ? 'primary' : 'outline'}
                        size="sm"
                        onPress={() => updateDeliveryOption(item.id, 'delivery')}
                        style={styles.deliveryButton}
                      >
                        {t('cartScreen.delivery')}
                        {item.deliveryFee ? ` +₺${item.deliveryFee.toFixed(2)}` : ''}
                      </Button>
                    )}
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        {/* Order Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.summaryTitle}>
            {t('cartScreen.summaryTitle')}
          </Text>
          
          <View style={styles.summaryRow}>
            <Text variant="body">{t('cartScreen.subtotal')}</Text>
            <Text variant="body">₺{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="body">{t('cartScreen.deliveryFee')}</Text>
            <Text variant="body">₺{deliveryFee.toFixed(2)}</Text>
          </View>
          
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
  itemDeliveryRow: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  itemDeliveryOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  deliveryButton: {
    flex: 1,
    minHeight: 36,
  },
  allergenCard: {
    marginTop: Spacing.sm,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  allergenBar: {
    width: 4,
    backgroundColor: '#B42318',
  },
  allergenContent: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  allergenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  allergenIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#B42318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergenIconText: {
    color: '#B42318',
    fontSize: 12,
  },
  allergenTitle: {
    color: '#101828',
  },
  allergenSubtitle: {
    color: '#475467',
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
