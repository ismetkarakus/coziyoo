import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useTranslation } from '../src/hooks/useTranslation';

export default function HygieneCertificate() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentLanguage } = useTranslation();
  const isTR = currentLanguage === 'tr';
  
  const getInitialFormData = (useTR: boolean) => ({
    certificateLevel: useTR ? 'Seviye 2' : 'Level 2',
    issueDate: '2023-12-15',
    expiryDate: '2025-12-15',
    certificateNumber: useTR ? 'GH-2023-789456' : 'CIEH-FS-2023-789456',
    holderName: useTR ? 'Fatma Teyze' : 'Fatma Teyze',
    hasCertificate: true,
    certificateImageUri: null as string | null,
  });

  const [formData, setFormData] = useState(getInitialFormData(isTR));

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isEditing) {
      setFormData(getInitialFormData(isTR));
    }
  }, [currentLanguage, isEditing, isTR]);

  const copy = isTR
    ? {
        title: '📜 Gıda Hijyeni Sertifikası',
        edit: 'Düzenle',
        cancel: 'İptal',
        successTitle: 'Başarılı',
        successMessage: 'Gıda hijyeni sertifika bilgileri başarıyla güncellendi.',
        ok: 'Tamam',
        uploadTitle: 'Sertifika Yükle',
        uploadMessage: 'Lütfen gıda hijyeni sertifikanızın görselini seçin.',
        camera: 'Kamera',
        gallery: 'Galeri',
        statusTitle: 'Sertifika Durumu',
        statusExpired: '❌ SÜRESİ DOLMUŞ',
        statusExpiring: '⚠️ YAKINDA SÜRESİ DOLACAK',
        statusValid: '✅ GEÇERLİ',
        statusMessageExpired: 'Sertifikanızın süresi dolmuş. Lütfen hemen yenileyin.',
        statusMessageExpiring: 'Sertifikanızın süresi yakında doluyor. Yenilemeyi düşünün.',
        statusMessageValid: 'Gıda hijyeni sertifikanız geçerli ve güncel.',
        trainingLinkLabel: '📜 Hijyen Eğitimi Bilgisi →',
        uploadSectionTitle: '📸 Sertifika Görseli',
        changeImage: 'Görseli Değiştir',
        noImage: 'Sertifika görseli yüklenmedi',
        uploadButton: '📸 Sertifika Yükle',
        detailsTitle: 'Sertifika Detayları',
        levelLabel: 'Sertifika Seviyesi',
        levelPlaceholder: 'örn. Seviye 2',
        holderLabel: 'Sertifika Sahibi',
        holderPlaceholder: 'Sertifikadaki tam ad',
        numberLabel: 'Sertifika Numarası',
        numberPlaceholder: 'Sertifika referans numarası',
        issueDateLabel: 'Düzenleme Tarihi',
        expiryDateLabel: 'Geçerlilik Tarihi',
        datePlaceholder: 'YYYY-AA-GG',
        hasCertificateLabel: 'Geçerli bir gıda hijyeni sertifikam var',
        saveButton: '💾 Değişiklikleri Kaydet',
        infoTitle: 'ℹ️ Gıda Hijyeni Sertifikası Hakkında',
        infoItems: [
          'Seviye 2 Gıda Güvenliği ve Hijyen eğitimi gıda çalışanları için standart gerekliliktir',
          'Sertifikalar genellikle düzenleme tarihinden itibaren 3 yıl geçerlidir',
          'Online eğitimler mevcuttur ve yaygın olarak kabul edilir',
          'Sertifika müşteri güvenini artırır ve profesyonellik gösterir',
          'Bazı belediyeler gıda işletmesi kaydı için bu sertifikayı isteyebilir',
        ],
      }
    : {
        title: '📜 Food Hygiene Certificate',
        edit: 'Edit',
        cancel: 'Cancel',
        successTitle: 'Success',
        successMessage: 'Food hygiene certificate details have been updated successfully.',
        ok: 'OK',
        uploadTitle: 'Upload Certificate',
        uploadMessage: 'Please select your food hygiene certificate image.',
        camera: 'Camera',
        gallery: 'Gallery',
        statusTitle: 'Certificate Status',
        statusExpired: '❌ EXPIRED',
        statusExpiring: '⚠️ EXPIRING SOON',
        statusValid: '✅ VALID',
        statusMessageExpired: 'Your certificate has expired. Please renew it immediately.',
        statusMessageExpiring: 'Your certificate expires soon. Consider renewing it.',
        statusMessageValid: 'Your food hygiene certificate is valid and up to date.',
        trainingLinkLabel: '📜 Level 2 Certificate →',
        uploadSectionTitle: '📸 Certificate Image',
        changeImage: 'Change Image',
        noImage: 'No certificate image uploaded',
        uploadButton: '📸 Upload Certificate',
        detailsTitle: 'Certificate Details',
        levelLabel: 'Certificate Level',
        levelPlaceholder: 'e.g. Level 2',
        holderLabel: 'Certificate Holder Name',
        holderPlaceholder: 'Full name on certificate',
        numberLabel: 'Certificate Number',
        numberPlaceholder: 'Certificate reference number',
        issueDateLabel: 'Issue Date',
        expiryDateLabel: 'Expiry Date',
        datePlaceholder: 'YYYY-MM-DD',
        hasCertificateLabel: 'I have a valid Food Hygiene certificate',
        saveButton: '💾 Save Changes',
        infoTitle: 'ℹ️ About Food Hygiene Certificates',
        infoItems: [
          'Level 2 Food Safety & Hygiene is the standard requirement for food handlers',
          'Certificates are typically valid for 3 years from issue date',
          'Online courses are available and widely accepted',
          'Having a certificate builds customer trust and demonstrates professionalism',
          'Some councils may require this certificate for food business registration',
        ],
      };

  const handleSave = () => {
    Alert.alert(
      copy.successTitle,
      copy.successMessage,
      [{ text: copy.ok, onPress: () => setIsEditing(false) }]
    );
  };



  const uploadCertificate = () => {
    Alert.alert(
      copy.uploadTitle,
      copy.uploadMessage,
      [
        { text: copy.camera, onPress: () => console.log('Open camera') },
        { text: copy.gallery, onPress: () => console.log('Open gallery') },
        { text: copy.cancel, style: 'cancel' },
      ]
    );
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(formData.expiryDate);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  };

  const isExpired = () => {
    const expiryDate = new Date(formData.expiryDate);
    const today = new Date();
    return expiryDate < today;
  };

  const getStatusColor = () => {
    if (isExpired()) return '#DC3545';
    if (isExpiringSoon()) return '#FFC107';
    return '#28A745';
  };

  const getStatusText = () => {
    if (isExpired()) return copy.statusExpired;
    if (isExpiringSoon()) return copy.statusExpiring;
    return copy.statusValid;
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: copy.title,
          headerBackVisible: false, // Otomatik geri butonunu gizle
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <Text variant="body" color="primary">
                {isEditing ? copy.cancel : copy.edit}
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
              {copy.statusTitle}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          {formData.hasCertificate && (
            <Text variant="body" style={[styles.statusMessage, { color: getStatusColor() }]}>
              {isExpired()
                ? copy.statusMessageExpired
                : isExpiringSoon()
                ? copy.statusMessageExpiring
                : copy.statusMessageValid}
            </Text>
          )}
        </Card>



        {/* Level 2 Certificate Link */}
        <View style={styles.level2Container}>
          <TouchableOpacity 
            style={styles.level2Button}
            onPress={() =>
              Linking.openURL(
                isTR
                  ? 'https://www.tarimorman.gov.tr/'
                  : 'https://www.food.gov.uk/business-guidance/food-safety-training'
              )
            }
          >
            <Text variant="caption" color="primary" style={styles.level2ButtonText}>
              {copy.trainingLinkLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Certificate Upload */}
        <Card variant="default" padding="md" style={styles.uploadCard}>
          <Text variant="body" weight="semibold" style={styles.uploadTitle}>
            {copy.uploadSectionTitle}
          </Text>
          
          {formData.certificateImageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: formData.certificateImageUri }} style={styles.certificateImage} />
              {isEditing && (
                <Button variant="outline" onPress={uploadCertificate} style={styles.changeImageButton}>
                  {copy.changeImage}
                </Button>
              )}
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text variant="body" color="textSecondary" style={styles.noImageText}>
                {copy.noImage}
              </Text>
              {isEditing && (
                <Button variant="primary" onPress={uploadCertificate} style={styles.uploadButton}>
                  {copy.uploadButton}
                </Button>
              )}
            </View>
          )}
        </Card>

        {/* Certificate Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {copy.detailsTitle}
          </Text>

          <FormField
            label={copy.levelLabel}
            value={formData.certificateLevel}
            onChangeText={handleInputChange('certificateLevel')}
            editable={isEditing}
            placeholder={copy.levelPlaceholder}
          />


          <FormField
            label={copy.holderLabel}
            value={formData.holderName}
            onChangeText={handleInputChange('holderName')}
            editable={isEditing}
            placeholder={copy.holderPlaceholder}
          />

          <FormField
            label={copy.numberLabel}
            value={formData.certificateNumber}
            onChangeText={handleInputChange('certificateNumber')}
            editable={isEditing}
            placeholder={copy.numberPlaceholder}
          />

          <FormField
            label={copy.issueDateLabel}
            value={formData.issueDate}
            onChangeText={handleInputChange('issueDate')}
            editable={isEditing}
            placeholder={copy.datePlaceholder}
          />

          <FormField
            label={copy.expiryDateLabel}
            value={formData.expiryDate}
            onChangeText={handleInputChange('expiryDate')}
            editable={isEditing}
            placeholder={copy.datePlaceholder}
          />

          <Checkbox
            label={copy.hasCertificateLabel}
            checked={formData.hasCertificate}
            onPress={() => setFormData(prev => ({ ...prev, hasCertificate: !prev.hasCertificate }))}
            disabled={!isEditing}
          />

          {isEditing && (
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              {copy.saveButton}
            </Button>
          )}
        </Card>

        {/* Information */}
        <Card variant="default" padding="md" style={styles.infoCard}>
          <Text variant="body" weight="semibold" style={styles.infoTitle}>
            {copy.infoTitle}
          </Text>
          {copy.infoItems.map((item) => (
            <Text key={item} variant="caption" style={styles.infoText}>
              • {item}
            </Text>
          ))}
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
  level2Container: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  level2Button: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(127, 175, 154, 0.3)',
  },
  level2ButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  uploadCard: {
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    marginBottom: Spacing.sm,
    color: Colors.light.primary,
  },
  imageContainer: {
    alignItems: 'center',
  },
  certificateImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  changeImageButton: {
    width: '50%',
  },
  noImageContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
  },
  noImageText: {
    marginBottom: Spacing.md,
  },
  uploadButton: {
    width: '60%',
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
  infoCard: {
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  infoTitle: {
    marginBottom: Spacing.sm,
    color: '#1976D2',
  },
  infoText: {
    marginBottom: Spacing.xs,
    lineHeight: 18,
    color: Colors.light.text,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
