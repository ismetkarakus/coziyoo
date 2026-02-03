import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';

export const UserTypeSelection: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const handleBuyerSelection = () => {
    router.push('/(auth)/buyer-register');
  };

  const handleSellerSelection = () => {
    router.push('/(auth)/seller-register');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="heading" center style={styles.title}>
            {t('authUserType.title')}
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button 
            variant="primary" 
            fullWidth 
            onPress={handleBuyerSelection}
            style={styles.button}
          >
            {t('authUserType.buyer')}
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onPress={handleSellerSelection}
            style={styles.button}
          >
            {t('authUserType.seller')}
          </Button>
        </View>

        <View style={styles.note}>
          <Text variant="caption" center color="textSecondary">
            {t('authUserType.note')}
          </Text>
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
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    textAlign: 'center',
    lineHeight: 32,
  },
  buttons: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  button: {
    marginBottom: Spacing.sm,
  },
  note: {
    alignItems: 'center',
  },
});


















