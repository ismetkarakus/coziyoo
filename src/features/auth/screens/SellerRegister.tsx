import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const SellerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    kitchenLocation: '',
  });

  const [deliveryOptions, setDeliveryOptions] = useState({
    pickup: false,
    delivery: false,
  });

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDeliveryOption = (option: keyof typeof deliveryOptions) => {
    setDeliveryOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleSubmit = () => {
    // Mock registration - navigate to seller panel
    router.replace('/(seller)/dashboard');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="heading" center style={styles.title}>
              Satıcı Kayıt
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.subtitle}>
              Ev yemeklerini satmaya başla
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              label="Ad Soyad"
              value={formData.fullName}
              onChangeText={handleInputChange('fullName')}
              placeholder="Adınız ve soyadınız"
              required
            />

            <FormField
              label="Telefon"
              value={formData.phone}
              onChangeText={handleInputChange('phone')}
              placeholder="05XX XXX XX XX"
              keyboardType="phone-pad"
              required
            />

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
              placeholder="En az 6 karakter"
              secureTextEntry
              required
            />

            <FormField
              label="Mutfak Konumu"
              value={formData.kitchenLocation}
              onChangeText={handleInputChange('kitchenLocation')}
              placeholder="İlçe, mahalle, sokak"
              required
            />

            <View style={styles.deliverySection}>
              <Text variant="subheading" style={styles.deliveryTitle}>
                Teslimat Seçenekleri
              </Text>
              
              <View style={styles.checkboxContainer}>
                <Button
                  variant={deliveryOptions.pickup ? "primary" : "outline"}
                  onPress={() => toggleDeliveryOption('pickup')}
                  style={styles.checkboxButton}
                >
                  {deliveryOptions.pickup ? "✓ " : ""}Pickup (Gel Al)
                </Button>
                
                <Button
                  variant={deliveryOptions.delivery ? "primary" : "outline"}
                  onPress={() => toggleDeliveryOption('delivery')}
                  style={styles.checkboxButton}
                >
                  {deliveryOptions.delivery ? "✓ " : ""}Delivery (Teslimat)
                </Button>
              </View>
            </View>

            <Button 
              variant="primary" 
              fullWidth 
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              Satıcı Olarak Devam Et
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
  deliverySection: {
    marginTop: Spacing.md,
  },
  deliveryTitle: {
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  checkboxButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});



