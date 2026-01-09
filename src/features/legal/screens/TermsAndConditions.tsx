import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, BackHandler } from 'react-native';
import { Text, Button, Checkbox } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { router, useFocusEffect } from 'expo-router';

export const TermsAndConditions: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Prevent back navigation without accepting terms
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!termsAccepted) {
          Alert.alert(
            'Terms & Conditions Required',
            'You must read and accept the Terms & Conditions before proceeding.',
            [
              { text: 'OK', style: 'default' }
            ]
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
      Alert.alert('Please Accept Terms', 'You must accept the Terms & Conditions to continue.');
      return;
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Terms & Conditions"
        subtitle="UK Food Marketplace"
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text variant="heading" style={styles.title}>
            🇬🇧 UK Food Marketplace Terms & Conditions
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.lastUpdated}>
            Last updated: January 8, 2025
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            1. Platform Role & Responsibility
          </Text>
          <Text variant="body" style={styles.paragraph}>
            Cazi acts as a <Text weight="semibold">marketplace platform only</Text> and does not prepare, handle, or sell food directly. All food is prepared, handled, and sold by independent sellers who are responsible for their own food safety and compliance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            2. Seller Responsibilities
          </Text>
          <Text variant="body" style={styles.paragraph}>
            All food sellers on this platform are fully responsible for:
          </Text>
          <View style={styles.bulletPoints}>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">Food safety and hygiene</Text> compliance
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">Local council registration</Text> as a food business
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">Accurate allergen information</Text> (UK Natasha's Law)
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">Food hygiene certificates</Text> and ratings
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • <Text weight="semibold">Legal compliance</Text> with UK food regulations
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            3. UK Food Safety Compliance
          </Text>
          <Text variant="body" style={styles.paragraph}>
            All sellers must comply with UK food safety regulations including:
          </Text>
          <View style={styles.bulletPoints}>
            <Text variant="body" style={styles.bulletPoint}>
              • Registration with local council as a food business
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • Compliance with Food Safety Act 1990
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • Allergen labelling requirements (Natasha's Law)
            </Text>
            <Text variant="body" style={styles.bulletPoint}>
              • Food hygiene ratings and inspections
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            4. Liability Disclaimer
          </Text>
          <View style={[styles.warningBox, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
            <Text variant="body" weight="bold" style={[styles.warningText, { color: colors.error }]}>
              ⚠️ IMPORTANT LIABILITY NOTICE
            </Text>
            <Text variant="body" style={styles.paragraph}>
              Cazi is <Text weight="semibold">not liable</Text> for:
            </Text>
            <View style={styles.bulletPoints}>
              <Text variant="body" style={styles.bulletPoint}>
                • Food quality, safety, or preparation
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • Allergic reactions or food-related illness
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • Seller compliance with food safety regulations
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • Accuracy of allergen or ingredient information
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            5. Allergen Warning
          </Text>
          <Text variant="body" style={styles.paragraph}>
            If you have food allergies or intolerances, <Text weight="semibold">do not order unless you are certain it is safe for you</Text>. Always review allergen information carefully before placing orders.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            6. Inspections & Compliance
          </Text>
          <Text variant="body" style={styles.paragraph}>
            Sellers must comply with local council inspections at all times. We reserve the right to suspend or remove sellers who breach food safety rules or fail compliance checks.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            7. Termination
          </Text>
          <Text variant="body" style={styles.paragraph}>
            We reserve the right to suspend or terminate seller accounts for violations of food safety regulations, false information, or non-compliance with UK food business requirements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            8. Contact Information
          </Text>
          <Text variant="body" style={styles.paragraph}>
            For questions about these terms or food safety concerns, contact us at:
          </Text>
          <Text variant="body" style={styles.contactInfo}>
            📧 legal@cazi.co.uk{'\n'}
            📞 +44 20 1234 5678{'\n'}
            🏛️ Registered in England & Wales
          </Text>
        </View>

        {/* Terms Acceptance Section */}
        <View style={[styles.acceptanceSection, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Checkbox
            label="I have read and understood the Terms & Conditions and UK food safety regulations"
            checked={termsAccepted}
            onPress={() => setTermsAccepted(!termsAccepted)}
            required
            error={!termsAccepted ? "You must accept the terms to continue" : undefined}
          />
          
          <Button
            variant={termsAccepted ? "primary" : "outline"}
            fullWidth
            onPress={handleAcceptAndContinue}
            style={[styles.acceptButton, { opacity: termsAccepted ? 1 : 0.5 }]}
          >
            {termsAccepted ? "✅ Accept & Continue" : "❌ Please Accept Terms"}
          </Button>
        </View>

        <View style={[styles.footer, { borderColor: colors.border }]}>
          <Text variant="caption" color="textSecondary" style={styles.footerText}>
            🇬🇧 This platform operates under UK food safety regulations.{'\n'}
            By using this service, you acknowledge that sellers are independent food businesses responsible for their own compliance.
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
    color: '#2D5A4A',
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
