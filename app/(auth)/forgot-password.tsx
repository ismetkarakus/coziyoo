import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@/src/components/ui';
import { FormField } from '@/src/components/forms';
import { Colors, Spacing } from '@/src/theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useState } from 'react';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [email, setEmail] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text variant="title" center style={styles.title}>
          Forgot Password
        </Text>
        <Text variant="body" center color="textSecondary" style={styles.subtitle}>
          Enter your email to reset your password
        </Text>
        
        <View style={styles.form}>
          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          
          <Button variant="primary" fullWidth style={styles.resetButton}>
            Send Reset Link
          </Button>
        </View>
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
    padding: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
  },
  resetButton: {
    marginTop: Spacing.md,
  },
});





