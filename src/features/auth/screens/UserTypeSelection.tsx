import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';

export const UserTypeSelection: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleBuyerSelection = () => {
    router.push('/(auth)/buyer-register');
  };

  const handleSellerSelection = () => {
    router.push('/(auth)/seller-register');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="heading" weight="bold" style={styles.logoText}>
            Coziyoo
          </Text>
          <Text variant="subheading" style={styles.sloganText}>
            {t('homeScreen.slogan') || 'Ev Yemekleri'}
          </Text>
          <Text variant="body" center style={styles.title}>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingBottom: 60, // Small bottom padding to nudge everything slightly up from true center
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72, // Explicit line height to prevent clipping
    marginBottom: Spacing.xs,
    color: '#2E2E2E',
  },
  sloganText: {
    fontSize: 24,
    color: '#8E8E93',
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    lineHeight: 24,
    marginTop: Spacing.md,
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


















