import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';

export const Welcome: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/(auth)/user-type-selection');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="title" center style={styles.title}>
            {t('authWelcome.title')}
          </Text>
          <Text variant="subheading" center color="textSecondary" style={styles.subtitle}>
            {t('authWelcome.subtitle')}
          </Text>
          <Text variant="body" center color="textSecondary" style={styles.description}>
            {t('authWelcome.description')}
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button 
            variant="primary" 
            fullWidth 
            onPress={handleSignIn}
            style={styles.button}
          >
            {t('authWelcome.signIn')}
          </Button>
          <Button 
            variant="outline" 
            fullWidth 
            onPress={handleSignUp}
          >
            {t('authWelcome.signUp')}
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
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    gap: Spacing.md,
  },
  button: {
    marginBottom: Spacing.md,
  },
});

















