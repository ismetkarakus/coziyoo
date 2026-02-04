import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router, Stack } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useCountry } from '../src/context/CountryContext';
import { useTranslation } from '../src/hooks/useTranslation';

export default function CouncilRegistration() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();
  const { t } = useTranslation();
  const isTR = currentCountry.code === 'TR';
  const baseKey = isTR ? 'councilRegistrationScreen.tr' : 'councilRegistrationScreen.uk';
  const commonKey = 'councilRegistrationScreen.common';
  
  const [formData, setFormData] = useState({
    councilName: currentCountry?.code === 'TR' ? 'Kadıköy Belediyesi' : 'Westminster City Council',
    postcode: currentCountry?.code === 'TR' ? '34710' : 'SW1A 1AA',
    businessName: currentCountry?.code === 'TR' ? 'Ev Mutfağı' : 'Home Kitchen',
    contactName: 'Fatma Teyze',
    phoneNumber: currentCountry?.code === 'TR' ? '+90 216 348 0000' : '+44 20 7946 0958',
    email: 'fatma@example.com',
    businessType: currentCountry?.code === 'TR' ? 'Evde gıda üretimi' : 'Home-based food business',
    startDate: '2024-01-15',
    registrationNumber: currentCountry?.code === 'TR' ? 'KDK-GIB-2024-001' : 'WCC-FB-2024-001',
    isRegistered: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert(
      t(`${commonKey}.successTitle`),
      t(`${commonKey}.successMessage`),
      [{ 
        text: t(`${commonKey}.ok`), 
        onPress: () => setIsEditing(false) 
      }]
    );
  };

  const openCouncilWebsite = () => {
    if (isTR) {
      Linking.openURL('https://www.turkiye.gov.tr/gida-tarbil-isletme-kayit-belgesi');
      return;
    }
    Linking.openURL('https://www.gov.uk/food-business-registration');
  };

  const openCouncilSearch = () => {
    if (isTR) {
      Linking.openURL('https://www.turkiye.gov.tr/belediyeler');
      return;
    }
    Linking.openURL('https://www.gov.uk/find-local-council');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: t(`${baseKey}.title`),
          headerBackVisible: false, // Otomatik geri butonunu gizle
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <Text variant="body" color="primary">
                {isEditing ? t(`${commonKey}.cancel`) : t(`${commonKey}.edit`)}
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header actions kaldırıldı - artık Stack.Screen'de */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card variant="default" padding="md" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text variant="subheading" weight="semibold" style={styles.statusTitle}>
              {t(`${baseKey}.statusTitle`)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: formData.isRegistered ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {formData.isRegistered ? t(`${baseKey}.registered`) : t(`${baseKey}.pending`)}
              </Text>
            </View>
          </View>
          
          {formData.isRegistered && (
            <Text variant="body" color="success" style={styles.statusMessage}>
              {t(`${baseKey}.statusMessage`)}
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {t(`${baseKey}.actionsTitle`)}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openCouncilWebsite}>
            <Text variant="body" color="primary">
              {t(`${baseKey}.actionRegister`)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openCouncilSearch}>
            <Text variant="body" color="primary">
              {t(`${baseKey}.actionFindCouncil`)}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Registration Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t(`${baseKey}.detailsTitle`)}
          </Text>

          <FormField
            label={t(`${baseKey}.councilNameLabel`)}
            value={formData.councilName}
            onChangeText={handleInputChange('councilName')}
            editable={isEditing}
            placeholder={t(`${baseKey}.councilNamePlaceholder`)}
          />

          <FormField
            label={t(`${baseKey}.postcodeLabel`)}
            value={formData.postcode}
            onChangeText={handleInputChange('postcode')}
            editable={isEditing}
            placeholder={t(`${baseKey}.postcodePlaceholder`)}
          />

          <FormField
            label={t(`${baseKey}.businessNameLabel`)}
            value={formData.businessName}
            onChangeText={handleInputChange('businessName')}
            editable={isEditing}
            placeholder={t(`${baseKey}.businessNamePlaceholder`)}
          />

          <FormField
            label={t(`${baseKey}.contactNameLabel`)}
            value={formData.contactName}
            onChangeText={handleInputChange('contactName')}
            editable={isEditing}
            placeholder={t(`${baseKey}.contactNamePlaceholder`)}
          />

          <FormField
            label={t(`${baseKey}.phoneLabel`)}
            value={formData.phoneNumber}
            onChangeText={handleInputChange('phoneNumber')}
            editable={isEditing}
            placeholder={t(`${baseKey}.phonePlaceholder`)}
          />

          <FormField
            label={t(`${commonKey}.emailLabel`)}
            value={formData.email}
            onChangeText={handleInputChange('email')}
            editable={isEditing}
            placeholder={t(`${commonKey}.emailPlaceholder`)}
          />

          <FormField
            label={t(`${baseKey}.businessTypeLabel`)}
            value={formData.businessType}
            onChangeText={handleInputChange('businessType')}
            editable={isEditing}
            placeholder={t(`${baseKey}.businessTypePlaceholder`)}
          />

          <FormField
            label={t(`${commonKey}.startDateLabel`)}
            value={formData.startDate}
            onChangeText={handleInputChange('startDate')}
            editable={isEditing}
            placeholder={t(`${commonKey}.startDatePlaceholder`)}
          />

          {formData.isRegistered && (
              <FormField
                label={t(`${baseKey}.registrationNumberLabel`)}
                value={formData.registrationNumber}
                onChangeText={handleInputChange('registrationNumber')}
                editable={isEditing}
                placeholder={t(`${baseKey}.registrationNumberPlaceholder`)}
              />
          )}

          <Checkbox
            label={t(`${baseKey}.checkbox`)}
            checked={formData.isRegistered}
            onPress={() => setFormData(prev => ({ ...prev, isRegistered: !prev.isRegistered }))}
            disabled={!isEditing}
          />

          {isEditing && (
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              {t(`${baseKey}.saveButton`)}
            </Button>
          )}
        </Card>

        {/* Legal Information */}
        <Card variant="default" padding="md" style={styles.legalCard}>
          <Text variant="body" weight="semibold" style={styles.legalTitle}>
            {t(`${baseKey}.legalTitle`)}
          </Text>
          <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
            • {t(`${baseKey}.legalBullet1`)}
          </Text>
          <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
            • {t(`${baseKey}.legalBullet2`)}
          </Text>
          <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
            • {t(`${baseKey}.legalBullet3`)}
          </Text>
          <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
            • {t(`${baseKey}.legalBullet4`)}
          </Text>
          {isTR && (
            <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
              • {t(`${baseKey}.legalBullet5`)}
            </Text>
          )}
        </Card>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sellerButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  sellerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sellerIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginLeft: 4,
  },
  editButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  statusCard: {
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: '#28A745',
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    color: '#2D5A4A',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  statusMessage: {
    lineHeight: 20,
  },
  actionsCard: {
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(127, 175, 154, 0.05)',
  },
  actionsTitle: {
    marginBottom: Spacing.sm,
    color: Colors.light.primary,
  },
  actionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
  },
  detailsCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.light.primary,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  legalCard: {
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  legalTitle: {
    marginBottom: Spacing.sm,
    color: '#856404',
  },
  legalText: {
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
