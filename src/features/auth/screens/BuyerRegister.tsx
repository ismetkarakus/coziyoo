import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
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
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    location: '',
  });
  const [autoFillEnabled, setAutoFillEnabled] = useState(false);

  const testBuyerData = {
    fullName: 'Test Buyer',
    phone: '0555 111 22 33',
    email: 'buyer@test.com',
    password: 'Test1234!',
    location: 'Kadıköy, İstanbul',
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoFillToggle = () => {
    setAutoFillEnabled(prev => {
      const next = !prev;
      setFormData(next ? testBuyerData : {
        fullName: '',
        phone: '',
        email: '',
        password: '',
        location: '',
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone || !formData.location) {
      Alert.alert(t('authBuyerRegister.errorTitle'), t('authBuyerRegister.errorMessage'));
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName, 'buyer');
      // Kayıt başarılı - AuthContext otomatik olarak yönlendirecek
    } catch (error: any) {
      Alert.alert(t('authBuyerRegister.registerErrorTitle'), error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              label="Otomatik test bilgileriyle doldur"
              checked={autoFillEnabled}
              onPress={handleAutoFillToggle}
            />

            <FormField
              label={t('authBuyerRegister.fullNameLabel')}
              value={formData.fullName}
              onChangeText={handleInputChange('fullName')}
              placeholder={t('authBuyerRegister.fullNamePlaceholder')}
              required
            />

            <FormField
              label={t('authBuyerRegister.phoneLabel')}
              value={formData.phone}
              onChangeText={handleInputChange('phone')}
              placeholder={t('authBuyerRegister.phonePlaceholder')}
              keyboardType="phone-pad"
              required
            />

            <FormField
              label={t('authBuyerRegister.emailLabel')}
              value={formData.email}
              onChangeText={handleInputChange('email')}
              placeholder={t('authBuyerRegister.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <FormField
              label={t('authBuyerRegister.passwordLabel')}
              value={formData.password}
              onChangeText={handleInputChange('password')}
              placeholder={t('authBuyerRegister.passwordPlaceholder')}
              secureTextEntry
              required
            />

            <FormField
              label={t('authBuyerRegister.locationLabel')}
              value={formData.location}
              onChangeText={handleInputChange('location')}
              placeholder={t('authBuyerRegister.locationPlaceholder')}
              helperText={t('authBuyerRegister.locationHelper')}
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
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
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









