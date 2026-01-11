import React from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
import { Text, Button } from './';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { UK_ALLERGENS, TR_ALLERGENS, AllergenId } from '../../constants/allergens';
import { useCountry } from '../../context/CountryContext';

interface AllergenWarningModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  allergens: AllergenId[];
  foodName: string;
}

export const AllergenWarningModal: React.FC<AllergenWarningModalProps> = ({
  visible,
  onClose,
  onConfirm,
  allergens,
  foodName,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();

  // Ülkeye göre alerjen listesi
  const allergenList = currentCountry.code === 'TR' ? TR_ALLERGENS : UK_ALLERGENS;
  
  const allergenDetails = allergens.map(id => 
    allergenList.find(allergen => allergen.id === id)
  ).filter(Boolean);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text variant="heading" style={styles.title}>
                ⚠️ Allergen Information
              </Text>
              <Text variant="body" style={styles.foodName}>
                {foodName}
              </Text>
            </View>

            <View style={styles.warningBox}>
              <Text variant="body" weight="bold" style={[styles.warningText, { color: colors.error }]}>
                This food may contain allergens.
              </Text>
              <Text variant="body" style={styles.warningSubtext}>
                Please review the allergen information carefully before ordering.
              </Text>
            </View>

            {allergenDetails.length > 0 ? (
              <View style={styles.allergenSection}>
                <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
                  Contains the following allergens:
                </Text>
                {allergenDetails.map((allergen) => (
                  <View key={allergen!.id} style={[styles.allergenItem, { borderColor: colors.border }]}>
                    <Text variant="body" style={styles.allergenIcon}>
                      {allergen!.icon}
                    </Text>
                    <View style={styles.allergenInfo}>
                      <Text variant="body" weight="semibold">
                        {allergen!.name}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {allergen!.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noAllergenSection}>
                <Text variant="body" style={styles.noAllergenText}>
                  ✅ No major allergens declared by the seller.
                </Text>
                <Text variant="caption" color="textSecondary" style={styles.noAllergenNote}>
                  However, cross-contamination may still occur during preparation.
                </Text>
              </View>
            )}

            <View style={[styles.criticalWarning, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
              <Text variant="body" weight="bold" style={[styles.criticalText, { color: colors.error }]}>
                ⚠️ IMPORTANT WARNING
              </Text>
              <Text variant="body" style={styles.criticalSubtext}>
                If you have a food allergy or intolerance, do not order unless you are certain it is safe for you.
              </Text>
            </View>

            <View style={styles.legalNote}>
              <Text variant="caption" color="textSecondary" style={styles.legalText}>
                {currentCountry.code === 'TR'
                  ? 'Bu platform yalnızca bir pazar yeri olarak hizmet verir. Satıcı, gıda güvenliği, alerjen doğruluğu ve Türkiye gıda mevzuatına uygunluktan tamamen sorumludur.'
                  : 'This platform acts as a marketplace only. The seller is fully responsible for food safety, allergen accuracy, and compliance with food regulations.'
                }
              </Text>
            </View>
          </ScrollView>

          <View style={styles.buttons}>
            <Button
              variant="outline"
              onPress={onClose}
              style={styles.cancelButton}
            >
              Cancel Order
            </Button>
            <Button
              variant="primary"
              onPress={onConfirm}
              style={styles.confirmButton}
            >
              I Understand - Continue
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 16,
    padding: Spacing.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  foodName: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  warningBox: {
    padding: Spacing.md,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginBottom: Spacing.lg,
  },
  warningText: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  warningSubtext: {
    textAlign: 'center',
  },
  allergenSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  allergenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  allergenIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  allergenInfo: {
    flex: 1,
  },
  noAllergenSection: {
    padding: Spacing.md,
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C3E6CB',
    marginBottom: Spacing.lg,
  },
  noAllergenText: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  noAllergenNote: {
    textAlign: 'center',
  },
  criticalWarning: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: Spacing.lg,
  },
  criticalText: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  criticalSubtext: {
    textAlign: 'center',
  },
  legalNote: {
    marginBottom: Spacing.lg,
  },
  legalText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});

