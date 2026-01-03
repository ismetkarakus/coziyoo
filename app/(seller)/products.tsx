import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui';
import { TopBar } from '@/src/components/layout';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';

export default function SellerProductsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="" 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
        rightComponent={
          <Text variant="heading" weight="bold" color="primary" style={{ fontSize: 20 }}>
            Ürünler
          </Text>
        }
      />
      <View style={styles.content}>
        <Text variant="heading">Ürünleriniz</Text>
        <Text variant="body" style={styles.description}>
          Ürün listelerinizi ve stok durumunuzu yönetin.
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

