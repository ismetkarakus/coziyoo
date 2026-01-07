import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const UserTypeSelection: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
            Nasıl devam etmek istiyorsun?
          </Text>
        </View>

        <View style={styles.buttons}>
          <Button 
            variant="primary" 
            fullWidth 
            onPress={handleBuyerSelection}
            style={styles.button}
          >
            Yemek Satın Almak İstiyorum
          </Button>
          <Button 
            variant="secondary" 
            fullWidth 
            onPress={handleSellerSelection}
            style={styles.button}
          >
            Yemek Satmak İstiyorum
          </Button>
        </View>

        <View style={styles.note}>
          <Text variant="caption" center color="textSecondary">
            Not: İstediğin zaman satıcı olabilirsin.
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










