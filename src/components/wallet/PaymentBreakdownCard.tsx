import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from '../ui';
import { Colors, Spacing } from '../../theme';
import { PaymentBreakdown } from '../../context/WalletContext';

interface PaymentBreakdownCardProps {
  breakdown: PaymentBreakdown;
  showDetails?: boolean;
}

export const PaymentBreakdownCard: React.FC<PaymentBreakdownCardProps> = ({
  breakdown,
  showDetails = true,
}) => {
  const formatCurrency = (amount: number) => `₺${amount.toFixed(2)}`;

  const hasWalletPayment = breakdown.wallet > 0 || breakdown.earnings > 0;
  const hasCardPayment = breakdown.card > 0;

  return (
    <Card variant="default" padding="md" style={styles.container}>
      <Text variant="subheading" weight="semibold" style={styles.title}>
        Ödeme Dağılımı
      </Text>

      <View style={styles.breakdownContainer}>
        {/* Wallet Payment */}
        {breakdown.wallet > 0 && (
          <View style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>💰</Text>
              <Text variant="body" style={styles.paymentLabel}>
                Cüzdan Bakiyesi
              </Text>
            </View>
            <Text variant="body" weight="medium" color="success">
              -{formatCurrency(breakdown.wallet)}
            </Text>
          </View>
        )}

        {/* Earnings Payment */}
        {breakdown.earnings > 0 && (
          <View style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>📈</Text>
              <Text variant="body" style={styles.paymentLabel}>
                Çekilebilir Kazançlar
              </Text>
            </View>
            <Text variant="body" weight="medium" color="success">
              -{formatCurrency(breakdown.earnings)}
            </Text>
          </View>
        )}

        {/* Card Payment */}
        {breakdown.card > 0 && (
          <View style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentIcon}>💳</Text>
              <Text variant="body" style={styles.paymentLabel}>
                Kart ile Ödeme
              </Text>
            </View>
            <Text variant="body" weight="medium" color="error">
              -{formatCurrency(breakdown.card)}
            </Text>
          </View>
        )}

        {/* No Card Payment Message */}
        {!hasCardPayment && hasWalletPayment && (
          <View style={styles.successMessage}>
            <Text style={styles.successIcon}>✨</Text>
            <Text variant="caption" color="success" style={styles.successText}>
              Tamamen cüzdanınızdan ödenecek!
            </Text>
          </View>
        )}
      </View>

      {/* Total */}
      <View style={styles.totalRow}>
        <Text variant="subheading" weight="semibold">
          Toplam
        </Text>
        <Text variant="subheading" weight="bold" color="primary">
          {formatCurrency(breakdown.total)}
        </Text>
      </View>

      {/* Payment Summary */}
      {showDetails && (
        <View style={styles.summaryContainer}>
          <Text variant="caption" color="textSecondary" style={styles.summaryText}>
            {hasCardPayment 
              ? `Cüzdan: ${formatCurrency(breakdown.wallet + breakdown.earnings)} • Kart: ${formatCurrency(breakdown.card)}`
              : 'Tüm tutar cüzdanınızdan ödenecek'
            }
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  breakdownContainer: {
    marginBottom: Spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  paymentLabel: {
    flex: 1,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.success + '10',
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  successIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  successText: {
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  summaryContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
