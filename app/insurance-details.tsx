import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useTranslation } from '../src/hooks/useTranslation';

export default function InsuranceDetails() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentLanguage } = useTranslation();
  const isTR = currentLanguage === 'tr';
  
  const getInitialFormData = (useTR: boolean) => ({
    hasInsurance: true,
    providerName: useTR ? 'Axa Sigorta' : 'Simply Business',
    policyNumber: useTR ? 'TR-PL-2024-789456' : 'SB-PL-2024-789456',
    coverageAmount: useTR ? '2.000.000 ₺' : '£2,000,000',
    policyType: useTR ? 'İş Yeri Sorumluluk Sigortası' : 'Public Liability Insurance',
    startDate: '2024-01-01',
    expiryDate: '2026-01-01',
    premiumAmount: useTR ? '3.500 ₺' : '£180',
    paymentFrequency: useTR ? 'Yıllık' : 'Annual',
    contactNumber: useTR ? '+90 212 000 0000' : '+44 20 3808 1234',
    emergencyClaimNumber: useTR ? '+90 212 000 1111' : '+44 20 3808 5678',
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
        title: '🛡️ Sigorta Detayları',
        sellerLabel: 'Satıcı',
        edit: 'Düzenle',
        cancel: 'İptal',
        successTitle: 'Başarılı',
        successMessage: 'Sigorta bilgileri başarıyla güncellendi.',
        ok: 'Tamam',
        statusTitle: 'Sigorta Durumu',
        statusNoInsurance: '❌ SİGORTA YOK',
        statusExpired: '❌ SÜRESİ DOLMUŞ',
        statusExpiring: '⚠️ YAKINDA SÜRESİ DOLACAK',
        statusActive: '✅ AKTİF',
        statusMessageNoInsurance: 'Gıda işletmeleri için iş yeri sorumluluk sigortası güçlü şekilde önerilir.',
        statusMessageExpired: 'Sigorta poliçenizin süresi dolmuş. Lütfen hemen yenileyin.',
        statusMessageExpiring: 'Sigorta poliçenizin süresi yakında doluyor. Yenilemeyi düşünün.',
        statusMessageActive: 'Sigortanız aktif ve yeterli teminat sunuyor.',
        actionsTitle: '🔍 Sigorta Sağlayıcıları',
        actionPrimary: '🏛️ Türkiye Sigorta Birliği →',
        actionSecondary: '🛡️ Sigortacılık ve Özel Emeklilik DDK →',
        actionTertiary: '💼 Sigorta Bilgi ve Gözetim Merkezi →',
        toggleLabel: 'İş yeri sorumluluk sigortam var',
        toggleHelper: 'Gıda kaynaklı taleplere karşı koruma için önerilir',
        detailsTitle: 'Poliçe Detayları',
        providerLabel: 'Sigorta Şirketi',
        providerPlaceholder: 'örn. Axa Sigorta, Anadolu Sigorta',
        policyTypeLabel: 'Poliçe Türü',
        policyTypePlaceholder: 'örn. İş Yeri Sorumluluk Sigortası',
        policyNumberLabel: 'Poliçe Numarası',
        policyNumberPlaceholder: 'Poliçe referans numarası',
        coverageLabel: 'Teminat Tutarı',
        coveragePlaceholder: 'örn. 1.000.000 ₺ veya 2.000.000 ₺',
        startDateLabel: 'Başlangıç Tarihi',
        expiryDateLabel: 'Bitiş Tarihi',
        datePlaceholder: 'YYYY-AA-GG',
        premiumLabel: 'Prim Tutarı',
        premiumPlaceholder: 'örn. 3.500 ₺',
        paymentFrequencyLabel: 'Ödeme Sıklığı',
        paymentFrequencyPlaceholder: 'örn. Yıllık, Aylık',
        contactLabel: 'Sigorta İletişim Numarası',
        contactPlaceholder: '+90 212 xxx xxxx',
        emergencyLabel: 'Acil Hasar Hattı',
        emergencyPlaceholder: '+90 212 xxx xxxx',
        saveButton: '💾 Sigorta Bilgilerini Kaydet',
        infoTitle: 'ℹ️ İş Yeri Sorumluluk Sigortası Hakkında',
        infoItems: [
          'İşletmenizin neden olduğu yaralanma veya hasar taleplerine karşı korur',
          'Gıda işletmeleri için sağlık riskleri nedeniyle özellikle önemlidir',
          'Teminatlar genellikle 1M ₺ ile 6M ₺ arasında değişir',
          'Yıllık primler işletme riskine göre değişir',
          'Bazı belediyeler ve platformlar sigorta belgesi isteyebilir',
          'Ek koruma için ürün sorumluluk sigortasını değerlendirin',
        ],
        legalTitle: '⚖️ Yasal Bilgilendirme',
        legalIntro:
          'İş yeri sorumluluk sigortası her durumda yasal zorunluluk olmasa da şu kurumlar tarafından talep edilebilir:',
        legalItems: [
          'Yerel belediyeler (bazı gıda işletmesi kayıtlarında)',
          'Yemek teslim platformları ve pazar yerleri',
          'Pazar/festival gibi etkinlik düzenleyicileri',
          'Ticari mutfak kiralama tesisleri',
        ],
      }
    : {
        title: '🛡️ Insurance Details',
        sellerLabel: 'Seller',
        edit: 'Edit',
        cancel: 'Cancel',
        successTitle: 'Success',
        successMessage: 'Insurance details have been updated successfully.',
        ok: 'OK',
        statusTitle: 'Insurance Status',
        statusNoInsurance: '❌ NO INSURANCE',
        statusExpired: '❌ EXPIRED',
        statusExpiring: '⚠️ EXPIRING SOON',
        statusActive: '✅ ACTIVE',
        statusMessageNoInsurance: 'Public Liability Insurance is strongly recommended for food businesses.',
        statusMessageExpired: 'Your insurance policy has expired. Please renew it immediately.',
        statusMessageExpiring: 'Your insurance policy expires soon. Consider renewing it.',
        statusMessageActive: 'Your Public Liability Insurance is active and provides good coverage.',
        actionsTitle: '🔍 Insurance Providers',
        actionPrimary: '💼 Simply Business →',
        actionSecondary: '🔍 Compare The Market →',
        actionTertiary: '🍪 Biscuit Insurance →',
        toggleLabel: 'I have Public Liability Insurance',
        toggleHelper: 'Recommended for protection against claims from food-related incidents',
        detailsTitle: 'Policy Details',
        providerLabel: 'Insurance Provider',
        providerPlaceholder: 'e.g. Simply Business, AXA, etc.',
        policyTypeLabel: 'Policy Type',
        policyTypePlaceholder: 'e.g. Public Liability Insurance',
        policyNumberLabel: 'Policy Number',
        policyNumberPlaceholder: 'Your policy reference number',
        coverageLabel: 'Coverage Amount',
        coveragePlaceholder: 'e.g. £1,000,000 or £2,000,000',
        startDateLabel: 'Policy Start Date',
        expiryDateLabel: 'Policy Expiry Date',
        datePlaceholder: 'YYYY-MM-DD',
        premiumLabel: 'Premium Amount',
        premiumPlaceholder: 'e.g. £180',
        paymentFrequencyLabel: 'Payment Frequency',
        paymentFrequencyPlaceholder: 'e.g. Annual, Monthly',
        contactLabel: 'Provider Contact Number',
        contactPlaceholder: '+44 20 xxxx xxxx',
        emergencyLabel: 'Emergency Claims Number',
        emergencyPlaceholder: '+44 20 xxxx xxxx',
        saveButton: '💾 Save Insurance Details',
        infoTitle: 'ℹ️ About Public Liability Insurance',
        infoItems: [
          'Protects you against claims for injury or property damage caused by your business',
          'Essential for food businesses due to potential health risks',
          'Typical coverage ranges from £1M to £6M (£2M is common for food businesses)',
          'Annual premiums typically range from £100-£300 for home food businesses',
          'Some councils and platforms may require proof of insurance',
          'Consider Product Liability Insurance for additional protection',
        ],
        legalTitle: '⚖️ Legal Notice',
        legalIntro:
          'While Public Liability Insurance is not legally required for all food businesses, it is strongly recommended and may be required by:',
        legalItems: [
          'Your local council for certain food business registrations',
          'Food delivery platforms and marketplaces',
          'Event organizers if you sell at markets or festivals',
          'Commercial kitchen rental facilities',
        ],
      };

  const handleSave = () => {
    Alert.alert(
      copy.successTitle,
      copy.successMessage,
      [{ text: copy.ok, onPress: () => setIsEditing(false) }]
    );
  };

  const openSimplyBusiness = () => {
    Linking.openURL('https://www.simplybusiness.co.uk/public-liability-insurance/');
  };

  const openCompareTheMarket = () => {
    Linking.openURL('https://www.comparethemarket.com/business-insurance/public-liability/');
  };

  const openBiscuit = () => {
    Linking.openURL('https://www.biscuit.com/public-liability-insurance');
  };

  const openTurkeyInsuranceAssociation = () => {
    Linking.openURL('https://www.tsb.org.tr/');
  };

  const openTurkeyInsuranceAuthority = () => {
    Linking.openURL('https://www.sedddk.gov.tr/');
  };

  const openTurkeyInsuranceInfo = () => {
    Linking.openURL('https://www.sbm.org.tr/');
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
    if (!formData.hasInsurance) return '#6C757D';
    if (isExpired()) return '#DC3545';
    if (isExpiringSoon()) return '#FFC107';
    return '#28A745';
  };

  const getStatusText = () => {
    if (!formData.hasInsurance) return copy.statusNoInsurance;
    if (isExpired()) return copy.statusExpired;
    if (isExpiringSoon()) return copy.statusExpiring;
    return copy.statusActive;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={copy.title}
        leftComponent={
          <TouchableOpacity onPress={() => router.push('/(seller)/dashboard')} style={styles.sellerButton}>
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
          
          <Text variant="body" style={[styles.statusMessage, { color: getStatusColor() }]}>
            {!formData.hasInsurance 
              ? copy.statusMessageNoInsurance
              : isExpired() 
              ? copy.statusMessageExpired
              : isExpiringSoon()
              ? copy.statusMessageExpiring
              : copy.statusMessageActive}
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {copy.actionsTitle}
          </Text>
          {isTR ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={openTurkeyInsuranceAssociation}>
                <Text variant="body" color="primary">{copy.actionPrimary}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={openTurkeyInsuranceAuthority}>
                <Text variant="body" color="primary">{copy.actionSecondary}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={openTurkeyInsuranceInfo}>
                <Text variant="body" color="primary">{copy.actionTertiary}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={openSimplyBusiness}>
                <Text variant="body" color="primary">{copy.actionPrimary}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={openCompareTheMarket}>
                <Text variant="body" color="primary">{copy.actionSecondary}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={openBiscuit}>
                <Text variant="body" color="primary">{copy.actionTertiary}</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Insurance Toggle */}
        <Card variant="default" padding="md" style={styles.toggleCard}>
          <Checkbox
            label={copy.toggleLabel}
            checked={formData.hasInsurance}
            onPress={() => setFormData(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}
            disabled={!isEditing}
            helperText={copy.toggleHelper}
          />
        </Card>

        {/* Insurance Details */}
        {formData.hasInsurance && (
          <Card variant="default" padding="md" style={styles.detailsCard}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {copy.detailsTitle}
            </Text>

            <FormField
              label={copy.providerLabel}
              value={formData.providerName}
              onChangeText={handleInputChange('providerName')}
              editable={isEditing}
              placeholder={copy.providerPlaceholder}
            />

            <FormField
              label={copy.policyTypeLabel}
              value={formData.policyType}
              onChangeText={handleInputChange('policyType')}
              editable={isEditing}
              placeholder={copy.policyTypePlaceholder}
            />

            <FormField
              label={copy.policyNumberLabel}
              value={formData.policyNumber}
              onChangeText={handleInputChange('policyNumber')}
              editable={isEditing}
              placeholder={copy.policyNumberPlaceholder}
            />

            <FormField
              label={copy.coverageLabel}
              value={formData.coverageAmount}
              onChangeText={handleInputChange('coverageAmount')}
              editable={isEditing}
              placeholder={copy.coveragePlaceholder}
            />

            <FormField
              label={copy.startDateLabel}
              value={formData.startDate}
              onChangeText={handleInputChange('startDate')}
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

            <FormField
              label={copy.premiumLabel}
              value={formData.premiumAmount}
              onChangeText={handleInputChange('premiumAmount')}
              editable={isEditing}
              placeholder={copy.premiumPlaceholder}
            />

            <FormField
              label={copy.paymentFrequencyLabel}
              value={formData.paymentFrequency}
              onChangeText={handleInputChange('paymentFrequency')}
              editable={isEditing}
              placeholder={copy.paymentFrequencyPlaceholder}
            />

            <FormField
              label={copy.contactLabel}
              value={formData.contactNumber}
              onChangeText={handleInputChange('contactNumber')}
              editable={isEditing}
              placeholder={copy.contactPlaceholder}
            />

            <FormField
              label={copy.emergencyLabel}
              value={formData.emergencyClaimNumber}
              onChangeText={handleInputChange('emergencyClaimNumber')}
              editable={isEditing}
              placeholder={copy.emergencyPlaceholder}
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
        )}

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

        {/* Legal Notice */}
        <Card variant="default" padding="md" style={styles.legalCard}>
          <Text variant="body" weight="semibold" style={styles.legalTitle}>
            {copy.legalTitle}
          </Text>
          <Text variant="caption" style={[styles.legalText, { color: colors.text }]}>
            {copy.legalIntro}
          </Text>
          {copy.legalItems.map((item) => (
            <Text key={item} variant="caption" style={[styles.legalText, { color: colors.text }]}>
              • {item}
            </Text>
          ))}
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
  toggleCard: {
    marginBottom: Spacing.md,
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
