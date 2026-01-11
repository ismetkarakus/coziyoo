import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router, Stack } from 'expo-router';
import { Text, Card, Button, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { UK_ALLERGENS, TR_ALLERGENS, AllergenId } from '../src/constants/allergens';
import { useCountry } from '../src/context/CountryContext';

export default function AllergenDeclaration() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();
  
  // Ülkeye göre alerjen listesi
  const allergens = currentCountry.code === 'TR' ? TR_ALLERGENS : UK_ALLERGENS;
  
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
      currentCountry.code === 'TR' ? 'Başarılı' : 'Success',
      currentCountry.code === 'TR' 
        ? 'Alerjen beyanı başarıyla güncellendi.'
        : 'Allergen declaration has been updated successfully.',
      [{ text: currentCountry.code === 'TR' ? 'Tamam' : 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const openAllergenGuidance = () => {
    Linking.openURL('https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses');
  };

  const openNatashasLaw = () => {
    Linking.openURL('https://www.food.gov.uk/business-guidance/natasha-s-law');
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: currentCountry.code === 'TR' ? '⚠️ Alerjen Beyanı' : '⚠️ Allergen Declaration',
          headerBackVisible: false, // Otomatik geri butonunu gizle
          headerLeft: () => <HeaderBackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
              <Text variant="body" color="primary">
                {currentCountry.code === 'TR' 
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
              {currentCountry.code === 'TR' ? 'Alerjen Uyumluluk Durumu' : 'Allergen Compliance Status'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: allAllergensDeclared ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {currentCountry.code === 'TR' 
                  ? (allAllergensDeclared ? '✅ UYUMLU' : '⚠️ İNCELEME GEREKLİ')
                  : (allAllergensDeclared ? '✅ COMPLIANT' : '⚠️ REVIEW NEEDED')
                }
              </Text>
            </View>
          </View>
          
          <Text variant="body" style={[styles.statusMessage, { color: allAllergensDeclared ? '#28A745' : '#856404' }]}>
            {currentCountry.code === 'TR' 
              ? (allAllergensDeclared 
                  ? 'Tüm 14 temel alerjen gözden geçirildi ve ürünleriniz için beyan edildi.'
                  : 'Lütfen gıda ürünleriniz için ilgili tüm alerjenleri gözden geçirin ve beyan edin.'
                )
              : (allAllergensDeclared 
                  ? 'All 14 major allergens have been reviewed and declared for your products.'
                  : 'Please review and declare all relevant allergens for your food products.'
                )
            }
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            {currentCountry.code === 'TR' ? '📋 Yasal Bilgiler' : '📋 Legal Information'}
          </Text>
          {currentCountry.code === 'TR' ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                <Text variant="body" color="primary">⚖️ Gıda Güvenliği Kanunu →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                <Text variant="body" color="primary">📖 Tarım Bakanlığı Alerjen Rehberi →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={openNatashasLaw}>
                <Text variant="body" color="primary">⚖️ Natasha's Law (PPDS) →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={openAllergenGuidance}>
                <Text variant="body" color="primary">📖 FSA Allergen Guidance →</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Current Selection Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="body" weight="semibold" style={styles.summaryTitle}>
            {currentCountry.code === 'TR' ? '📊 Alerjen Beyan Özeti' : '📊 Your Allergen Declaration Summary'}
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.summarySubtitle}>
            {currentCountry.code === 'TR' 
              ? 'Gıda ürünlerinizde bulunabilecek seçili alerjenler:'
              : 'Selected allergens that may be present in your food products:'
            }
          </Text>
          
          {selectedAllergens.length > 0 ? (
            <View style={styles.selectedAllergensContainer}>
              {selectedAllergens.map(allergenId => {
                const allergen = allergens.find(a => a.id === allergenId);
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
              {currentCountry.code === 'TR' ? 'Şu anda beyan edilmiş alerjen yok' : 'No allergens currently declared'}
            </Text>
          )}
        </Card>

        {/* Allergen Checklist */}
        <Card variant="default" padding="md" style={styles.allergenCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {currentCountry.code === 'TR' ? '🇹🇷 Türkiye\'nin 14 Temel Alerjeni' : '🇬🇧 14 Major Allergens'}
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.sectionSubtitle}>
            {currentCountry.code === 'TR' 
              ? 'Gıda ürünlerinizde bulunabilecek tüm alerjenleri seçin (çapraz bulaşma dahil):'
              : 'Select all allergens that may be present in your food products (including cross-contamination):'
            }
          </Text>

          <View style={styles.allergenList}>
            {allergens.map((allergen) => (
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
            label={currentCountry.code === 'TR' 
              ? 'Tüm 14 temel alerjeni gözden geçirdiğimi ve ürünlerimle ilgili olanları beyan ettiğimi onaylıyorum'
              : 'I confirm that I have reviewed all 14 major allergens and declared those relevant to my products'
            }
            checked={allAllergensDeclared}
            onPress={() => setAllAllergensDeclared(!allAllergensDeclared)}
            disabled={!isEditing}
            required
            helperText={currentCountry.code === 'TR' 
              ? 'Bu beyan Gıda Güvenliği Kanunu gereği zorunludur'
              : 'This declaration is required under Natasha\'s Law'
            }
          />

          {isEditing && (
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              {currentCountry.code === 'TR' ? '💾 Alerjen Beyanını Kaydet' : '💾 Save Allergen Declaration'}
            </Button>
          )}
        </Card>

        {/* Legal Warning */}
        <Card variant="default" padding="md" style={styles.warningCard}>
          <Text variant="body" weight="semibold" style={styles.warningTitle}>
            {currentCountry.code === 'TR' ? '⚖️ Yasal Gereklilikler' : '⚖️ Legal Requirements'}
          </Text>
          {currentCountry.code === 'TR' ? (
            <>
              <Text variant="caption" style={styles.warningText}>
                • Gıda Güvenliği Kanunu gereği, paketli gıdalar için alerjen bilgisi sağlamalısınız
              </Text>
              <Text variant="caption" style={styles.warningText}>
                • Alerjen beyan etmemek ciddi sağlık sonuçları ve yasal işlem doğurabilir
              </Text>
              <Text variant="caption" style={styles.warningText}>
                • Alerjen beyanı yaparken mutfağınızdaki çapraz bulaşmayı göz önünde bulundurun
              </Text>
              <Text variant="caption" style={styles.warningText}>
                • Şüphe halinde, müşterilerinizi korumak için alerjeni beyan edin
              </Text>
              <Text variant="caption" style={styles.warningText}>
                • Alerjen değerlendirmelerinizin ve tedarikçi kayıtlarınızın belgelerini saklayın
              </Text>
            </>
          ) : (
            <>
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
