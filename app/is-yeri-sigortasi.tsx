import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useTranslation } from '../src/hooks/useTranslation';

export default function IsYeriSigortasi() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentLanguage } = useTranslation();
  const isTR = currentLanguage === 'tr';
  
  const getInitialFormData = (useTR: boolean) => ({
    policyNumber: useTR ? 'AXA-IY-2024-123456' : 'AXA-PL-2024-123456',
    insuranceCompany: useTR ? 'Axa Sigorta' : 'AXA Insurance',
    coverageAmount: useTR ? '2.000.000 ₺' : '£2,000,000',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    holderName: 'Fatma Teyze',
    businessType: useTR ? 'Evde Gıda Üretimi' : 'Home Food Business',
    hasInsurance: true,
  });

  const [formData, setFormData] = useState(getInitialFormData(isTR));

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setFormData(getInitialFormData(isTR));
    }
  }, [currentLanguage, isEditing, isTR]);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert(
      isTR ? 'Başarılı' : 'Success',
      isTR 
        ? 'İş yeri sigortası bilgileri başarıyla güncellendi.'
        : 'Public liability insurance details have been updated successfully.',
      [{ 
        text: isTR ? 'Tamam' : 'OK', 
        onPress: () => setIsEditing(false) 
      }]
    );
  };

  const openInsuranceWebsite = () => {
    if (isTR) {
      Linking.openURL('https://www.axasigorta.com.tr');
    } else {
      Linking.openURL('https://www.axa.co.uk/business-insurance/');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: isTR ? '🛡️ İş Yeri Sigortası' : '🛡️ Public Liability Insurance',
          headerBackVisible: false, // Otomatik geri butonunu gizle
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <Text variant="body" color="primary">
                {isTR 
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
              {isTR ? 'Sigorta Durumu' : 'Insurance Status'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: formData.hasInsurance ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {isTR 
                  ? (formData.hasInsurance ? '✅ AKTİF' : '⏳ BEKLEMEDE')
                  : (formData.hasInsurance ? '✅ ACTIVE' : '⏳ PENDING')
                }
              </Text>
            </View>
          </View>
          
          {formData.hasInsurance && (
            <Text variant="body" color="success" style={styles.statusMessage}>
              {isTR 
                ? 'İş yeri sigortanız aktif ve geçerli.'
                : 'Your public liability insurance is active and valid.'
              }
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {isTR ? '📋 Hızlı İşlemler' : '📋 Quick Actions'}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openInsuranceWebsite}>
            <Text variant="body" color="primary">
              {isTR 
                ? '🌐 Sigorta Şirketi →'
                : '🌐 Insurance Provider →'
              }
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Insurance Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {isTR ? 'Sigorta Detayları' : 'Insurance Details'}
          </Text>

          <FormField
            label={isTR ? 'Poliçe Numarası' : 'Policy Number'}
            value={formData.policyNumber}
            onChangeText={handleInputChange('policyNumber')}
            editable={isEditing}
            placeholder={isTR ? 'AXA-IY-2024-123456' : 'Policy number'}
          />

          <FormField
            label={isTR ? 'Sigorta Şirketi' : 'Insurance Company'}
            value={formData.insuranceCompany}
            onChangeText={handleInputChange('insuranceCompany')}
            editable={isEditing}
            placeholder={isTR ? 'Axa Sigorta' : 'Insurance provider'}
          />

          <FormField
            label={isTR ? 'Teminat Tutarı' : 'Coverage Amount'}
            value={formData.coverageAmount}
            onChangeText={handleInputChange('coverageAmount')}
            editable={isEditing}
            placeholder={isTR ? '2.000.000 ₺' : '£2,000,000'}
          />

          <FormField
            label={isTR ? 'Poliçe Sahibi' : 'Policy Holder'}
            value={formData.holderName}
            onChangeText={handleInputChange('holderName')}
            editable={isEditing}
            placeholder={isTR ? 'Tam adınız' : 'Your full name'}
          />

          <FormField
            label={isTR ? 'İşletme Türü' : 'Business Type'}
            value={formData.businessType}
            onChangeText={handleInputChange('businessType')}
            editable={isEditing}
            placeholder={isTR ? 'Evde Gıda Üretimi' : 'Home Food Business'}
          />

          <FormField
            label={isTR ? 'Başlangıç Tarihi' : 'Start Date'}
            value={formData.startDate}
            onChangeText={handleInputChange('startDate')}
            editable={isEditing}
            placeholder={isTR ? 'YYYY-AA-GG' : 'YYYY-MM-DD'}
          />

          <FormField
            label={isTR ? 'Bitiş Tarihi' : 'End Date'}
            value={formData.endDate}
            onChangeText={handleInputChange('endDate')}
            editable={isEditing}
            placeholder={isTR ? 'YYYY-AA-GG' : 'YYYY-MM-DD'}
          />

          <Checkbox
            label={isTR 
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
              {isTR ? '💾 Değişiklikleri Kaydet' : '💾 Save Changes'}
            </Button>
          )}
        </Card>

        {/* Legal Information */}
        <Card variant="default" padding="md" style={styles.legalCard}>
          <Text variant="body" weight="semibold" style={styles.legalTitle}>
            {isTR ? '⚖️ Yasal Gereklilikler' : '⚖️ Legal Requirements'}
          </Text>
          {isTR ? (
            <>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Gıda işletmeleri için iş yeri sigortası önerilir
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Müşteri zararları için yeterli teminat bulunmalıdır
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Sigorta poliçesi düzenli olarak yenilenmelidir
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Hasar durumunda sigorta şirketi derhal bilgilendirilmelidir
              </Text>
            </>
          ) : (
            <>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Public liability insurance is recommended for food businesses
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Adequate coverage should be maintained for customer claims
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Insurance policies must be renewed regularly
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
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
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
