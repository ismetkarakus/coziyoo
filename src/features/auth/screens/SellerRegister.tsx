import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Checkbox } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCountry } from '../../../context/CountryContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';

export const SellerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();
  const { t } = useTranslation();
  const { loading } = useAuth();

  const testSellerData = {
    fullName: 'Test Seller',
    phone: '0555 222 33 44',
    email: 'seller@test.com',
    password: 'Test1234!',
    kitchenLocation: 'Şişli, İstanbul',
  };

  const [formData, setFormData] = useState(testSellerData);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);


  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoFillToggle = () => {
    setAutoFillEnabled(prev => {
      const next = !prev;
      setFormData(next ? testSellerData : {
        fullName: '',
        phone: '',
        email: '',
        password: '',
        kitchenLocation: '',
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone || !formData.kitchenLocation) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const goToSeller = () => router.replace('/(seller)/dashboard');

    if (Platform.OS === 'web') {
      goToSeller();
      return;
    }

    // Mock registration - navigate to seller panel
    Alert.alert(
      t('authSellerRegister.alerts.submittedTitle'),
      t('authSellerRegister.alerts.submittedMessage'),
      [{ text: t('authSellerRegister.alerts.ok'), onPress: goToSeller }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              label="Otomatik test bilgileriyle doldur"
              checked={autoFillEnabled}
              onPress={handleAutoFillToggle}
            />

            <FormField
              label={t('authSellerRegister.fullNameLabel')}
              value={formData.fullName}
              onChangeText={handleInputChange('fullName')}
              placeholder={t('authSellerRegister.fullNamePlaceholder')}
              required
            />

            <FormField
              label={t('authSellerRegister.phoneLabel')}
              value={formData.phone}
              onChangeText={handleInputChange('phone')}
              placeholder={t('authSellerRegister.phonePlaceholder')}
              keyboardType="phone-pad"
              required
            />

            <FormField
              label={t('authSellerRegister.emailLabel')}
              value={formData.email}
              onChangeText={handleInputChange('email')}
              placeholder={t('authSellerRegister.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <FormField
              label={t('authSellerRegister.passwordLabel')}
              value={formData.password}
              onChangeText={handleInputChange('password')}
              placeholder={t('authSellerRegister.passwordPlaceholder')}
              secureTextEntry
              required
            />

            <FormField
              label={t('authSellerRegister.kitchenLocationLabel')}
              value={formData.kitchenLocation}
              onChangeText={handleInputChange('kitchenLocation')}
              placeholder={t('authSellerRegister.kitchenLocationPlaceholder')}
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














