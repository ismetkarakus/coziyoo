import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Checkbox } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';

export const BuyerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signUp, loading } = useAuth();
  const { t, currentLanguage } = useTranslation();

  const testBuyerData = currentLanguage === 'en'
    ? {
        fullName: 'Test Buyer',
        phone: '+44 7700 900123',
        email: 'buyer@test.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
        location: 'London, UK',
      }
    : {
        fullName: 'Test Buyer',
        phone: '0555 111 22 33',
        email: 'buyer@test.com',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
        location: 'Kadıköy, İstanbul',
      };

  const [formData, setFormData] = useState(testBuyerData);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleAutoFillToggle = () => {
    setAutoFillEnabled(prev => {
      const next = !prev;
      setFormData(next ? testBuyerData : {
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
      });
      setErrors({});
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof formData, string>> = {};
    const requiredFields: Array<keyof typeof formData> = [
      'fullName',
      'phone',
      'email',
      'password',
      'confirmPassword',
      'location',
    ];

    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        nextErrors[field] = t('authFormErrors.required');
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email?.trim() && !emailRegex.test(formData.email.trim())) {
      nextErrors.email = t('authFormErrors.invalidEmail');
    }

    if (formData.password?.trim() && formData.password.trim().length < 6) {
      nextErrors.password = t('authFormErrors.invalidPassword');
    }

    if (formData.confirmPassword?.trim() && formData.password?.trim() && formData.confirmPassword.trim() !== formData.password.trim()) {
      nextErrors.confirmPassword = t('authFormErrors.passwordMismatch');
    }

    const phoneDigits = formData.phone?.replace(/\D/g, '') ?? '';
    if (formData.phone?.trim() && phoneDigits.length < 10) {
      nextErrors.phone = t('authFormErrors.invalidPhone');
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      Alert.alert(t('authBuyerRegister.errorTitle'), t('authBuyerRegister.errorMessage'));
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName, 'buyer');
      // Kayıt başarılı - AuthContext otomatik olarak yönlendirecek
      Alert.alert(t('authBuyerRegister.successTitle'), t('authBuyerRegister.successMessage'));
    } catch (error: any) {
      Alert.alert(t('authBuyerRegister.registerErrorTitle'), t('authBuyerRegister.registerErrorMessage'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="heading" center style={styles.title}>
              {t('authBuyerRegister.title')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.subtitle}>
              {t('authBuyerRegister.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <Checkbox
              label={t('authBuyerRegister.autoFillLabel')}
              checked={autoFillEnabled}
              onPress={handleAutoFillToggle}
            />

            <FormField
              label={t('authBuyerRegister.fullNameLabel')}
              value={formData.fullName}
              onChangeText={handleInputChange('fullName')}
              placeholder={t('authBuyerRegister.fullNamePlaceholder')}
              error={errors.fullName}
              required
            />

            <FormField
              label={t('authBuyerRegister.phoneLabel')}
              value={formData.phone}
              onChangeText={handleInputChange('phone')}
              placeholder={t('authBuyerRegister.phonePlaceholder')}
              keyboardType="phone-pad"
              error={errors.phone}
              required
            />

            <FormField
              label={t('authBuyerRegister.emailLabel')}
              value={formData.email}
              onChangeText={handleInputChange('email')}
              placeholder={t('authBuyerRegister.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <FormField
              label={t('authBuyerRegister.passwordLabel')}
              value={formData.password}
              onChangeText={handleInputChange('password')}
              placeholder={t('authBuyerRegister.passwordPlaceholder')}
              secureTextEntry
              error={errors.password}
              required
            />

            <FormField
              label={t('authBuyerRegister.confirmPasswordLabel')}
              value={formData.confirmPassword}
              onChangeText={handleInputChange('confirmPassword')}
              placeholder={t('authBuyerRegister.confirmPasswordPlaceholder')}
              secureTextEntry
              error={errors.confirmPassword}
              required
            />

            <FormField
              label={t('authBuyerRegister.locationLabel')}
              value={formData.location}
              onChangeText={handleInputChange('location')}
              placeholder={t('authBuyerRegister.locationPlaceholder')}
              helperText={t('authBuyerRegister.locationHelper')}
              error={errors.location}
              required
            />

            <Button 
              variant="primary" 
              fullWidth 
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            >
              {t('authBuyerRegister.submit')}
            </Button>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});


