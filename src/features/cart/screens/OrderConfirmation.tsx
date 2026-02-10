import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const OrderConfirmation: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const handleBackToHome = () => {
    router.replace('/(buyer)');
  };

  const handleViewOrders = () => {
    router.push('/(buyer)/notifications');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('orderConfirmationScreen.title')} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>
        
        <Text variant="title" center style={styles.title}>
          {t('orderConfirmationScreen.headline')}
        </Text>
        
        <Text variant="body" center color="textSecondary" style={styles.description}>
          {t('orderConfirmationScreen.description')}
        </Text>
        
        <View style={styles.orderInfo}>
          <Text variant="subheading" weight="semibold" center style={styles.orderNumber}>
            {t('orderConfirmationScreen.orderNo')}
          </Text>
          <Text variant="caption" center color="textSecondary">
            {t('orderConfirmationScreen.eta')}
          </Text>
        </View>
        
        <View style={styles.buttons}>
          <Button
            variant="primary"
            fullWidth
            onPress={handleBackToHome}
            style={styles.button}
          >
            {t('orderConfirmationScreen.backHome')}
          </Button>
          
          <Button
            variant="outline"
            fullWidth
            onPress={handleViewOrders}
          >
            {t('orderConfirmationScreen.track')}
          </Button>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  successIcon: {
    fontSize: 80,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  orderNumber: {
    marginBottom: Spacing.sm,
  },
  buttons: {
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    marginBottom: Spacing.sm,
  },
});

















