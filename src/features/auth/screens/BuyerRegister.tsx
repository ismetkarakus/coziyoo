import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Checkbox } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';

export const BuyerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signUp, loading } = useAuth();

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
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName, 'buyer');
      // Kayıt başarılı - AuthContext otomatik olarak yönlendirecek
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message);
    }
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
            <Checkbox
              label="Otomatik test bilgileriyle doldur"
              checked={autoFillEnabled}
              onPress={handleAutoFillToggle}
            />

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
              loading={loading}
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








