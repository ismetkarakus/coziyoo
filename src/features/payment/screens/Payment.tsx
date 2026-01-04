import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCart } from '../../../context/CartContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Mock saved card data
const SAVED_CARDS = [
  {
    id: '1',
    type: 'visa',
    lastFour: '4532',
    expiryMonth: '12',
    expiryYear: '26',
    holderName: 'Ahmet Yılmaz',
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    lastFour: '8765',
    expiryMonth: '08',
    expiryYear: '25',
    holderName: 'Ahmet Yılmaz',
    isDefault: false,
  },
];

type PaymentMethod = 'card' | 'apple_pay' | 'google_pay';

export const Payment: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [selectedCard, setSelectedCard] = useState(SAVED_CARDS.find(card => card.isDefault)?.id || SAVED_CARDS[0]?.id);

  const subtotal = getTotalPrice();
  const deliveryFee = 5;
  const commissionRate = 0.15; // %15 komisyon
  const commissionAmount = subtotal * commissionRate;
  const sellerEarnings = subtotal - commissionAmount;
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
      Alert.alert('Hata', 'Lütfen bir kart seçin.');
      return;
    }

    // Simulate payment processing
    Alert.alert(
      'Ödeme İşlemi',
      'Ödemeniz işleniyor...',
      [
        {
          text: 'Tamam',
          onPress: () => {
            // Simulate successful payment
            setTimeout(() => {
              Alert.alert(
                'Başarılı!',
                'Ödemeniz başarıyla tamamlandı. Siparişiniz hazırlanmaya başlandı.',
                [
                  {
                    text: 'Tamam',
                    onPress: () => {
                      clearCart();
                      router.push('/(tabs)/orders');
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
          <FontAwesome name="check-circle" size={20} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSavedCard = (card: any) => (
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
          <FontAwesome name="check-circle" size={20} color="white" />
        )}
        {card.isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.success }]}>
            <Text variant="caption" style={{ color: 'white', fontSize: 10 }}>
              Varsayılan
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Ödeme" 
        leftIcon="arrow-left"
        onLeftPress={() => router.back()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Sipariş Özeti
          </Text>
          
          <View style={styles.summaryRow}>
            <Text variant="body">Ara Toplam</Text>
            <Text variant="body">₺{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="body">Teslimat Ücreti</Text>
            <Text variant="body">₺{deliveryFee.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text variant="subheading" weight="semibold">Toplam Tutar</Text>
            <Text variant="subheading" weight="semibold" color="primary">
              ₺{total.toFixed(2)}
            </Text>
          </View>
          
          {/* Seller Commission Info */}
          <View style={styles.commissionInfo}>
            <Text variant="caption" color="textSecondary" style={styles.commissionTitle}>
              Satıcı Komisyon Bilgisi:
            </Text>
            <View style={styles.commissionRow}>
              <Text variant="caption" color="textSecondary">
                Yemek Bedeli: ₺{subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.commissionRow}>
              <Text variant="caption" color="textSecondary">
                Platform Komisyonu (%15): -₺{commissionAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.commissionRow}>
              <Text variant="caption" weight="medium" color="textSecondary">
                Satıcının Alacağı: ₺{sellerEarnings.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Payment Methods */}
        <Card variant="default" padding="md" style={styles.paymentCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Ödeme Yöntemi
          </Text>
          
          <View style={styles.paymentMethods}>
            {renderPaymentMethod('card', 'Kredi/Banka Kartı', '💳')}
            {Platform.OS === 'ios' && renderPaymentMethod('apple_pay', 'Apple Pay', '🍎')}
            {Platform.OS === 'android' && renderPaymentMethod('google_pay', 'Google Pay', '🟢')}
          </View>
        </Card>

        {/* Saved Cards (only show when card payment is selected) */}
        {selectedPaymentMethod === 'card' && SAVED_CARDS.length > 0 && (
          <Card variant="default" padding="md" style={styles.cardsCard}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              Kayıtlı Kartlarım
            </Text>
            
            <View style={styles.savedCards}>
              {SAVED_CARDS.map(renderSavedCard)}
            </View>
            
            <TouchableOpacity style={styles.addCardButton}>
              <FontAwesome name="plus" size={16} color={colors.primary} />
              <Text variant="body" color="primary" style={{ marginLeft: Spacing.sm }}>
                Yeni Kart Ekle
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
                  {selectedPaymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                </Text>
                <Text variant="caption" color="textSecondary">
                  Güvenli ve hızlı ödeme
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
            ? '🍎 Apple Pay ile Öde' 
            : selectedPaymentMethod === 'google_pay'
            ? '🟢 Google Pay ile Öde'
            : `₺${total.toFixed(2)} Öde`
          }
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
  commissionInfo: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#F8F9FA',
    padding: Spacing.sm,
    borderRadius: 8,
  },
  commissionTitle: {
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  commissionRow: {
    marginBottom: 2,
  },
});
