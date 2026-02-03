import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Button, Checkbox } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCountry } from '../../../context/CountryContext';
import { useTranslation } from '../../../hooks/useTranslation';

export const SellerRegister: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    kitchenLocation: '',
    postcode: '',
    councilName: '',
  });
  const [autoFillEnabled, setAutoFillEnabled] = useState(false);

  const testSellerData = {
    fullName: 'Test Seller',
    phone: '0555 222 33 44',
    email: 'seller@test.com',
    password: 'Test1234!',
    kitchenLocation: 'Şişli, İstanbul',
    postcode: 'SW1A 1AA',
    councilName: 'Westminster City Council',
  };

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

  const handleAutoFillToggle = () => {
    setAutoFillEnabled(prev => {
      const next = !prev;
      setFormData(next ? testSellerData : {
        fullName: '',
        phone: '',
        email: '',
        password: '',
        kitchenLocation: '',
        postcode: '',
        councilName: '',
      });
      setDeliveryOptions(next ? { pickup: true, delivery: false } : { pickup: false, delivery: false });
      setUkCompliance(next ? {
        councilRegistered: true,
        foodHygieneCertificate: true,
        hygieneRating: '5',
        allergenDeclaration: true,
        legalResponsibility: true,
        insuranceOptional: false,
        termsAccepted: true,
      } : {
        councilRegistered: false,
        foodHygieneCertificate: false,
        hygieneRating: '',
        allergenDeclaration: false,
        legalResponsibility: false,
        insuranceOptional: false,
        termsAccepted: false,
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone || !formData.kitchenLocation) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Validate UK Compliance requirements
    if (!ukCompliance.councilRegistered) {
      Alert.alert(
        t('authSellerRegister.alerts.ukLegalTitle'),
        t('authSellerRegister.alerts.ukLegalMessage')
      );
      return;
    }
    
    if (!ukCompliance.allergenDeclaration) {
      Alert.alert(
        currentCountry.code === 'TR'
          ? t('authSellerRegister.alerts.foodSafetyTitleTr')
          : t('authSellerRegister.alerts.foodSafetyTitleEn'),
        currentCountry.code === 'TR' 
          ? t('authSellerRegister.alerts.foodSafetyMessageTr')
          : t('authSellerRegister.alerts.foodSafetyMessageEn')
      );
      return;
    }
    
    if (!ukCompliance.legalResponsibility) {
      Alert.alert(
        t('authSellerRegister.alerts.legalAgreementTitle'),
        t('authSellerRegister.alerts.legalAgreementMessage')
      );
      return;
    }
    
    if (!formData.postcode || !formData.councilName) {
      Alert.alert(
        t('authSellerRegister.alerts.missingInfoTitle'),
        t('authSellerRegister.alerts.missingInfoMessage')
      );
      return;
    }
    
    if (!ukCompliance.termsAccepted) {
      Alert.alert(
        t('authSellerRegister.alerts.termsRequiredTitle'),
        t('authSellerRegister.alerts.termsRequiredMessage')
      );
      return;
    }
    
    // Mock registration - navigate to seller panel
    Alert.alert(
      t('authSellerRegister.alerts.submittedTitle'),
      t('authSellerRegister.alerts.submittedMessage'),
      [{ text: t('authSellerRegister.alerts.ok'), onPress: () => router.replace('/(seller)/dashboard') }]
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

            <FormField
              label={t('authSellerRegister.postcodeLabel')}
              value={formData.postcode}
              onChangeText={handleInputChange('postcode')}
              placeholder={t('authSellerRegister.postcodePlaceholder')}
              required
              helperText={t('authSellerRegister.postcodeHelper')}
            />

            <FormField
              label={t('authSellerRegister.councilLabel')}
              value={formData.councilName}
              onChangeText={handleInputChange('councilName')}
              placeholder={t('authSellerRegister.councilPlaceholder')}
              required
              helperText={t('authSellerRegister.councilHelper')}
            />

            {/* UK Legal Compliance Section */}
            <View style={styles.complianceSection}>
              <Text variant="subheading" style={styles.sectionTitle}>
                {t('authSellerRegister.complianceTitle')}
              </Text>
              
              {/* Quick Links */}
              <View style={styles.quickLinksSection}>
                <Text variant="body" weight="medium" style={styles.quickLinksTitle}>
                  {t('authSellerRegister.quickLinksTitle')}
                </Text>
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => Linking.openURL('https://www.gov.uk/food-business-registration')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    {t('authSellerRegister.quickLinks.registerBusiness')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => Linking.openURL('https://www.cieh.org/training/food-safety-training/')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    {t('authSellerRegister.quickLinks.hygieneCertificate')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => Linking.openURL('https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    {currentCountry.code === 'TR' 
                      ? t('authSellerRegister.quickLinks.allergenRequirementsTr')
                      : t('authSellerRegister.quickLinks.allergenRequirementsEn')
                    }
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => router.push('/admin-panel')}
                >
                  <Text variant="caption" color="primary" style={styles.linkText}>
                    {t('authSellerRegister.quickLinks.adminPanel')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">{t('authSellerRegister.checkboxes.councilRegistered')}</Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.gov.uk/food-business-registration')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        {t('authSellerRegister.checkboxes.councilRegisteredLink')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.councilRegistered}
                onPress={() => setUkCompliance(prev => ({ ...prev, councilRegistered: !prev.councilRegistered }))}
                required
                helperText={t('authSellerRegister.checkboxes.councilRegisteredHelper')}
              />
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">{t('authSellerRegister.checkboxes.hygieneCertificate')}</Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.cieh.org/training/food-safety-training/')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        {t('authSellerRegister.checkboxes.hygieneCertificateLink')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.foodHygieneCertificate}
                onPress={() => setUkCompliance(prev => ({ ...prev, foodHygieneCertificate: !prev.foodHygieneCertificate }))}
                helperText={t('authSellerRegister.checkboxes.hygieneCertificateHelper')}
              />
              
              <View style={styles.ratingSection}>
                <Text variant="body" weight="medium" style={styles.ratingLabel}>
                  {t('authSellerRegister.rating.title')}
                </Text>
                <View style={styles.ratingOptions}>
                  {['5', '4', '3', '2', '1', 'Pending'].map((rating) => (
                    <Button
                      key={rating}
                      variant={ukCompliance.hygieneRating === rating ? "primary" : "outline"}
                      onPress={() => setUkCompliance(prev => ({ ...prev, hygieneRating: rating }))}
                      style={styles.ratingButton}
                    >
                      {rating === 'Pending'
                        ? t('authSellerRegister.rating.pending')
                        : t('authSellerRegister.rating.star', { rating })}
                    </Button>
                  ))}
                </View>
              </View>
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">
                      {currentCountry.code === 'TR' 
                        ? t('authSellerRegister.checkboxes.allergenDeclarationTr')
                        : t('authSellerRegister.checkboxes.allergenDeclarationEn')
                      }
                    </Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        {t('authSellerRegister.checkboxes.allergenDeclarationLink')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.allergenDeclaration}
                onPress={() => setUkCompliance(prev => ({ ...prev, allergenDeclaration: !prev.allergenDeclaration }))}
                required
                helperText={currentCountry.code === 'TR' 
                  ? t('authSellerRegister.checkboxes.allergenDeclarationHelperTr')
                  : t('authSellerRegister.checkboxes.allergenDeclarationHelperEn')
                }
              />
              
              <Checkbox
                label={
                  <View style={styles.checkboxLabelContainer}>
                    <Text variant="body">{t('authSellerRegister.checkboxes.insurance')}</Text>
                    <TouchableOpacity 
                      onPress={() => Linking.openURL('https://www.comparethemarket.com/business-insurance/public-liability/')}
                      style={styles.inlineLinkButton}
                    >
                      <Text variant="caption" color="primary" style={styles.inlineLinkText}>
                        {t('authSellerRegister.checkboxes.insuranceLink')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                checked={ukCompliance.insuranceOptional}
                onPress={() => setUkCompliance(prev => ({ ...prev, insuranceOptional: !prev.insuranceOptional }))}
                helperText={t('authSellerRegister.checkboxes.insuranceHelper')}
              />
              
              <Checkbox
                label={t('authSellerRegister.checkboxes.legalResponsibility')}
                checked={ukCompliance.legalResponsibility}
                onPress={() => setUkCompliance(prev => ({ ...prev, legalResponsibility: !prev.legalResponsibility }))}
                required
                helperText={t('authSellerRegister.checkboxes.legalResponsibilityHelper')}
              />
            </View>

            <View style={styles.deliverySection}>
              <Text variant="subheading" style={styles.deliveryTitle}>
                {t('authSellerRegister.delivery.title')}
              </Text>
              
              <View style={styles.checkboxContainer}>
                <Button
                  variant={deliveryOptions.pickup ? "primary" : "outline"}
                  onPress={() => toggleDeliveryOption('pickup')}
                  style={styles.checkboxButton}
                >
                  {deliveryOptions.pickup ? "✓ " : ""}{t('authSellerRegister.delivery.pickup')}
                </Button>
                
                <Button
                  variant={deliveryOptions.delivery ? "primary" : "outline"}
                  onPress={() => toggleDeliveryOption('delivery')}
                  style={styles.checkboxButton}
                >
                  {deliveryOptions.delivery ? "✓ " : ""}{t('authSellerRegister.delivery.delivery')}
                </Button>
              </View>
            </View>

            <View style={styles.termsSection}>
              <Checkbox
                label={t('authSellerRegister.checkboxes.terms')}
                checked={ukCompliance.termsAccepted}
                onPress={() => setUkCompliance(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }))}
                required
                helperText={t('authSellerRegister.checkboxes.termsHelper')}
              />
              <TouchableOpacity 
                onPress={() => router.push('/terms-and-conditions')}
                style={styles.termsLinkButton}
              >
                <Text variant="body" color="primary" style={styles.termsLinkText}>
                  {t('authSellerRegister.termsLink')}
                </Text>
              </TouchableOpacity>
            </View>

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

















