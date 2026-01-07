import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { PaymentMethod } from '../../services/paymentService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  isSelected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  isSelected = false,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getCardIcon = () => {
    switch (paymentMethod.brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        if (paymentMethod.type === 'digital_wallet') {
          return '📱';
        }
        return '💳';
    }
  };

  const getCardColor = () => {
    switch (paymentMethod.brand?.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
        return '#006FCF';
      default:
        return colors.primary;
    }
  };

  const formatExpiryDate = () => {
    if (paymentMethod.expiryMonth && paymentMethod.expiryYear) {
      return `${paymentMethod.expiryMonth.toString().padStart(2, '0')}/${paymentMethod.expiryYear.toString().slice(-2)}`;
    }
    return '';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardIcon}>{getCardIcon()}</Text>
            <View style={styles.cardDetails}>
              <Text variant="body" weight="medium" style={{ color: colors.text }}>
                {paymentMethod.name}
              </Text>
              {paymentMethod.last4 && (
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                  •••• •••• •••• {paymentMethod.last4}
                </Text>
              )}
              {formatExpiryDate() && (
                <Text variant="caption" style={{ color: colors.textSecondary }}>
                  {formatExpiryDate()}
                </Text>
              )}
            </View>
          </View>

          {paymentMethod.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: colors.success }]}>
              <Text variant="caption" style={{ color: colors.background }}>
                Varsayılan
              </Text>
            </View>
          )}
        </View>

        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
              >
                <FontAwesome name="edit" size={14} color={colors.background} />
                <Text variant="caption" style={{ color: colors.background, marginLeft: 4 }}>
                  Düzenle
                </Text>
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={[styles.actionButton, { backgroundColor: colors.error }]}
              >
                <FontAwesome name="trash" size={14} color={colors.background} />
                <Text variant="caption" style={{ color: colors.background, marginLeft: 4 }}>
                  Sil
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
          <FontAwesome name="check" size={12} color={colors.background} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  cardDetails: {
    flex: 1,
    gap: 2,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

