import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useTranslation } from '../src/hooks/useTranslation';

export default function VergiLevhasi() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentLanguage } = useTranslation();
  const isTR = currentLanguage === 'tr';
  
  const getInitialFormData = (useTR: boolean) => ({
    vergiNo: '1234567890',
    issueDate: '2024-01-15',
    businessName: useTR ? 'Ev Mutfağı' : 'Home Kitchen',
    holderName: 'Fatma Teyze',
    address: useTR ? 'Kadıköy, İstanbul' : 'Kadikoy, Istanbul',
    hasVergiLevhasi: true,
    certificateImageUri: null as string | null,
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
        ? 'Vergi levhası bilgileri başarıyla güncellendi.'
        : 'Tax certificate details have been updated successfully.',
      [{ 
        text: isTR ? 'Tamam' : 'OK', 
        onPress: () => setIsEditing(false) 
      }]
    );
  };

  const openTaxWebsite = () => {
    if (isTR) {
      Linking.openURL('https://www.gib.gov.tr');
    } else {
      Linking.openURL('https://www.gov.uk/business-tax');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: isTR ? '📜 Vergi Levhası' : '📜 Tax Certificate',
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
              {isTR ? 'Vergi Levhası Durumu' : 'Tax Certificate Status'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: formData.hasVergiLevhasi ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {isTR 
                  ? (formData.hasVergiLevhasi ? '✅ GEÇERLİ' : '⏳ BEKLEMEDE')
                  : (formData.hasVergiLevhasi ? '✅ VALID' : '⏳ PENDING')
                }
              </Text>
            </View>
          </View>
          
          {formData.hasVergiLevhasi && (
            <Text variant="body" color="success" style={styles.statusMessage}>
              {isTR 
                ? 'Vergi levhanız geçerli ve güncel.'
                : 'Your tax certificate is valid and up to date.'
              }
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {isTR ? '📋 Hızlı İşlemler' : '📋 Quick Actions'}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openTaxWebsite}>
            <Text variant="body" color="primary">
              {isTR 
                ? '🌐 Gelir İdaresi Başkanlığı →'
                : '🌐 Tax Authority Website →'
              }
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Certificate Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {isTR ? 'Vergi Levhası Detayları' : 'Tax Certificate Details'}
          </Text>

          <FormField
            label={isTR ? 'Vergi Numarası' : 'Tax Number'}
            value={formData.vergiNo}
            onChangeText={handleInputChange('vergiNo')}
            editable={isEditing}
            placeholder={isTR ? '1234567890' : 'Tax number'}
          />

          <FormField
            label={isTR ? 'İşletme Adı' : 'Business Name'}
            value={formData.businessName}
            onChangeText={handleInputChange('businessName')}
            editable={isEditing}
            placeholder={isTR ? 'İşletme adınız' : 'Your business name'}
          />

          <FormField
            label={isTR ? 'Sahip Adı' : 'Owner Name'}
            value={formData.holderName}
            onChangeText={handleInputChange('holderName')}
            editable={isEditing}
            placeholder={isTR ? 'Tam adınız' : 'Your full name'}
          />

          <FormField
            label={isTR ? 'Adres' : 'Address'}
            value={formData.address}
            onChangeText={handleInputChange('address')}
            editable={isEditing}
            placeholder={isTR ? 'İş yeri adresi' : 'Business address'}
          />

          <FormField
            label={isTR ? 'Düzenleme Tarihi' : 'Issue Date'}
            value={formData.issueDate}
            onChangeText={handleInputChange('issueDate')}
            editable={isEditing}
            placeholder={isTR ? 'YYYY-AA-GG' : 'YYYY-MM-DD'}
          />

          <Checkbox
            label={isTR 
              ? 'Geçerli vergi levhasına sahibim'
              : 'I have a valid tax certificate'
            }
            checked={formData.hasVergiLevhasi}
            onPress={() => setFormData(prev => ({ ...prev, hasVergiLevhasi: !prev.hasVergiLevhasi }))}
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
                • Gıda işletmesi olarak vergi levhanız bulunmalıdır
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Vergi numaranız tüm belgelerde yer almalıdır
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Yıllık vergi beyannamelerinizi zamanında vermelisiniz
              </Text>
            </>
          ) : (
            <>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • You must have a valid tax registration for your food business
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Your tax number must appear on all official documents
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Annual tax returns must be filed on time
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
