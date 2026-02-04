import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, Button } from '../ui';
import { Colors, Spacing } from '../../theme';
import { PaymentMethod, useWallet } from '../../context/WalletContext';
import { useTranslation } from '../../hooks/useTranslation';

interface PaymentMethodSelectorProps {
  selectedMethodId?: string;
  onMethodSelect: (methodId: string) => void;
  showAddButton?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethodId,
  onMethodSelect,
  showAddButton = true,
}) => {
  const { wallet, removePaymentMethod, setDefaultPaymentMethod } = useWallet();
  const { t } = useTranslation();
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>(null);

  const handleMethodPress = (method: PaymentMethod) => {
    if (expandedMethodId === method.id) {
      setExpandedMethodId(null);
    } else {
      setExpandedMethodId(method.id);
      onMethodSelect(method.id);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      await setDefaultPaymentMethod(methodId);
      Alert.alert(t('paymentMethodSelector.alerts.successTitle'), t('paymentMethodSelector.alerts.defaultUpdated'));
    } catch (error) {
      Alert.alert(t('paymentMethodSelector.alerts.errorTitle'), t('paymentMethodSelector.alerts.defaultUpdateFailed'));
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    Alert.alert(
      t('paymentMethodSelector.alerts.deleteTitle'),
      t('paymentMethodSelector.alerts.deleteMessage'),
      [
        { text: t('paymentMethodSelector.alerts.cancel'), style: 'cancel' },
        {
          text: t('paymentMethodSelector.alerts.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removePaymentMethod(methodId);
              if (expandedMethodId === methodId) {
                setExpandedMethodId(null);
              }
            } catch (error) {
              Alert.alert(t('paymentMethodSelector.alerts.errorTitle'), t('paymentMethodSelector.alerts.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  if (wallet.paymentMethods.length === 0) {
    return (
      <Card variant="default" padding="md" style={styles.container}>
        <Text variant="subheading" weight="semibold" style={styles.title}>
          {t('paymentMethodSelector.title')}
        </Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text variant="body" color="textSecondary" center style={styles.emptyText}>
            {t('paymentMethodSelector.empty')}
          </Text>
          {showAddButton && (
            <Button
              title={t('paymentMethodSelector.addCard')}
              onPress={() => {
                // TODO: Navigate to add payment method screen
                Alert.alert(t('paymentMethodSelector.alerts.comingSoonTitle'), t('paymentMethodSelector.alerts.comingSoonMessage'));
              }}
              style={styles.addButton}
            />
          )}
        </View>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" style={styles.container}>
      <Text variant="subheading" weight="semibold" style={styles.title}>
        {t('paymentMethodSelector.title')}
      </Text>

      <View style={styles.methodsList}>
        {wallet.paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethodId === method.id && styles.methodCardSelected,
              expandedMethodId === method.id && styles.methodCardExpanded,
            ]}
            onPress={() => handleMethodPress(method)}
            activeOpacity={0.7}
          >
            <View style={styles.methodHeader}>
              <View style={styles.methodLeft}>
                <Text style={styles.methodIcon}>
                  {getCardIcon(method.brand)}
                </Text>
                <View style={styles.methodInfo}>
                  <Text variant="body" weight="medium">
                    {formatCardBrand(method.brand)} •••• {method.last4}
                  </Text>
                  {method.expiryMonth && method.expiryYear && (
                    <Text variant="caption" color="textSecondary">
                      {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.methodRight}>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text variant="caption" style={styles.defaultBadgeText}>
                      {t('paymentMethodSelector.default')}
                    </Text>
                  </View>
                )}
                <Text style={styles.expandIcon}>
                  {expandedMethodId === method.id ? '▼' : '▶'}
                </Text>
              </View>
            </View>

            {/* Expanded Actions */}
            {expandedMethodId === method.id && (
              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Text variant="caption" color="primary">
                      {t('paymentMethodSelector.setDefault')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRemoveMethod(method.id)}
                >
                  <Text variant="caption" color="error">
                    {t('paymentMethodSelector.delete')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {showAddButton && (
        <TouchableOpacity
          style={styles.addMethodButton}
          onPress={() => {
            // TODO: Navigate to add payment method screen
            Alert.alert(t('paymentMethodSelector.alerts.comingSoonTitle'), t('paymentMethodSelector.alerts.comingSoonMessage'));
          }}
        >
          <Text style={styles.addMethodIcon}>➕</Text>
          <Text variant="body" color="primary" weight="medium">
            {t('paymentMethodSelector.addNewCard')}
          </Text>
        </TouchableOpacity>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    marginBottom: Spacing.lg,
  },
  addButton: {
    marginTop: Spacing.md,
  },
  methodsList: {
    gap: Spacing.sm,
  },
  methodCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  methodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  methodCardExpanded: {
    borderColor: Colors.primary,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  methodInfo: {
    flex: 1,
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  defaultBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addMethodIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    color: Colors.primary,
  },
});
