import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button, FormField } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useTranslation } from '../src/hooks/useTranslation';

export default function HygieneRating() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentLanguage } = useTranslation();
  const isTR = currentLanguage === 'tr';
  
  const getInitialFormData = (useTR: boolean) => ({
    currentRating: 5,
    lastInspectionDate: '2024-11-15',
    nextInspectionDue: '2025-11-15',
    inspectorName: useTR ? 'Mehmet Yılmaz' : 'Sarah Johnson',
    councilName: useTR ? 'Kadıköy Belediyesi' : 'Westminster City Council',
    inspectionType: useTR ? 'Rutin Denetim' : 'Routine Inspection',
    businessName: useTR ? 'Fatma Teyze Ev Mutfağı' : 'Fatma Teyze Home Kitchen',
    businessAddress: useTR ? 'Kadıköy, İstanbul' : 'SW1A 1AA, Westminster, London',
    certificateNumber: useTR ? 'KDK-HIJ-2024-001' : 'WCC-HR-2024-001',
    status: 'active' as 'active' | 'pending' | 'overdue',
  });

  const [formData, setFormData] = useState(getInitialFormData(isTR));

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRatingSelect = (rating: number | 'pending') => {
    if (!isEditing) return;
    
    if (rating === 'pending') {
      setFormData(prev => ({ ...prev, status: 'pending' }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        currentRating: rating,
        status: 'active'
      }));
    }
  };

  useEffect(() => {
    if (!isEditing) {
      setFormData(getInitialFormData(isTR));
    }
  }, [currentLanguage, isEditing, isTR]);

  const copy = isTR
    ? {
        title: '🏛️ Hijyen Denetimi',
        sellerLabel: 'Satıcı',
        edit: 'Düzenle',
        cancel: 'İptal',
        successTitle: 'Başarılı',
        successMessage: 'Hijyen denetimi bilgileri başarıyla güncellendi.',
        ok: 'Tamam',
        statusTitle: 'Mevcut Derece',
        statusPending: '⏳ DENETİM BEKLEMEDE',
        statusOverdue: '❌ DENETİM GECİKMİŞ',
        statusRating: '⭐ DERECE: {{rating}}/5',
        ratingDesc: {
          5: 'Çok İyi',
          4: 'İyi',
          3: 'Genel Olarak Yeterli',
          2: 'İyileştirme Gerekli',
          1: 'Ciddi İyileştirme Gerekli',
          0: 'Acil İyileştirme Gerekli',
        } as Record<number, string>,
        statusMessagePending:
          'Gıda hijyeni denetiminiz beklemede. Denetim sonrası dereceniz bildirilecektir.',
        statusMessageOverdue:
          'Hijyen denetiminiz gecikmiş görünüyor. Lütfen belediyenizle iletişime geçin.',
        statusMessageActive:
          'İşletmeniz başarılı bir hijyen derecesi aldı. Son denetim tarihi: {{date}}.',
        actionsTitle: '🔍 Gıda Denetimi Bilgileri',
        actionPrimary: '🌐 Tarım ve Orman Bakanlığı →',
        actionSecondary: '🏛️ Belediye Bilgileri →',
        actionTertiary: '📋 Denetim Talebi →',
        requestTitle: 'Denetim Talebi',
        requestMessage: 'Belediyenizden yeni bir hijyen denetimi talep etmek ister misiniz?',
        requestCancel: 'İptal',
        requestConfirm: 'Talep Et',
        requestSentTitle: 'Talep Gönderildi',
        requestSentMessage: 'Denetim talebiniz belediyeye iletildi.',
        ratingSelectTitle: 'Derecenizi Seçin',
        ratingPending: 'Denetim Bekleniyor',
        detailsTitle: 'Denetim Detayları',
        businessNameLabel: 'İşletme Adı',
        businessNamePlaceholder: 'Kayıtlı işletme adınız',
        businessAddressLabel: 'İşletme Adresi',
        businessAddressPlaceholder: 'Tam işletme adresi',
        councilLabel: 'Yerel Belediye',
        councilPlaceholder: 'örn. Kadıköy Belediyesi',
        lastInspectionLabel: 'Son Denetim Tarihi',
        nextInspectionLabel: 'Sonraki Denetim Tarihi',
        datePlaceholder: 'YYYY-AA-GG',
        inspectorLabel: 'Denetçi Adı',
        inspectorPlaceholder: 'Gıda denetçisi adı',
        inspectionTypeLabel: 'Denetim Türü',
        inspectionTypePlaceholder: 'örn. Rutin, Takip, Şikayet',
        certificateLabel: 'Belge Numarası',
        certificatePlaceholder: 'Resmi belge referansı',
        saveButton: '💾 Denetim Bilgilerini Kaydet',
        infoTitle: 'ℹ️ Hijyen Derecesi Açıklaması',
        infoItems: [
          { label: '5 - Çok İyi', desc: 'Mükemmel hijyen standartları' },
          { label: '4 - İyi', desc: 'İyi hijyen standartları' },
          { label: '3 - Genel Olarak Yeterli', desc: 'Hijyen standartları yeterli' },
          { label: '2 - İyileştirme Gerekli', desc: 'Bazı iyileştirmeler gerekli' },
          { label: '1 - Ciddi İyileştirme Gerekli', desc: 'Ciddi iyileştirme gerekli' },
          { label: '0 - Acil İyileştirme Gerekli', desc: 'Acil iyileştirme gerekli' },
        ],
      }
    : {
        title: '🏛️ Food Hygiene Rating',
        sellerLabel: 'Seller',
        edit: 'Edit',
        cancel: 'Cancel',
        successTitle: 'Success',
        successMessage: 'Hygiene rating details have been updated successfully.',
        ok: 'OK',
        statusTitle: 'Current Rating',
        statusPending: '⏳ INSPECTION PENDING',
        statusOverdue: '❌ INSPECTION OVERDUE',
        statusRating: '⭐ RATING: {{rating}}/5',
        ratingDesc: {
          5: 'Very Good',
          4: 'Good',
          3: 'Generally Satisfactory',
          2: 'Improvement Necessary',
          1: 'Major Improvement Necessary',
          0: 'Urgent Improvement Necessary',
        } as Record<number, string>,
        statusMessagePending:
          'Your food hygiene inspection is pending. You will receive your rating after the inspection.',
        statusMessageOverdue: 'Your hygiene inspection is overdue. Please contact your local council.',
        statusMessageActive:
          'Your business has received an excellent hygiene rating. Last inspected on {{date}}.',
        actionsTitle: '🔍 Hygiene Rating Information',
        actionPrimary: '📖 About Food Hygiene Rating Scheme →',
        actionSecondary: '🔍 Search Business Ratings →',
        actionTertiary: '📋 Request New Inspection →',
        requestTitle: 'Request Inspection',
        requestMessage: 'Would you like to request a new hygiene inspection from your local council?',
        requestCancel: 'Cancel',
        requestConfirm: 'Request',
        requestSentTitle: 'Request Sent',
        requestSentMessage: 'Your inspection request has been sent to Westminster City Council.',
        ratingSelectTitle: 'Select Your Rating',
        ratingPending: 'Inspection Pending',
        detailsTitle: 'Inspection Details',
        businessNameLabel: 'Business Name',
        businessNamePlaceholder: 'Your registered business name',
        businessAddressLabel: 'Business Address',
        businessAddressPlaceholder: 'Full business address',
        councilLabel: 'Local Council',
        councilPlaceholder: 'e.g. Westminster City Council',
        lastInspectionLabel: 'Last Inspection Date',
        nextInspectionLabel: 'Next Inspection Due',
        datePlaceholder: 'YYYY-MM-DD',
        inspectorLabel: 'Inspector Name',
        inspectorPlaceholder: 'Name of the food safety inspector',
        inspectionTypeLabel: 'Inspection Type',
        inspectionTypePlaceholder: 'e.g. Routine, Follow-up, Complaint',
        certificateLabel: 'Certificate Number',
        certificatePlaceholder: 'Official certificate reference',
        saveButton: '💾 Save Rating Details',
        infoTitle: 'ℹ️ Understanding Food Hygiene Ratings',
        infoItems: [
          { label: '5 - Very Good', desc: 'Excellent hygiene standards' },
          { label: '4 - Good', desc: 'Good hygiene standards' },
          { label: '3 - Generally Satisfactory', desc: 'Hygiene standards are generally satisfactory' },
          { label: '2 - Improvement Necessary', desc: 'Some improvement necessary' },
          { label: '1 - Major Improvement Necessary', desc: 'Major improvement necessary' },
          { label: '0 - Urgent Improvement Necessary', desc: 'Urgent improvement necessary' },
        ],
      };

  const handleSave = () => {
    Alert.alert(
      copy.successTitle,
      copy.successMessage,
      [{ text: copy.ok, onPress: () => setIsEditing(false) }]
    );
  };

  const openFSAWebsite = () => {
    if (isTR) {
      Linking.openURL('https://www.tarimorman.gov.tr/');
      return;
    }
    Linking.openURL('https://www.food.gov.uk/safety-hygiene/food-hygiene-rating-scheme');
  };

  const openRatingSearch = () => {
    if (isTR) {
      Linking.openURL('https://www.turkiye.gov.tr/belediyeler');
      return;
    }
    Linking.openURL('https://ratings.food.gov.uk/');
  };

  const requestInspection = () => {
    Alert.alert(
      copy.requestTitle,
      copy.requestMessage,
      [
        { text: copy.requestCancel, style: 'cancel' },
        { 
          text: copy.requestConfirm, 
          onPress: () => {
            Alert.alert(copy.requestSentTitle, copy.requestSentMessage);
          }
        },
      ]
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#28A745';
    if (rating >= 3) return '#FFC107';
    return '#DC3545';
  };

  const getRatingDescription = (rating: number) => {
    return copy.ratingDesc[rating] ?? (isTR ? 'Bilinmiyor' : 'Unknown');
  };

  const getStatusColor = () => {
    if (formData.status === 'pending') return '#FFC107';
    if (formData.status === 'overdue') return '#DC3545';
    return getRatingColor(formData.currentRating);
  };

  const getStatusText = () => {
    if (formData.status === 'pending') return copy.statusPending;
    if (formData.status === 'overdue') return copy.statusOverdue;
    return copy.statusRating.replace('{{rating}}', String(formData.currentRating));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={copy.title}
        leftComponent={
          <TouchableOpacity onPress={() => router.push('/(seller)/seller-panel')} style={styles.sellerButton}>
            <Text variant="body" color="text" style={styles.sellerText}>
              {copy.sellerLabel} <Text style={styles.sellerIcon}>●</Text>
            </Text>
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
            <Text variant="body" color="primary">{isEditing ? copy.cancel : copy.edit}</Text>
          </TouchableOpacity>
        }
      />

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
          
          {formData.status === 'active' && (
            <View style={styles.ratingDisplay}>
              <Text variant="heading" style={[styles.ratingNumber, { color: getRatingColor(formData.currentRating) }]}>
                {formData.currentRating}/5
              </Text>
              <Text variant="body" style={[styles.ratingDescription, { color: getRatingColor(formData.currentRating) }]}>
                {getRatingDescription(formData.currentRating)}
              </Text>
            </View>
          )}
          
          <Text variant="body" style={[styles.statusMessage, { color: getStatusColor() }]}>
            {formData.status === 'pending' 
              ? copy.statusMessagePending
              : formData.status === 'overdue'
              ? copy.statusMessageOverdue
              : copy.statusMessageActive.replace('{{date}}', formData.lastInspectionDate)
            }
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {copy.actionsTitle}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openFSAWebsite}>
            <Text variant="body" color="primary">{copy.actionPrimary}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openRatingSearch}>
            <Text variant="body" color="primary">{copy.actionSecondary}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={requestInspection}>
            <Text variant="body" color="primary">{copy.actionTertiary}</Text>
          </TouchableOpacity>
        </Card>

        {/* Rating Selection */}
        {isEditing && (
          <Card variant="default" padding="md" style={styles.ratingCard}>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              {copy.ratingSelectTitle}
            </Text>
            
            <View style={styles.ratingOptions}>
              {[5, 4, 3, 2, 1, 0].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingOption,
                    formData.currentRating === rating && formData.status === 'active' && styles.ratingOptionSelected,
                    { borderColor: getRatingColor(rating) }
                  ]}
                  onPress={() => handleRatingSelect(rating)}
                >
                  <Text variant="body" weight="bold" style={[styles.ratingOptionNumber, { color: getRatingColor(rating) }]}>
                    {rating}
                  </Text>
                  <Text variant="caption" style={[styles.ratingOptionText, { color: getRatingColor(rating) }]}>
                    {getRatingDescription(rating)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[
                  styles.ratingOption,
                  formData.status === 'pending' && styles.ratingOptionSelected,
                  { borderColor: '#FFC107' }
                ]}
                onPress={() => handleRatingSelect('pending')}
              >
                <Text variant="body" weight="bold" style={[styles.ratingOptionNumber, { color: '#FFC107' }]}>
                  ⏳
                </Text>
                <Text variant="caption" style={[styles.ratingOptionText, { color: '#FFC107' }]}>
                  {copy.ratingPending}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Inspection Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {copy.detailsTitle}
          </Text>

          <FormField
            label={copy.businessNameLabel}
            value={formData.businessName}
            onChangeText={handleInputChange('businessName')}
            editable={isEditing}
            placeholder={copy.businessNamePlaceholder}
          />

          <FormField
            label={copy.businessAddressLabel}
            value={formData.businessAddress}
            onChangeText={handleInputChange('businessAddress')}
            editable={isEditing}
            placeholder={copy.businessAddressPlaceholder}
          />

          <FormField
            label={copy.councilLabel}
            value={formData.councilName}
            onChangeText={handleInputChange('councilName')}
            editable={isEditing}
            placeholder={copy.councilPlaceholder}
          />

          <FormField
            label={copy.lastInspectionLabel}
            value={formData.lastInspectionDate}
            onChangeText={handleInputChange('lastInspectionDate')}
            editable={isEditing}
            placeholder={copy.datePlaceholder}
          />

          <FormField
            label={copy.nextInspectionLabel}
            value={formData.nextInspectionDue}
            onChangeText={handleInputChange('nextInspectionDue')}
            editable={isEditing}
            placeholder={copy.datePlaceholder}
          />

          <FormField
            label={copy.inspectorLabel}
            value={formData.inspectorName}
            onChangeText={handleInputChange('inspectorName')}
            editable={isEditing}
            placeholder={copy.inspectorPlaceholder}
          />

          <FormField
            label={copy.inspectionTypeLabel}
            value={formData.inspectionType}
            onChangeText={handleInputChange('inspectionType')}
            editable={isEditing}
            placeholder={copy.inspectionTypePlaceholder}
          />

          <FormField
            label={copy.certificateLabel}
            value={formData.certificateNumber}
            onChangeText={handleInputChange('certificateNumber')}
            editable={isEditing}
            placeholder={copy.certificatePlaceholder}
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

        {/* Rating Information */}
        <Card variant="default" padding="md" style={styles.infoCard}>
          <Text variant="body" weight="semibold" style={styles.infoTitle}>
            {copy.infoTitle}
          </Text>
          <View style={styles.ratingInfo}>
            {copy.infoItems.map((item, index) => (
              <Text
                key={item.label}
                variant="caption"
                style={[
                  styles.infoText,
                  { color: index <= 1 ? '#28A745' : index === 2 ? '#FFC107' : '#DC3545' }
                ]}
              >
                <Text weight="bold">{item.label}:</Text> {item.desc}
              </Text>
            ))}
          </View>
        </Card>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
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
  ratingDisplay: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  ratingDescription: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.xs,
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
  ratingCard: {
    marginBottom: Spacing.md,
  },
  ratingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ratingOption: {
    flex: 1,
    minWidth: 100,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
  },
  ratingOptionSelected: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  },
  ratingOptionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  ratingOptionText: {
    textAlign: 'center',
    fontSize: 11,
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
  ratingInfo: {
    gap: Spacing.xs,
  },
  infoText: {
    lineHeight: 18,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
