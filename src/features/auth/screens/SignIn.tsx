import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';

export const SignIn: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      await signIn(formData.email, formData.password);
      // Giriş başarılı - AuthContext otomatik olarak yönlendirecek
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/(auth)/user-type-selection');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="heading" center style={styles.title}>
              Giriş Yap
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.subtitle}>
              Hesabına giriş yap ve lezzetli yemekleri keşfet
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="E-posta"
              value={formData.email}
              onChangeText={handleInputChange('email')}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <FormField
              label="Şifre"
              value={formData.password}
              onChangeText={handleInputChange('password')}
              placeholder="Şifrenizi girin"
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
              Giriş Yap
            </Button>

            <Button 
              variant="ghost"
              fullWidth
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              Şifremi Unuttum
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="body" center color="textSecondary">
              Hesabın yok mu?{' '}
              <Text 
                variant="body" 
                color="primary" 
                onPress={handleSignUp}
                style={styles.signUpLink}
              >
                Kayıt Ol
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
  footer: {
    alignItems: 'center',
  },
  signUpLink: {
    textDecorationLine: 'underline',
  },
});




