import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text variant="heading">Siparişlerim</Text>
        <Text variant="body" style={styles.description}>
          Geçmiş ve aktif siparişlerinizi burada görüntüleyebilirsiniz.
        </Text>
      </View>
    </View>
  );
}

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
  description: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});

