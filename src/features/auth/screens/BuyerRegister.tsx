import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const BuyerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    location: '',
  });

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Mock registration - navigate to buyer tabs
    router.replace('/(tabs)/');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="heading" center style={styles.title}>
              Kayıt Ol
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.subtitle}>
              Hesabını oluştur ve lezzetli yemekleri keşfet
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
              label="Konumunu Seç"
              value={formData.location}
              onChangeText={handleInputChange('location')}
              placeholder="İlçe, mahalle"
              helperText="Konum bilgisi, sana en yakın ev yemeklerini göstermek için kullanılır."
              required
            />

            <Button 
              variant="primary" 
              fullWidth 
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              Devam Et
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






