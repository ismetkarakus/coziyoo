import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';

export const SignIn: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn, loading } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const testCredentials = {
    buyer: { email: 'test@cazi.com', password: '123456' },
    seller: { email: 'satici@cazi.com', password: '123456' },
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (override?: { email: string; password: string }) => {
    const email = override?.email ?? formData.email;
    const password = override?.password ?? formData.password;

    if (!email || !password) {
      Alert.alert(t('authSignIn.errorTitle'), t('authSignIn.errorMessage'));
      return;
    }

    try {
      await signIn(email, password);
      // Giriş başarılı - AuthContext otomatik olarak yönlendirecek
    } catch (error: any) {
      Alert.alert(t('authSignIn.signInErrorTitle'), error.message);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/(auth)/user-type-selection');
  };

  const handleTestLogin = async (role: 'buyer' | 'seller') => {
    const creds = testCredentials[role];
    setFormData({ email: creds.email, password: creds.password });
    try {
      await handleSignIn(creds);
      // AuthGuard will route based on role
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="heading" center style={styles.title}>
              {t('authSignIn.title')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.subtitle}>
              {t('authSignIn.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              label={t('authSignIn.emailLabel')}
              value={formData.email}
              onChangeText={handleInputChange('email')}
              placeholder={t('authSignIn.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <FormField
              label={t('authSignIn.passwordLabel')}
              value={formData.password}
              onChangeText={handleInputChange('password')}
              placeholder={t('authSignIn.passwordPlaceholder')}
              secureTextEntry
              required
            />

            <Button 
              variant="primary"
              fullWidth
              onPress={handleSignIn}
              loading={loading}
              style={styles.signInButton}
            >
              {t('authSignIn.signIn')}
            </Button>

            <Button 
              variant="ghost"
              fullWidth
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              {t('authSignIn.forgotPassword')}
            </Button>

            <View style={styles.testButtonsRow}>
              <Button
                variant="outline"
                onPress={() => handleTestLogin('buyer')}
                style={styles.testButton}
              >
                Alıcı (Test)
              </Button>
              <Button
                variant="outline"
                onPress={() => handleTestLogin('seller')}
                style={styles.testButton}
              >
                Satıcı (Test)
              </Button>
            </View>
          </View>

          <View style={styles.footer}>
            <Text variant="body" center color="textSecondary">
              {t('authSignIn.noAccount')}{' '}
              <Text 
                variant="body" 
                color="primary" 
                onPress={handleSignUp}
                style={styles.signUpLink}
              >
                {t('authSignIn.signUp')}
              </Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: Spacing['2xl'],
  },
  signInButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  forgotButton: {
    marginBottom: Spacing.lg,
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  testButton: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
  },
  signUpLink: {
    textDecorationLine: 'underline',
  },
});

