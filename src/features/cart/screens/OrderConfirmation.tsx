import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const OrderConfirmation: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleBackToHome = () => {
    router.replace('/(tabs)/');
  };

  const handleViewOrders = () => {
    router.push('/(tabs)/notifications');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Sipariş Onayı" />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>
        
        <Text variant="title" center style={styles.title}>
          Siparişin Alındı!
        </Text>
        
        <Text variant="body" center color="textSecondary" style={styles.description}>
          Siparişin satıcıya iletildi. Durum güncellemeleri ve mesajlar bildirim olarak gönderilecektir.
        </Text>
        
        <View style={styles.orderInfo}>
          <Text variant="subheading" weight="semibold" center style={styles.orderNumber}>
            Sipariş No: #12345
          </Text>
          <Text variant="caption" center color="textSecondary">
            Tahmini hazırlık süresi: 30-45 dakika
          </Text>
        </View>
        
        <View style={styles.buttons}>
          <Button
            variant="primary"
            fullWidth
            onPress={handleBackToHome}
            style={styles.button}
          >
            Ana Sayfaya Dön
          </Button>
          
          <Button
            variant="outline"
            fullWidth
            onPress={handleViewOrders}
          >
            Sipariş Durumunu Takip Et
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






