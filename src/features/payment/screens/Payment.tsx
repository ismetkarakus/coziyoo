import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCart } from '../../../context/CartContext';

type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';

interface SavedCard {
  id: string;
  type: 'visa' | 'mastercard';
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
}

export const Payment: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: '1',
      type: 'visa',
      lastFour: '4532',
      expiryMonth: '12',
      expiryYear: '26',
      holderName: t('paymentScreen.mockCardHolder'),
      isDefault: true,
    },
    {
      id: '2',
      type: 'mastercard',
      lastFour: '8765',
      expiryMonth: '08',
      expiryYear: '25',
      holderName: t('paymentScreen.mockCardHolder'),
      isDefault: false,
    },
  ]);
  const defaultCardId = savedCards.find(card => card.isDefault)?.id || savedCards[0]?.id;
  const [selectedCard, setSelectedCard] = useState(defaultCardId);

  const resolveDeliveryOption = (item: typeof cartItems[number]) => {
    if (item.deliveryOption) return item.deliveryOption;
    const options = item.availableOptions && item.availableOptions.length > 0
      ? item.availableOptions
      : (['pickup', 'delivery'] as ('pickup' | 'delivery')[]);
    return options.includes('pickup') ? 'pickup' : options[0];
  };

  const subtotal = getTotalPrice();
  const deliveryFee = cartItems.reduce((sum, item) => {
    return resolveDeliveryOption(item) === 'delivery' ? sum + (item.deliveryFee || 0) : sum;
  }, 0);
  const total = subtotal + deliveryFee;

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      default:
        return '💳';
    }
  };

  const handlePayment = () => {
    if (selectedPaymentMethod === 'card' && !selectedCard) {
      Alert.alert(t('paymentScreen.alerts.errorTitle'), t('paymentScreen.alerts.selectCard'));
      return;
    }

    // Simulate payment processing
    Alert.alert(
      t('paymentScreen.alerts.processingTitle'),
      t('paymentScreen.alerts.processingMessage'),
      [
        {
          text: t('paymentScreen.alerts.ok'),
          onPress: () => {
            // Simulate successful payment
            setTimeout(() => {
              Alert.alert(
                t('paymentScreen.alerts.successTitle'),
                t('paymentScreen.alerts.successMessage'),
                [
                  {
                    text: t('paymentScreen.alerts.ok'),
                    onPress: () => {
                      clearCart();
                      router.push('/(buyer)/orders');
                    },
                  },
                ]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  const handleAddCard = () => {
    const randomLastFour = `${Math.floor(1000 + Math.random() * 9000)}`;
    const newCard: SavedCard = {
      id: `${Date.now()}`,
      type: Math.random() > 0.5 ? 'visa' : 'mastercard',
      lastFour: randomLastFour,
      expiryMonth: '12',
      expiryYear: '29',
      holderName: t('paymentScreen.mockCardHolder'),
      isDefault: false,
    };

    setSavedCards((prevCards) => [...prevCards, newCard]);
    setSelectedCard(newCard.id);

    Alert.alert(
      currentLanguage === 'tr' ? 'Kart Eklendi' : 'Card Added',
      currentLanguage === 'tr'
        ? `Yeni kartiniz eklendi (**** ${randomLastFour}).`
        : `Your new card was added (**** ${randomLastFour}).`
    );
  };

  const renderPaymentMethod = (method: PaymentMethod, title: string, icon: string, available: boolean = true) => (
    <TouchableOpacity
      key={method}
      onPress={() => available && setSelectedPaymentMethod(method)}
      style={[
        styles.paymentMethodCard,
        {
          backgroundColor: selectedPaymentMethod === method ? colors.primary : colors.card,
          borderColor: selectedPaymentMethod === method ? colors.primary : colors.border,
          opacity: available ? 1 : 0.5,
        },
      ]}
      disabled={!available}
    >
      <View style={styles.paymentMethodContent}>
        <Text style={styles.paymentMethodIcon}>{icon}</Text>
        <Text
          variant="body"
          weight="medium"
          style={{
            color: selectedPaymentMethod === method ? 'white' : colors.text,
            flex: 1,
          }}
        >
          {title}
        </Text>
        {selectedPaymentMethod === method && (
          <MaterialIcons name="check-circle" size={20} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSavedCard = (card: SavedCard) => (
    <TouchableOpacity
      key={card.id}
      onPress={() => setSelectedCard(card.id)}
      style={[
        styles.savedCardItem,
        {
          backgroundColor: selectedCard === card.id ? colors.primary : colors.card,
          borderColor: selectedCard === card.id ? colors.primary : colors.border,
        },
      ]}
    >
      <View style={styles.savedCardContent}>
        <Text style={styles.cardIcon}>{getCardIcon(card.type)}</Text>
        <View style={styles.cardInfo}>
          <Text
            variant="body"
            weight="medium"
            style={{
              color: selectedCard === card.id ? 'white' : colors.text,
            }}
          >
            •••• •••• •••• {card.lastFour}
          </Text>
          <Text
            variant="caption"
            style={{
              color: selectedCard === card.id ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
            }}
          >
            {card.holderName} • {card.expiryMonth}/{card.expiryYear}
          </Text>
        </View>
        {selectedCard === card.id && (
          <MaterialIcons name="check-circle" size={20} color="white" />
        )}
        {card.isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.success }]}>
            <Text variant="caption" style={{ color: 'white', fontSize: 10 }}>
              {t('paymentScreen.default')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('paymentScreen.title')} 
        showBack
        onBack={() => router.replace('/(buyer)/buyer-profile')}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t('paymentScreen.summaryTitle')}
          </Text>
          
          <View style={styles.summaryRow}>
            <Text variant="body">{t('paymentScreen.subtotal')}</Text>
            <Text variant="body">₺{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="body">{t('paymentScreen.deliveryFee')}</Text>
            <Text variant="body">₺{deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text variant="subheading" weight="semibold">{t('paymentScreen.total')}</Text>
            <Text variant="subheading" weight="semibold" color="primary">
              ₺{total.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Payment Methods */}
        <Card variant="default" padding="md" style={styles.paymentCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t('paymentScreen.methodTitle')}
          </Text>
          
          <View style={styles.paymentMethods}>
            {renderPaymentMethod('card', t('paymentScreen.methodCard'), '💳')}
            {Platform.OS === 'ios' && renderPaymentMethod('apple_pay', t('paymentScreen.methodApple'), '🍎')}
            {Platform.OS === 'android' && renderPaymentMethod('google_pay', t('paymentScreen.methodGoogle'), '🟢')}
          </View>
        </Card>

        {/* Saved Cards (only show when card payment is selected) */}
        {selectedPaymentMethod === 'card' && savedCards.length > 0 && (
          <Card variant="default" padding="md" style={styles.cardsCard}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {t('paymentScreen.savedCards')}
            </Text>
            
            <View style={styles.savedCards}>
              {savedCards.map(renderSavedCard)}
            </View>
            
            <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard} activeOpacity={0.75}>
              <MaterialIcons name="add" size={16} color={colors.primary} />
              <Text variant="body" color="primary" style={{ marginLeft: Spacing.sm }}>
                {t('paymentScreen.addCard')}
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Digital Wallet Info */}
        {(selectedPaymentMethod === 'apple_pay' || selectedPaymentMethod === 'google_pay') && (
          <Card variant="default" padding="md" style={styles.walletCard}>
            <View style={styles.walletInfo}>
              <Text style={styles.walletIcon}>
                {selectedPaymentMethod === 'apple_pay' ? '🍎' : '🟢'}
              </Text>
              <View style={styles.walletText}>
                <Text variant="body" weight="medium">
                  {selectedPaymentMethod === 'apple_pay' ? t('paymentScreen.methodApple') : t('paymentScreen.methodGoogle')}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {t('paymentScreen.walletFast')}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Pay Button */}
      <View style={[styles.payButtonContainer, { backgroundColor: colors.background }]}>
        <Button
          variant="primary"
          fullWidth
          onPress={handlePayment}
          style={styles.payButton}
        >
          {selectedPaymentMethod === 'apple_pay' 
            ? t('paymentScreen.payWithApple') 
            : selectedPaymentMethod === 'google_pay'
            ? t('paymentScreen.payWithGoogle')
            : t('paymentScreen.payAmount', { amount: total.toFixed(2) })
          }
        </Button>
        <Button
          variant="outline"
          fullWidth
          onPress={() => router.replace('/(buyer)/buyer-profile')}
          style={styles.cancelButton}
        >
          {t('paymentScreen.cancel')}
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
  summaryCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  paymentCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardsCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  walletCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
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
  paymentMethods: {
    gap: Spacing.sm,
  },
  paymentMethodCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: Spacing.md,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentMethodIcon: {
    fontSize: 24,
  },
  savedCards: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  savedCardItem: {
    borderRadius: 12,
    borderWidth: 2,
    padding: Spacing.md,
    position: 'relative',
  },
  savedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  defaultBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  walletIcon: {
    fontSize: 32,
  },
  walletText: {
    flex: 1,
  },
  payButtonContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  payButton: {
    marginBottom: 0,
  },
  cancelButton: {
    marginTop: Spacing.sm,
  },
});
