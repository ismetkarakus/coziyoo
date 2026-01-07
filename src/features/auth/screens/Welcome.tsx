import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const Welcome: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleSignUp = () => {
    router.push('/(auth)/user-type-selection');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="title" center style={styles.title}>
            Cazi
          </Text>
          <Text variant="subheading" center color="textSecondary" style={styles.subtitle}>
            Ev Yemekleri, Gerçek Lezzet
          </Text>
          <Text variant="body" center color="textSecondary" style={styles.description}>
            Cazi'ye Hoş Geldin. Evde yapılan taze yemekleri keşfet veya kendi yemeklerini sat.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button 
            variant="primary" 
            fullWidth 
            onPress={handleSignIn}
            style={styles.button}
          >
            Giriş Yap
          </Button>
          <Button 
            variant="outline" 
            fullWidth 
            onPress={handleSignUp}
          >
            Kayıt Ol
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












