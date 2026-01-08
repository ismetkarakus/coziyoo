import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button, Checkbox } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { UK_ALLERGENS, AllergenId } from '../src/constants/allergens';

export default function AllergenDeclaration() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenId[]>([
    'cereals', 'eggs', 'milk', 'nuts'
  ]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [allAllergensDeclared, setAllAllergensDeclared] = useState(true);

  const handleAllergenToggle = (allergenId: AllergenId) => {
    if (!isEditing) return;
    
    setSelectedAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId);
      } else {
        return [...prev, allergenId];
      }
    });
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Allergen declaration has been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const openAllergenGuidance = () => {
    Linking.openURL('https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses');
  };

  const openNatashasLaw = () => {
    Linking.openURL('https://www.food.gov.uk/business-guidance/natasha-s-law');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="⚠️ Allergen Declaration"
        leftComponent={
          <TouchableOpacity onPress={() => router.push('/(seller)/dashboard')} style={styles.sellerButton}>
            <Text variant="body" color="text" style={styles.sellerText}>
              Seller <Text style={styles.sellerIcon}>●</Text>
            </Text>
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
            <Text variant="body" color="primary">{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card variant="default" padding="md" style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text variant="subheading" weight="semibold" style={styles.statusTitle}>
              Allergen Compliance Status
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: allAllergensDeclared ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {allAllergensDeclared ? '✅ COMPLIANT' : '⚠️ REVIEW NEEDED'}
              </Text>
            </View>
          </View>
          
          <Text variant="body" style={[styles.statusMessage, { color: allAllergensDeclared ? '#28A745' : '#856404' }]}>
            {allAllergensDeclared 
              ? 'All 14 UK allergens have been reviewed and declared for your products.'
              : 'Please review and declare all relevant allergens for your food products.'
            }
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            📋 Legal Information
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openNatashasLaw}>
            <Text variant="body" color="primary">⚖️ Natasha's Law (PPDS) →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openAllergenGuidance}>
            <Text variant="body" color="primary">📖 FSA Allergen Guidance →</Text>
          </TouchableOpacity>
        </Card>

        {/* Current Selection Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="body" weight="semibold" style={styles.summaryTitle}>
            📊 Your Allergen Declaration Summary
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.summarySubtitle}>
            Selected allergens that may be present in your food products:
          </Text>
          
          {selectedAllergens.length > 0 ? (
            <View style={styles.selectedAllergensContainer}>
              {selectedAllergens.map(allergenId => {
                const allergen = UK_ALLERGENS.find(a => a.id === allergenId);
                return allergen ? (
                  <View key={allergenId} style={styles.selectedAllergenTag}>
                    <Text variant="caption" style={styles.selectedAllergenText}>
                      {allergen.name}
                    </Text>
                  </View>
                ) : null;
              })}
            </View>
          ) : (
            <Text variant="body" color="textSecondary" style={styles.noAllergensText}>
              No allergens currently declared
            </Text>
          )}
        </Card>

        {/* Allergen Checklist */}
        <Card variant="default" padding="md" style={styles.allergenCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            🇬🇧 UK's 14 Major Allergens
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.sectionSubtitle}>
            Select all allergens that may be present in your food products (including cross-contamination):
          </Text>

          <View style={styles.allergenList}>
            {UK_ALLERGENS.map((allergen) => (
              <TouchableOpacity
                key={allergen.id}
                style={[
                  styles.allergenItem,
                  selectedAllergens.includes(allergen.id) && styles.allergenItemSelected,
                  !isEditing && styles.allergenItemDisabled,
                ]}
                onPress={() => handleAllergenToggle(allergen.id)}
                disabled={!isEditing}
                activeOpacity={0.7}
              >
                <View style={styles.allergenItemContent}>
                  <View style={styles.allergenInfo}>
                    <Text variant="body" weight="semibold" style={styles.allergenName}>
                      {selectedAllergens.includes(allergen.id) ? '✅' : '⬜'} {allergen.name}
                    </Text>
                    <Text variant="caption" color="textSecondary" style={styles.allergenDescription}>
                      {allergen.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Checkbox
            label="I confirm that I have reviewed all 14 UK allergens and declared those relevant to my products"
            checked={allAllergensDeclared}
            onPress={() => setAllAllergensDeclared(!allAllergensDeclared)}
            disabled={!isEditing}
            required
            helperText="This declaration is required under Natasha's Law"
          />

          {isEditing && (
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              💾 Save Allergen Declaration
            </Button>
          )}
        </Card>

        {/* Legal Warning */}
        <Card variant="default" padding="md" style={styles.warningCard}>
          <Text variant="body" weight="semibold" style={styles.warningTitle}>
            ⚖️ Legal Requirements
          </Text>
          <Text variant="caption" style={styles.warningText}>
            • Under Natasha's Law, you must provide allergen information for prepacked food
          </Text>
          <Text variant="caption" style={styles.warningText}>
            • Failure to declare allergens can result in serious health consequences and legal action
          </Text>
          <Text variant="caption" style={styles.warningText}>
            • Consider cross-contamination in your kitchen when declaring allergens
          </Text>
          <Text variant="caption" style={styles.warningText}>
            • When in doubt, declare the allergen to protect your customers
          </Text>
          <Text variant="caption" style={styles.warningText}>
            • Keep records of your allergen assessments and ingredient suppliers
          </Text>
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
  summaryCard: {
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  summaryTitle: {
    marginBottom: Spacing.xs,
    color: '#1976D2',
  },
  summarySubtitle: {
    marginBottom: Spacing.sm,
  },
  selectedAllergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  selectedAllergenTag: {
    backgroundColor: '#1976D2',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    marginBottom: Spacing.xs,
  },
  selectedAllergenText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  noAllergensText: {
    fontStyle: 'italic',
  },
  allergenCard: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
    color: Colors.light.primary,
  },
  sectionSubtitle: {
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  allergenList: {
    marginBottom: Spacing.lg,
  },
  allergenItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  allergenItemSelected: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderColor: '#28A745',
  },
  allergenItemDisabled: {
    opacity: 0.7,
  },
  allergenItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenInfo: {
    flex: 1,
  },
  allergenName: {
    marginBottom: 2,
  },
  allergenDescription: {
    lineHeight: 16,
  },
  saveButton: {
    marginTop: Spacing.md,
  },
  warningCard: {
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningTitle: {
    marginBottom: Spacing.sm,
    color: '#DC2626',
  },
  warningText: {
    marginBottom: Spacing.xs,
    lineHeight: 18,
    color: Colors.light.text,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
