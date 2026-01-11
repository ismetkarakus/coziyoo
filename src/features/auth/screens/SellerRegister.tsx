import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Checkbox } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCountry } from '../../../context/CountryContext';

export const SellerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    kitchenLocation: '',
    postcode: '',
    councilName: '',
  });

  const [deliveryOptions, setDeliveryOptions] = useState({
    pickup: false,
    delivery: false,
  });

  // UK Compliance Fields
  const [ukCompliance, setUkCompliance] = useState({
    councilRegistered: false,
    foodHygieneCertificate: false,
    hygieneRating: '',
    allergenDeclaration: false,
    legalResponsibility: false,
    insuranceOptional: false,
    termsAccepted: false,
  });

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDeliveryOption = (option: keyof typeof deliveryOptions) => {
    setDeliveryOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleSubmit = () => {
    // Validate UK Compliance requirements
    if (!ukCompliance.councilRegistered) {
      Alert.alert('UK Legal Requirement', 'You must be registered with your local council to sell food in the UK.');
      return;
    }
    
    if (!ukCompliance.allergenDeclaration) {
      Alert.alert(
        currentCountry.code === 'TR' ? 'Gıda Güvenliği Gereksinimi' : 'Food Safety Requirement',
        currentCountry.code === 'TR' 
          ? 'Tüm gıda ürünleri için alerjen bilgilerini beyan etmelisiniz.'
          : 'You must declare allergen information for all food products.'
      );
      return;
    }
    
    if (!ukCompliance.legalResponsibility) {
      Alert.alert('Legal Agreement Required', 'You must accept legal responsibility for food safety and compliance.');
      return;
    }
    
    if (!formData.postcode || !formData.councilName) {
      Alert.alert('Missing Information', 'Please provide your postcode and council name for verification.');
      return;
    }
    
    if (!ukCompliance.termsAccepted) {
      Alert.alert('Terms & Conditions Required', 'You must read and accept the Terms & Conditions to proceed.');
      return;
    }
    
    // Mock registration - navigate to seller panel
    Alert.alert(
      'Registration Submitted',
      'Your seller application has been submitted for review. You will be notified once approved.',
      [{ text: 'OK', onPress: () => router.replace('/(seller)/dashboard') }]
    );
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

            <FormField
              label="Postcode"
              value={formData.postcode}
              onChangeText={handleInputChange('postcode')}
              placeholder="SW1A 1AA"
              required
              helperText="Required for council verification"
            />

            <FormField
              label="Local Council Name"
              value={formData.councilName}
              onChangeText={handleInputChange('councilName')}
              placeholder="e.g. Westminster City Council"
              required
              helperText="The council where your kitchen is located"
            />

            {/* UK Legal Compliance Section */}
            <View style={styles.complianceSection}>
              <Text variant="subheading" style={styles.sectionTitle}>
                🇬🇧 UK Food Business Requirements
              </Text>
              
              {/* Quick Links */}
              <View style={styles.quickLinksSection}>
                <Text variant="body" weight="medium" style={styles.quickLinksTitle}>
                  📋 Quick Links & Information:
                </Text>
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => Linking.openURL('https://www.gov.uk/food-business-registration')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    🏛️ Register Food Business with Council →
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => Linking.openURL('https://www.cieh.org/training/food-safety-training/')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    📜 Get Food Hygiene Level 2 Certificate →
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => Linking.openURL('https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    {currentCountry.code === 'TR' 
                      ? '⚠️ Türkiye Alerjen Gereksinimleri (Gıda Güvenliği Kanunu) →'
                      : '⚠️ Allergen Requirements →'
                    }
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => router.push('/admin-panel')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    🛠️ View Admin Panel (Seller Management) →
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">I am registered as a food business with my local council</Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.gov.uk/food-business-registration')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        (How to register? →)
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.councilRegistered}
                onPress={() => setUkCompliance(prev => ({ ...prev, councilRegistered: !prev.councilRegistered }))}
                required
                helperText="This is a legal requirement in the UK before selling food"
              />
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">I have a Food Hygiene Level 2 certificate</Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.cieh.org/training/food-safety-training/')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        (Get certificate →)
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.foodHygieneCertificate}
                onPress={() => setUkCompliance(prev => ({ ...prev, foodHygieneCertificate: !prev.foodHygieneCertificate }))}
                helperText="Strongly recommended for customer trust"
              />
              
              <View style={styles.ratingSection}>
                <Text variant="body" weight="medium" style={styles.ratingLabel}>
                  Food Hygiene Rating
                </Text>
                <View style={styles.ratingOptions}>
                  {['5', '4', '3', '2', '1', 'Pending'].map((rating) => (
                    <Button
                      key={rating}
                      variant={ukCompliance.hygieneRating === rating ? "primary" : "outline"}
                      onPress={() => setUkCompliance(prev => ({ ...prev, hygieneRating: rating }))}
                      style={styles.ratingButton}
                    >
                      {rating === 'Pending' ? 'Inspection Pending' : `⭐${rating}`}
                    </Button>
                  ))}
                </View>
              </View>
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">
                      {currentCountry.code === 'TR' 
                        ? 'Tüm ürünler için doğru alerjen bilgisi sağlayacağım'
                        : 'I will provide accurate allergen information for all products'
                      }
                    </Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        (View 14 allergens →)
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.allergenDeclaration}
                onPress={() => setUkCompliance(prev => ({ ...prev, allergenDeclaration: !prev.allergenDeclaration }))}
                required
                helperText={currentCountry.code === 'TR' 
                  ? 'Gıda Güvenliği Kanunu gereği zorunlu - tüm 14 temel alerjeni kapsar'
                  : 'Required by food safety regulations - covers all 14 major allergens'
                }
              />
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">I have Public Liability Insurance</Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.comparethemarket.com/business-insurance/public-liability/')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        (Get insurance →)
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.insuranceOptional}
                onPress={() => setUkCompliance(prev => ({ ...prev, insuranceOptional: !prev.insuranceOptional }))}
                helperText="Optional but strongly recommended for protection"
              />
              
              <Checkbox
                label="I accept full legal responsibility for food safety, hygiene, and compliance"
                checked={ukCompliance.legalResponsibility}
                onPress={() => setUkCompliance(prev => ({ ...prev, legalResponsibility: !prev.legalResponsibility }))}
                required
                helperText="You are responsible for all food safety aspects as an independent seller"
              />
            </View>

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

            <View style={styles.termsSection}>
              <Checkbox
                label="I have read and agree to the Terms & Conditions and UK food safety regulations"
                checked={ukCompliance.termsAccepted}
                onPress={() => setUkCompliance(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }))}
                required
                helperText="Required to proceed with seller registration"
              />
              <TouchableOpacity 
                onPress={() => router.push('/terms-and-conditions')}
                style={styles.termsLinkButton}
              >
                <Text variant="body" color="primary" style={styles.termsLinkText}>
                  📄 Read Terms & Conditions →
                </Text>
              </TouchableOpacity>
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
  complianceSection: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 175, 154, 0.3)',
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: '#2D5A4A',
  },
  ratingSection: {
    marginVertical: Spacing.sm,
  },
  ratingLabel: {
    marginBottom: Spacing.sm,
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  ratingButton: {
    minWidth: 80,
    paddingHorizontal: Spacing.sm,
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
  termsSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  termsText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  termsLinkButton: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickLinksSection: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(127, 175, 154, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 175, 154, 0.2)',
  },
  quickLinksTitle: {
    marginBottom: Spacing.sm,
    color: '#2D5A4A',
  },
  linkButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginVertical: 2,
  },
  linkText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  inlineLinkButton: {
    marginTop: 2,
  },
  inlineLinkText: {
    fontSize: 12,
    textDecorationLine: 'underline',
    fontStyle: 'italic',
  },
  termsLinkText: {
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});


















