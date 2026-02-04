import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useTranslation } from '../src/hooks/useTranslation';

export default function GidaGuvenligiEgitimi() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentLanguage } = useTranslation();
  const isTR = currentLanguage === 'tr';
  
  const getInitialFormData = (useTR: boolean) => ({
    certificateLevel: useTR ? 'Temel Seviye' : 'Level 2',
    issueDate: '2024-01-15',
    expiryDate: '2026-01-15',
    certificateNumber: useTR ? 'GGE-2024-789456' : 'CIEH-FS-2024-789456',
    holderName: 'Fatma Teyze',
    institution: useTR ? 'Tarım ve Orman Bakanlığı' : 'CIEH',
    hasTraining: true,
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
        ? 'Gıda güvenliği eğitimi bilgileri başarıyla güncellendi.'
        : 'Food safety training details have been updated successfully.',
      [{ 
        text: isTR ? 'Tamam' : 'OK', 
        onPress: () => setIsEditing(false) 
      }]
    );
  };

  const openTrainingWebsite = () => {
    if (isTR) {
      Linking.openURL('https://www.tarimorman.gov.tr');
    } else {
      Linking.openURL('https://www.cieh.org/training/');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: isTR ? '🏛️ Gıda Güvenliği Eğitimi' : '🏛️ Food Safety Training',
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
              {isTR ? 'Eğitim Durumu' : 'Training Status'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: formData.hasTraining ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {isTR 
                  ? (formData.hasTraining ? '✅ TAMAMLANDI' : '⏳ BEKLEMEDE')
                  : (formData.hasTraining ? '✅ COMPLETED' : '⏳ PENDING')
                }
              </Text>
            </View>
          </View>
          
          {formData.hasTraining && (
            <Text variant="body" color="success" style={styles.statusMessage}>
              {isTR 
                ? 'Gıda güvenliği eğitiminiz tamamlanmış ve sertifikanız geçerli.'
                : 'Your food safety training is completed and certificate is valid.'
              }
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {isTR ? '📋 Hızlı İşlemler' : '📋 Quick Actions'}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openTrainingWebsite}>
            <Text variant="body" color="primary">
              {isTR 
                ? '🌐 Tarım ve Orman Bakanlığı →'
                : '🌐 CIEH Training Courses →'
              }
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Training Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {isTR ? 'Eğitim Detayları' : 'Training Details'}
          </Text>

          <FormField
            label={isTR ? 'Eğitim Seviyesi' : 'Training Level'}
            value={formData.certificateLevel}
            onChangeText={handleInputChange('certificateLevel')}
            editable={isEditing}
            placeholder={isTR ? 'Temel Seviye' : 'Level 2'}
          />

          <FormField
            label={isTR ? 'Sertifika Numarası' : 'Certificate Number'}
            value={formData.certificateNumber}
            onChangeText={handleInputChange('certificateNumber')}
            editable={isEditing}
            placeholder={isTR ? 'GGE-2024-789456' : 'Certificate number'}
          />

          <FormField
            label={isTR ? 'Sertifika Sahibi' : 'Certificate Holder'}
            value={formData.holderName}
            onChangeText={handleInputChange('holderName')}
            editable={isEditing}
            placeholder={isTR ? 'Tam adınız' : 'Your full name'}
          />

          <FormField
            label={isTR ? 'Eğitim Kurumu' : 'Training Institution'}
            value={formData.institution}
            onChangeText={handleInputChange('institution')}
            editable={isEditing}
            placeholder={isTR ? 'Tarım ve Orman Bakanlığı' : 'Training provider'}
          />

          <FormField
            label={isTR ? 'Düzenleme Tarihi' : 'Issue Date'}
            value={formData.issueDate}
            onChangeText={handleInputChange('issueDate')}
            editable={isEditing}
            placeholder={isTR ? 'YYYY-AA-GG' : 'YYYY-MM-DD'}
          />

          <FormField
            label={isTR ? 'Geçerlilik Tarihi' : 'Expiry Date'}
            value={formData.expiryDate}
            onChangeText={handleInputChange('expiryDate')}
            editable={isEditing}
            placeholder={isTR ? 'YYYY-AA-GG' : 'YYYY-MM-DD'}
          />

          <Checkbox
            label={isTR 
              ? 'Gıda güvenliği eğitimimi tamamladım'
              : 'I have completed food safety training'
            }
            checked={formData.hasTraining}
            onPress={() => setFormData(prev => ({ ...prev, hasTraining: !prev.hasTraining }))}
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
                • Gıda işletmesi sahipleri gıda güvenliği eğitimi almalıdır
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Eğitim sertifikası düzenli olarak yenilenmelidir
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Çalışanlar da temel gıda güvenliği eğitimi almalıdır
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Eğitim kayıtları denetim sırasında ibraz edilmelidir
              </Text>
            </>
          ) : (
            <>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Food business owners must complete food safety training
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Training certificates must be renewed regularly
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Staff must also receive basic food safety training
              </Text>
              <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
                • Training records must be available during inspections
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
