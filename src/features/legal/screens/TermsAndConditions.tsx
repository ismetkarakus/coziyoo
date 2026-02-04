import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, BackHandler } from 'react-native';
import { Text, Button, Checkbox } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { router, useFocusEffect } from 'expo-router';
import { useCountry } from '../../../context/CountryContext';
import { useAuth } from '../../../context/AuthContext';

export const TermsAndConditions: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();
  const { userData } = useAuth();
  const isTR = currentCountry.code === 'TR';
  const isBuyer =
    userData?.userType === 'buyer' ||
    userData?.userType === 'both' ||
    (userData as any)?.buyerEnabled === true ||
    !userData;
  const isSeller =
    userData?.userType === 'seller' ||
    userData?.userType === 'both' ||
    (userData as any)?.sellerEnabled === true;

  const [buyerSteps, setBuyerSteps] = useState({
    platformRole: false,
    allergenWarning: false,
    liability: false,
    orderRules: false,
  });
  const [sellerSteps, setSellerSteps] = useState({
    responsibilities: false,
    compliance: false,
    allergenAccuracy: false,
    inspections: false,
    termination: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const buyerAccepted = useMemo(
    () => (!isBuyer ? true : Object.values(buyerSteps).every(Boolean)),
    [buyerSteps, isBuyer]
  );
  const sellerAccepted = useMemo(
    () => (!isSeller ? true : Object.values(sellerSteps).every(Boolean)),
    [sellerSteps, isSeller]
  );
  const termsAccepted = buyerAccepted && sellerAccepted;
  const sectionTitleStyle = [styles.sectionTitle, { color: colors.text }];

  // Prevent back navigation without accepting terms
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!termsAccepted) {
          Alert.alert(
            isTR ? 'Şartlar ve Koşullar Gerekli' : 'Terms & Conditions Required',
            isTR
              ? 'Devam etmek için şartlar ve koşulları okuyup kabul etmelisiniz.'
              : 'You must read and accept the Terms & Conditions before proceeding.',
            [{ text: isTR ? 'Tamam' : 'OK', style: 'default' }]
          );
          return true; // Prevent default back action
        }
        return false; // Allow default back action
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [termsAccepted])
  );

  const handleAcceptAndContinue = () => {
    if (!termsAccepted) {
      setSubmitAttempted(true);
      Alert.alert(
        isTR ? 'Lütfen Kabul Edin' : 'Please Accept Terms',
        isTR
          ? 'Devam etmek için şartlar ve koşulları kabul etmelisiniz.'
          : 'You must accept the Terms & Conditions to continue.'
      );
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={isTR ? 'Şartlar ve Koşullar' : 'Terms & Conditions'}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text variant="heading" style={styles.title}>
            {isTR ? '🇹🇷 Türkiye Ev Yapımı Yemek Platformu Şartlar ve Koşullar' : '🇬🇧 UK Food Marketplace Terms & Conditions'}
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.lastUpdated}>
            {isTR ? 'Son güncelleme: 8 Ocak 2025' : 'Last updated: January 8, 2025'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '1. Platformun Rolü ve Sorumluluklar' : '1. Platform Role & Responsibility'}
          </Text>
          <Text variant="body" style={styles.paragraph}>
            {isTR ? (
              <>
                Coziyoo yalnızca bir <Text weight="semibold">pazar yeri platformu</Text> olarak hizmet verir ve gıdayı doğrudan hazırlamaz, işlemez veya satmaz. Tüm yemekler, kendi gıda güvenliği ve mevzuat uyumundan sorumlu bağımsız satıcılar tarafından hazırlanır ve satılır.
              </>
            ) : (
              <>
                Coziyoo acts as a <Text weight="semibold">marketplace platform only</Text> and does not prepare, handle, or sell food directly. All food is prepared, handled, and sold by independent sellers who are responsible for their own food safety and compliance.
              </>
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '2. Satıcı Sorumlulukları' : '2. Seller Responsibilities'}
          </Text>
          <Text variant="body" style={styles.paragraph}>
            {isTR ? 'Platformdaki tüm satıcılar aşağıdakilerden tamamen sorumludur:' : 'All food sellers on this platform are fully responsible for:'}
          </Text>
          <View style={styles.bulletPoints}>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">{isTR ? 'Gıda güvenliği ve hijyen' : 'Food safety and hygiene'}</Text> {isTR ? 'uyumu' : 'compliance'}
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">{isTR ? 'Yerel belediye kaydı' : 'Local council registration'}</Text> {isTR ? 've gerekli bildirimler' : 'as a food business'}
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">{isTR ? 'Doğru alerjen bilgisi' : 'Accurate allergen information'}</Text>
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">{isTR ? 'Gıda hijyen belgeleri' : 'Food hygiene certificates'}</Text> {isTR ? 've kayıtları' : 'and ratings'}
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">{isTR ? 'Yasal mevzuata uyum' : 'Legal compliance'}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '3. Gıda Güvenliği Uygunluğu' : '3. UK Food Safety Compliance'}
          </Text>
          <Text variant="body" style={styles.paragraph}>
            {isTR ? 'Tüm satıcılar yürürlükteki gıda güvenliği kurallarına uymakla yükümlüdür. Örnekler:' : 'All sellers must comply with UK food safety regulations including:'}
          </Text>
          <View style={styles.bulletPoints}>
            <Text variant="body" style={styles.bulletPoint}>
              • {isTR ? 'Yerel belediyeye kayıt ve bildirimler' : 'Registration with local council as a food business'}
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • {isTR ? 'Gıda güvenliği ve hijyen kurallarına uyum' : 'Compliance with Food Safety Act 1990'}
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • {isTR ? 'Alerjen bilgilendirme yükümlülükleri' : "Allergen labelling requirements (Natasha's Law)"}
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • {isTR ? 'Denetimler ve kayıtların güncel tutulması' : 'Food hygiene ratings and inspections'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '4. Sorumluluk Reddi' : '4. Liability Disclaimer'}
          </Text>
          <View style={[styles.warningBox, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
            <Text variant="body" weight="bold" style={[styles.warningText, { color: colors.error }]}>
              {isTR ? '⚠️ ÖNEMLİ SORUMLULUK BİLDİRİMİ' : '⚠️ IMPORTANT LIABILITY NOTICE'}
            </Text>
            <Text variant="body" style={styles.paragraph}>
              {isTR ? (
                <>
                  Coziyoo aşağıdakilerden <Text weight="semibold">sorumlu değildir</Text>:
                </>
              ) : (
                <>
                  Coziyoo is <Text weight="semibold">not liable</Text> for:
                </>
              )}
            </Text>
            <View style={styles.bulletPoints}>
              <Text variant="body" style={styles.bulletPoint}>
                • {isTR ? 'Yemeklerin kalitesi, güvenliği veya hazırlanma şekli' : 'Food quality, safety, or preparation'}
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • {isTR ? 'Alerjik reaksiyonlar veya gıda kaynaklı rahatsızlıklar' : 'Allergic reactions or food-related illness'}
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • {isTR ? 'Satıcının mevzuata uyumu' : 'Seller compliance with food safety regulations'}
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • {isTR ? 'Alerjen veya içerik bilgilerinin doğruluğu' : 'Accuracy of allergen or ingredient information'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '5. Alerjen Uyarısı' : '5. Allergen Warning'}
          </Text>
          <Text variant="body" style={styles.paragraph}>
            {isTR ? (
              <>
                Gıda alerjiniz veya intoleransınız varsa, <Text weight="semibold">güvenli olduğundan emin değilseniz sipariş vermeyin</Text>. Sipariş öncesinde alerjen bilgilerini dikkatle inceleyin.
              </>
            ) : (
              <>
                If you have food allergies or intolerances, <Text weight="semibold">do not order unless you are certain it is safe for you</Text>. Always review allergen information carefully before placing orders.
              </>
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '6. Denetimler ve Uyum' : '6. Inspections & Compliance'}
          </Text>
          <Text variant="body" style={styles.paragraph}>
            {isTR
              ? 'Satıcılar denetim ve bildirim yükümlülüklerine uymak zorundadır. Gıda güvenliği kurallarını ihlal eden veya gerekli uyum kontrollerini tamamlamayan satıcıların hesaplarını askıya alma veya kaldırma hakkımız saklıdır.'
              : 'Sellers must comply with local council inspections at all times. We reserve the right to suspend or remove sellers who breach food safety rules or fail compliance checks.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '7. Hesap Sonlandırma' : '7. Termination'}
          </Text>
          <Text variant="body" style={styles.paragraph}>
            {isTR
              ? 'Gıda güvenliği kurallarının ihlali, yanlış bilgi beyanı veya yasal yükümlülüklere uyulmaması durumlarında satıcı hesaplarını askıya alma veya sonlandırma hakkımız saklıdır.'
              : 'We reserve the right to suspend or terminate seller accounts for violations of food safety regulations, false information, or non-compliance with UK food business requirements.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={sectionTitleStyle}>
            {isTR ? '8. İletişim Bilgileri' : '8. Contact Information'}
          </Text>
          <Text variant="body" style={styles.paragraph}>
            {isTR
              ? 'Şartlar veya gıda güvenliği ile ilgili sorular için bizimle iletişime geçin:'
              : 'For questions about these terms or food safety concerns, contact us at:'}
          </Text>
          <Text variant="body" style={styles.contactInfo}>
            {isTR ? (
              <>
                📧 destek@coziyoo.com{'\n'}
                📞 +90 212 000 00 00{'\n'}
                🏛️ Türkiye'de kayıtlı işletme
              </>
            ) : (
              <>
                📧 legal@coziyoo.co.uk{'\n'}
                📞 +44 20 1234 5678{'\n'}
                🏛️ Registered in England & Wales
              </>
            )}
          </Text>
        </View>

        {/* Step-by-step Acceptance Section */}
        <View style={[styles.acceptanceSection, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          {isBuyer && (
            <View style={styles.acceptanceBlock}>
              <Text variant="subheading" weight="semibold" style={[styles.acceptanceTitle, { color: colors.text }]}>
                {isTR ? 'Alıcı Onayları' : 'Buyer Acknowledgements'}
              </Text>
              <Checkbox
                label={isTR ? 'Platformun pazar yeri olduğunu anladım' : 'I understand this is a marketplace platform'}
                checked={buyerSteps.platformRole}
                onPress={() => setBuyerSteps(prev => ({ ...prev, platformRole: !prev.platformRole }))}
                required
                error={
                  submitAttempted && !buyerSteps.platformRole
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
              <Checkbox
                label={
                  isTR
                    ? 'Alerjen uyarısını okudum; güvenli değilse sipariş vermeyeceğim'
                    : 'I have read the allergen warning and will not order if unsafe'
                }
                checked={buyerSteps.allergenWarning}
                onPress={() => setBuyerSteps(prev => ({ ...prev, allergenWarning: !prev.allergenWarning }))}
                required
                disabled={!buyerSteps.platformRole}
                error={
                  submitAttempted && !buyerSteps.allergenWarning
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
              <Checkbox
                label={
                  isTR
                    ? 'Sorumluluk reddini anladım (platform yemeklerden sorumlu değildir)'
                    : 'I understand the liability disclaimer (platform is not liable for food)'
                }
                checked={buyerSteps.liability}
                onPress={() => setBuyerSteps(prev => ({ ...prev, liability: !prev.liability }))}
                required
                disabled={!buyerSteps.allergenWarning}
                error={
                  submitAttempted && !buyerSteps.liability
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
              <Checkbox
                label={
                  isTR
                    ? 'Sipariş/iptal koşullarını okudum ve kabul ediyorum'
                    : 'I accept the order/cancellation rules'
                }
                checked={buyerSteps.orderRules}
                onPress={() => setBuyerSteps(prev => ({ ...prev, orderRules: !prev.orderRules }))}
                required
                disabled={!buyerSteps.liability}
                error={
                  submitAttempted && !buyerSteps.orderRules
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
            </View>
          )}

          {isSeller && (
            <View style={styles.acceptanceBlock}>
              <Text variant="subheading" weight="semibold" style={[styles.acceptanceTitle, { color: colors.text }]}>
                {isTR ? 'Satıcı Onayları' : 'Seller Acknowledgements'}
              </Text>
              <Checkbox
                label={
                  isTR
                    ? 'Gıda güvenliği ve hijyen sorumluluğu bana aittir'
                    : 'I am responsible for food safety and hygiene'
                }
                checked={sellerSteps.responsibilities}
                onPress={() => setSellerSteps(prev => ({ ...prev, responsibilities: !prev.responsibilities }))}
                required
                error={
                  submitAttempted && !sellerSteps.responsibilities
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
              <Checkbox
                label={
                  isTR
                    ? 'Yerel belediye kaydı ve yasal uyum yükümlülüklerini kabul ediyorum'
                    : 'I agree to local council registration and legal compliance obligations'
                }
                checked={sellerSteps.compliance}
                onPress={() => setSellerSteps(prev => ({ ...prev, compliance: !prev.compliance }))}
                required
                disabled={!sellerSteps.responsibilities}
                error={
                  submitAttempted && !sellerSteps.compliance
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
              <Checkbox
                label={
                  isTR
                    ? 'Alerjen ve içerik bilgilerini doğru/eksiksiz paylaşacağım'
                    : 'I will provide accurate and complete allergen/ingredient information'
                }
                checked={sellerSteps.allergenAccuracy}
                onPress={() => setSellerSteps(prev => ({ ...prev, allergenAccuracy: !prev.allergenAccuracy }))}
                required
                disabled={!sellerSteps.compliance}
                error={
                  submitAttempted && !sellerSteps.allergenAccuracy
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
              <Checkbox
                label={
                  isTR
                    ? 'Denetim ve kayıt tutma yükümlülüklerini kabul ediyorum'
                    : 'I accept inspections and record-keeping obligations'
                }
                checked={sellerSteps.inspections}
                onPress={() => setSellerSteps(prev => ({ ...prev, inspections: !prev.inspections }))}
                required
                disabled={!sellerSteps.allergenAccuracy}
                error={
                  submitAttempted && !sellerSteps.inspections
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
              <Checkbox
                label={
                  isTR
                    ? 'İhlal durumunda hesabımın askıya alınabileceğini kabul ediyorum'
                    : 'I accept that my account may be suspended for violations'
                }
                checked={sellerSteps.termination}
                onPress={() => setSellerSteps(prev => ({ ...prev, termination: !prev.termination }))}
                required
                disabled={!sellerSteps.inspections}
                error={
                  submitAttempted && !sellerSteps.termination
                    ? (isTR ? 'Bu adımı onaylamalısınız' : 'You must acknowledge this step')
                    : undefined
                }
              />
            </View>
          )}
          
          <Button
            variant={termsAccepted ? "primary" : "outline"}
            fullWidth
            onPress={handleAcceptAndContinue}
            style={[styles.acceptButton, { opacity: termsAccepted ? 1 : 0.5 }]}
          >
            {termsAccepted ? (isTR ? '✅ Kabul Et ve Devam Et' : '✅ Accept & Continue') : (isTR ? '❌ Lütfen Şartları Kabul Edin' : '❌ Please Accept Terms')}
          </Button>
        </View>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Text variant="caption" color="textSecondary" style={styles.footerText}>
            {isTR
              ? "🇹🇷 Bu platform Türkiye'deki gıda güvenliği kuralları çerçevesinde hizmet verir.\nBu hizmeti kullanarak satıcıların kendi uyumlarından sorumlu bağımsız işletmeler olduğunu kabul edersiniz."
              : "🇬🇧 This platform operates under UK food safety regulations.\nBy using this service, you acknowledge that sellers are independent food businesses responsible for their own compliance."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  lastUpdated: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  bulletPoints: {
    marginLeft: Spacing.md,
    gap: Spacing.xs,
  },
  bulletPoint: {
    lineHeight: 20,
  },
  warningBox: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    marginVertical: Spacing.sm,
  },
  warningText: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  contactInfo: {
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
    padding: Spacing.md,
    borderRadius: 8,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  acceptanceSection: {
    borderWidth: 2,
    borderRadius: 12,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  acceptanceBlock: {
    marginBottom: Spacing.lg,
  },
  acceptanceTitle: {
    marginBottom: Spacing.sm,
  },
  acceptButton: {
    marginTop: Spacing.md,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    marginTop: Spacing.xl,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 11,
  },
});
