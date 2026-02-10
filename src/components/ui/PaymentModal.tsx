import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { PaymentMethodCard } from './PaymentMethodCard';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { PaymentMethod, PaymentRequest, paymentService } from '../../services/paymentService';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from '../../hooks/useTranslation';
import { useCountry } from '../../context/CountryContext';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (transactionId: string) => void;
  paymentRequest: PaymentRequest;
  loading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  paymentRequest,
  loading = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { currentCountry } = useCountry();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    if (visible) {
      loadPaymentMethods();
    }
  }, [visible]);

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const methods = await paymentService.getPaymentMethods('current_user_id');
      setPaymentMethods(methods);
      
      // Select default payment method
      const defaultMethod = methods.find(method => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod);
      } else if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert(t('paymentModal.alerts.errorTitle'), t('paymentModal.alerts.loadMethodsError'));
    } finally {
      setLoadingMethods(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert(t('paymentModal.alerts.errorTitle'), t('paymentModal.alerts.selectMethod'));
      return;
    }

    try {
      setProcessing(true);

      // Check 3D Secure requirement
      const requires3DSecure = await paymentService.check3DSecure(
        selectedPaymentMethod.id,
        paymentRequest.amount
      );

      if (requires3DSecure) {
        Alert.alert(
          t('paymentModal.alerts.secureTitle'),
          t('paymentModal.alerts.secureMessage'),
          [
            { text: t('paymentModal.alerts.cancel'), style: 'cancel' },
            { text: t('paymentModal.alerts.continue'), onPress: () => processPaymentWithSecure() }
          ]
        );
      } else {
        await processPayment();
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      Alert.alert(t('paymentModal.alerts.errorTitle'), t('paymentModal.alerts.startError'));
      setProcessing(false);
    }
  };

  const processPayment = async () => {
    try {
      const request: PaymentRequest = {
        ...paymentRequest,
        paymentMethodId: selectedPaymentMethod!.id,
      };

      const result = await paymentService.processPayment(request);

      if (result.success && result.transactionId) {
        Alert.alert(
          t('paymentModal.alerts.successTitle'),
          t('paymentModal.alerts.successMessage'),
          [
            {
              text: t('paymentModal.alerts.ok'),
              onPress: () => {
                onPaymentSuccess(result.transactionId!);
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t('paymentModal.alerts.failedTitle'),
          result.error || t('paymentModal.alerts.failedMessage')
        );
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert(t('paymentModal.alerts.errorTitle'), t('paymentModal.alerts.processError'));
    } finally {
      setProcessing(false);
    }
  };

  const processPaymentWithSecure = async () => {
    // Simulate 3D Secure flow
    Alert.alert(
      t('paymentModal.alerts.secureShortTitle'),
      t('paymentModal.alerts.secureRedirect'),
      [
        {
          text: t('paymentModal.alerts.ok'),
          onPress: async () => {
            // Simulate 3D Secure success
            await new Promise(resolve => setTimeout(resolve, 2000));
            await processPayment();
          }
        }
      ]
    );
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      t('paymentModal.alerts.addMethodTitle'),
      t('paymentModal.alerts.addMethodMessage'),
      [
        { text: t('paymentModal.alerts.cancel'), style: 'cancel' },
        { text: t('paymentModal.alerts.goToSettings'), onPress: onClose }
      ]
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(currentLanguage === 'en' ? 'en-GB' : 'tr-TR', {
      style: 'currency',
      currency: currentCountry.currency,
    }).format(amount);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text variant="heading" style={styles.title}>
            {t('paymentModal.title')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
              {t('paymentModal.orderSummary')}
            </Text>
            <View style={styles.orderInfo}>
              <Text variant="body" style={{ color: colors.text }}>
                {paymentRequest.description}
              </Text>
              <Text variant="heading" weight="bold" style={{ color: colors.primary }}>
                {formatAmount(paymentRequest.amount)}
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
                {t('paymentModal.paymentMethod')}
              </Text>
              <TouchableOpacity
                onPress={handleAddPaymentMethod}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <MaterialIcons name="add" size={12} color={colors.background} />
                <Text variant="caption" style={{ color: colors.background, marginLeft: 4 }}>
                  {t('paymentModal.add')}
                </Text>
              </TouchableOpacity>
            </View>

            {loadingMethods ? (
              <View style={styles.loadingContainer}>
                <Text variant="body" color="textSecondary">
                  {t('paymentModal.loadingMethods')}
                </Text>
              </View>
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  paymentMethod={method}
                  isSelected={selectedPaymentMethod?.id === method.id}
                  onPress={() => setSelectedPaymentMethod(method)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                  {t('paymentModal.noMethods')}
                </Text>
                <TouchableOpacity
                  onPress={handleAddPaymentMethod}
                  style={[styles.addMethodButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                >
                  <Text variant="body" style={{ color: colors.primary }}>
                    {t('paymentModal.addFirstMethod')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Security Info */}
          <View style={[styles.securityInfo, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="shield" size={16} color={colors.success} />
            <Text variant="caption" style={{ color: colors.textSecondary, flex: 1, marginLeft: 8 }}>
              {t('paymentModal.securityNote')}
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button
            variant="outline"
            onPress={onClose}
            style={styles.cancelButton}
            disabled={processing}
          >
            {t('paymentModal.cancel')}
          </Button>
          <Button
            variant="primary"
            onPress={handlePayment}
            loading={processing}
            disabled={!selectedPaymentMethod || processing || loading}
            style={styles.payButton}
          >
            {t('paymentModal.pay', { amount: formatAmount(paymentRequest.amount) })}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  addMethodButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 2,
  },
});
