import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router, Stack } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useCountry } from '../src/context/CountryContext';

export default function IsYeriSigortasi() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();
  
  const [formData, setFormData] = useState({
    policyNumber: currentCountry.code === 'TR' ? 'AXA-IY-2024-123456' : 'AXA-PL-2024-123456',
    insuranceCompany: currentCountry.code === 'TR' ? 'Axa Sigorta' : 'AXA Insurance',
    coverageAmount: currentCountry.code === 'TR' ? '2.000.000 ₺' : '£2,000,000',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    holderName: 'Fatma Teyze',
    businessType: currentCountry.code === 'TR' ? 'Evde Gıda Üretimi' : 'Home Food Business',
    hasInsurance: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert(
      currentCountry.code === 'TR' ? 'Başarılı' : 'Success',
      currentCountry.code === 'TR' 
        ? 'İş yeri sigortası bilgileri başarıyla güncellendi.'
        : 'Public liability insurance details have been updated successfully.',
      [{ 
        text: currentCountry.code === 'TR' ? 'Tamam' : 'OK', 
        onPress: () => setIsEditing(false) 
      }]
    );
  };

  const openInsuranceWebsite = () => {
    if (currentCountry.code === 'TR') {
      Linking.openURL('https://www.axasigorta.com.tr');
    } else {
      Linking.openURL('https://www.axa.co.uk/business-insurance/');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: currentCountry.code === 'TR' ? '🛡️ İş Yeri Sigortası' : '🛡️ Public Liability Insurance',
          headerBackVisible: false, // Otomatik geri butonunu gizle
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <Text variant="body" color="primary">
                {currentCountry.code === 'TR' 
                  ? (isEditing ? 'İptal' : 'Düzenle')
                  : (isEditing ? 'Cancel' : 'Edit')
                }
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
              {currentCountry.code === 'TR' ? 'Sigorta Durumu' : 'Insurance Status'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: formData.hasInsurance ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {currentCountry.code === 'TR' 
                  ? (formData.hasInsurance ? '✅ AKTİF' : '⏳ BEKLEMEDE')
                  : (formData.hasInsurance ? '✅ ACTIVE' : '⏳ PENDING')
                }
              </Text>
            </View>
          </View>
          
          {formData.hasInsurance && (
            <Text variant="body" color="success" style={styles.statusMessage}>
              {currentCountry.code === 'TR' 
                ? 'İş yeri sigortanız aktif ve geçerli.'
                : 'Your public liability insurance is active and valid.'
              }
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {currentCountry.code === 'TR' ? '📋 Hızlı İşlemler' : '📋 Quick Actions'}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openInsuranceWebsite}>
            <Text variant="body" color="primary">
              {currentCountry.code === 'TR' 
                ? '🌐 Sigorta Şirketi →'
                : '🌐 Insurance Provider →'
              }
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Insurance Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {currentCountry.code === 'TR' ? 'Sigorta Detayları' : 'Insurance Details'}
          </Text>

          <FormField
            label={currentCountry.code === 'TR' ? 'Poliçe Numarası' : 'Policy Number'}
            value={formData.policyNumber}
            onChangeText={handleInputChange('policyNumber')}
            editable={isEditing}
            placeholder={currentCountry.code === 'TR' ? 'AXA-IY-2024-123456' : 'Policy number'}
          />

          <FormField
            label={currentCountry.code === 'TR' ? 'Sigorta Şirketi' : 'Insurance Company'}
            value={formData.insuranceCompany}
            onChangeText={handleInputChange('insuranceCompany')}
            editable={isEditing}
            placeholder={currentCountry.code === 'TR' ? 'Axa Sigorta' : 'Insurance provider'}
          />

          <FormField
            label={currentCountry.code === 'TR' ? 'Teminat Tutarı' : 'Coverage Amount'}
            value={formData.coverageAmount}
            onChangeText={handleInputChange('coverageAmount')}
            editable={isEditing}
            placeholder={currentCountry.code === 'TR' ? '2.000.000 ₺' : '£2,000,000'}
          />

          <FormField
            label={currentCountry.code === 'TR' ? 'Poliçe Sahibi' : 'Policy Holder'}
            value={formData.holderName}
            onChangeText={handleInputChange('holderName')}
            editable={isEditing}
            placeholder={currentCountry.code === 'TR' ? 'Tam adınız' : 'Your full name'}
          />

          <FormField
            label={currentCountry.code === 'TR' ? 'İşletme Türü' : 'Business Type'}
            value={formData.businessType}
            onChangeText={handleInputChange('businessType')}
            editable={isEditing}
            placeholder={currentCountry.code === 'TR' ? 'Evde Gıda Üretimi' : 'Home Food Business'}
          />

          <FormField
            label={currentCountry.code === 'TR' ? 'Başlangıç Tarihi' : 'Start Date'}
            value={formData.startDate}
            onChangeText={handleInputChange('startDate')}
            editable={isEditing}
            placeholder={currentCountry.code === 'TR' ? 'YYYY-AA-GG' : 'YYYY-MM-DD'}
          />

          <FormField
            label={currentCountry.code === 'TR' ? 'Bitiş Tarihi' : 'End Date'}
            value={formData.endDate}
            onChangeText={handleInputChange('endDate')}
            editable={isEditing}
            placeholder={currentCountry.code === 'TR' ? 'YYYY-AA-GG' : 'YYYY-MM-DD'}
          />

          <Checkbox
            label={currentCountry.code === 'TR' 
              ? 'Geçerli iş yeri sigortam var'
              : 'I have valid public liability insurance'
            }
            checked={formData.hasInsurance}
            onPress={() => setFormData(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}
            disabled={!isEditing}
          />

          {isEditing && (
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              {currentCountry.code === 'TR' ? '💾 Değişiklikleri Kaydet' : '💾 Save Changes'}
            </Button>
          )}
        </Card>

        {/* Legal Information */}
        <Card variant="default" padding="md" style={styles.legalCard}>
          <Text variant="body" weight="semibold" style={styles.legalTitle}>
            {currentCountry.code === 'TR' ? '⚖️ Yasal Gereklilikler' : '⚖️ Legal Requirements'}
          </Text>
          {currentCountry.code === 'TR' ? (
            <>
              <Text variant="caption" style={styles.legalText}>
                • Gıda işletmeleri için iş yeri sigortası önerilir
              </Text>
              <Text variant="caption" style={styles.legalText}>
                • Müşteri zararları için yeterli teminat bulunmalıdır
              </Text>
              <Text variant="caption" style={styles.legalText}>
                • Sigorta poliçesi düzenli olarak yenilenmelidir
              </Text>
              <Text variant="caption" style={styles.legalText}>
                • Hasar durumunda sigorta şirketi derhal bilgilendirilmelidir
              </Text>
            </>
          ) : (
            <>
              <Text variant="caption" style={styles.legalText}>
                • Public liability insurance is recommended for food businesses
              </Text>
              <Text variant="caption" style={styles.legalText}>
                • Adequate coverage should be maintained for customer claims
              </Text>
              <Text variant="caption" style={styles.legalText}>
                • Insurance policies must be renewed regularly
              </Text>
              <Text variant="caption" style={styles.legalText}>
                • Insurance provider must be notified immediately of any claims
              </Text>
            </>
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
    flex: 1,
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
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  legalTitle: {
    marginBottom: Spacing.sm,
    color: '#DC2626',
  },
  legalText: {
    marginBottom: Spacing.xs,
    lineHeight: 18,
    color: Colors.light.text,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});