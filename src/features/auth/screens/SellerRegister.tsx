import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Checkbox } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';

export const SellerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const { loading, signUp } = useAuth();

  const testSellerData = {
    fullName: 'Test Seller',
    phone: '0555 222 33 44',
    email: 'seller@test.com',
    password: 'Test1234!',
    confirmPassword: 'Test1234!',
    kitchenLocation: 'Şişli, İstanbul',
  };

  const [formData, setFormData] = useState(testSellerData);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);


  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleAutoFillToggle = () => {
    setAutoFillEnabled(prev => {
      const next = !prev;
      setFormData(next ? testSellerData : {
        fullName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        kitchenLocation: '',
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
      'kitchenLocation',
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
      Alert.alert(t('authSellerRegister.errorTitle'), t('authSellerRegister.errorMessage'));
      return;
    }

    const showSuccess = () => {
      Alert.alert(
        t('authSellerRegister.alerts.successTitle'),
        t('authSellerRegister.alerts.successMessage'),
        [{ text: t('authSellerRegister.alerts.ok') }]
      );
    };

    try {
      await signUp(formData.email, formData.password, formData.fullName, 'seller');
      showSuccess();
    } catch (error) {
      Alert.alert(t('authSellerRegister.registerErrorTitle'), t('authSellerRegister.registerErrorMessage'));
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
              {t('authSellerRegister.title')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.subtitle}>
              {t('authSellerRegister.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <Checkbox
              label={t('authSellerRegister.autoFillLabel')}
              checked={autoFillEnabled}
              onPress={handleAutoFillToggle}
            />

            <FormField
              label={t('authSellerRegister.fullNameLabel')}
              value={formData.fullName}
              onChangeText={handleInputChange('fullName')}
              placeholder={t('authSellerRegister.fullNamePlaceholder')}
              error={errors.fullName}
              required
            />

            <FormField
              label={t('authSellerRegister.phoneLabel')}
              value={formData.phone}
              onChangeText={handleInputChange('phone')}
              placeholder={t('authSellerRegister.phonePlaceholder')}
              keyboardType="phone-pad"
              error={errors.phone}
              required
            />

            <FormField
              label={t('authSellerRegister.emailLabel')}
              value={formData.email}
              onChangeText={handleInputChange('email')}
              placeholder={t('authSellerRegister.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <FormField
              label={t('authSellerRegister.passwordLabel')}
              value={formData.password}
              onChangeText={handleInputChange('password')}
              placeholder={t('authSellerRegister.passwordPlaceholder')}
              secureTextEntry
              error={errors.password}
              required
            />

            <FormField
              label={t('authSellerRegister.confirmPasswordLabel')}
              value={formData.confirmPassword}
              onChangeText={handleInputChange('confirmPassword')}
              placeholder={t('authSellerRegister.confirmPasswordPlaceholder')}
              secureTextEntry
              error={errors.confirmPassword}
              required
            />

            <FormField
              label={t('authSellerRegister.kitchenLocationLabel')}
              value={formData.kitchenLocation}
              onChangeText={handleInputChange('kitchenLocation')}
              placeholder={t('authSellerRegister.kitchenLocationPlaceholder')}
              error={errors.kitchenLocation}
              required
            />

            <Button 
              variant="primary" 
              fullWidth 
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            >
              {t('authSellerRegister.submit')}
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



