import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';

export default function InsuranceDetails() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [formData, setFormData] = useState({
    hasInsurance: true,
    providerName: 'Simply Business',
    policyNumber: 'SB-PL-2024-789456',
    coverageAmount: '£2,000,000',
    policyType: 'Public Liability Insurance',
    startDate: '2024-01-01',
    expiryDate: '2026-01-01',
    premiumAmount: '£180',
    paymentFrequency: 'Annual',
    contactNumber: '+44 20 3808 1234',
    emergencyClaimNumber: '+44 20 3808 5678',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Insurance details have been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
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
    if (!formData.hasInsurance) return '❌ NO INSURANCE';
    if (isExpired()) return '❌ EXPIRED';
    if (isExpiringSoon()) return '⚠️ EXPIRING SOON';
    return '✅ ACTIVE';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="🛡️ Insurance Details"
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
              Insurance Status
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          <Text variant="body" style={[styles.statusMessage, { color: getStatusColor() }]}>
            {!formData.hasInsurance 
              ? 'Public Liability Insurance is strongly recommended for food businesses.'
              : isExpired() 
              ? 'Your insurance policy has expired. Please renew it immediately.'
              : isExpiringSoon()
              ? 'Your insurance policy expires soon. Consider renewing it.'
              : 'Your Public Liability Insurance is active and provides good coverage.'
            }
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            🔍 Insurance Providers
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openSimplyBusiness}>
            <Text variant="body" color="primary">💼 Simply Business →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openCompareTheMarket}>
            <Text variant="body" color="primary">🔍 Compare The Market →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openBiscuit}>
            <Text variant="body" color="primary">🍪 Biscuit Insurance →</Text>
          </TouchableOpacity>
        </Card>

        {/* Insurance Toggle */}
        <Card variant="default" padding="md" style={styles.toggleCard}>
          <Checkbox
            label="I have Public Liability Insurance"
            checked={formData.hasInsurance}
            onPress={() => setFormData(prev => ({ ...prev, hasInsurance: !prev.hasInsurance }))}
            disabled={!isEditing}
            helperText="Recommended for protection against claims from food-related incidents"
          />
        </Card>

        {/* Insurance Details */}
        {formData.hasInsurance && (
          <Card variant="default" padding="md" style={styles.detailsCard}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              Policy Details
            </Text>

            <FormField
              label="Insurance Provider"
              value={formData.providerName}
              onChangeText={handleInputChange('providerName')}
              editable={isEditing}
              placeholder="e.g. Simply Business, AXA, etc."
            />

            <FormField
              label="Policy Type"
              value={formData.policyType}
              onChangeText={handleInputChange('policyType')}
              editable={isEditing}
              placeholder="e.g. Public Liability Insurance"
            />

            <FormField
              label="Policy Number"
              value={formData.policyNumber}
              onChangeText={handleInputChange('policyNumber')}
              editable={isEditing}
              placeholder="Your policy reference number"
            />

            <FormField
              label="Coverage Amount"
              value={formData.coverageAmount}
              onChangeText={handleInputChange('coverageAmount')}
              editable={isEditing}
              placeholder="e.g. £1,000,000 or £2,000,000"
            />

            <FormField
              label="Policy Start Date"
              value={formData.startDate}
              onChangeText={handleInputChange('startDate')}
              editable={isEditing}
              placeholder="YYYY-MM-DD"
            />

            <FormField
              label="Policy Expiry Date"
              value={formData.expiryDate}
              onChangeText={handleInputChange('expiryDate')}
              editable={isEditing}
              placeholder="YYYY-MM-DD"
            />

            <FormField
              label="Premium Amount"
              value={formData.premiumAmount}
              onChangeText={handleInputChange('premiumAmount')}
              editable={isEditing}
              placeholder="e.g. £180"
            />

            <FormField
              label="Payment Frequency"
              value={formData.paymentFrequency}
              onChangeText={handleInputChange('paymentFrequency')}
              editable={isEditing}
              placeholder="e.g. Annual, Monthly"
            />

            <FormField
              label="Provider Contact Number"
              value={formData.contactNumber}
              onChangeText={handleInputChange('contactNumber')}
              editable={isEditing}
              placeholder="+44 20 xxxx xxxx"
            />

            <FormField
              label="Emergency Claims Number"
              value={formData.emergencyClaimNumber}
              onChangeText={handleInputChange('emergencyClaimNumber')}
              editable={isEditing}
              placeholder="+44 20 xxxx xxxx"
            />

            {isEditing && (
              <Button
                variant="primary"
                onPress={handleSave}
                style={styles.saveButton}
              >
                💾 Save Insurance Details
              </Button>
            )}
          </Card>
        )}

        {/* Information */}
        <Card variant="default" padding="md" style={styles.infoCard}>
          <Text variant="body" weight="semibold" style={styles.infoTitle}>
            ℹ️ About Public Liability Insurance
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Protects you against claims for injury or property damage caused by your business
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Essential for food businesses due to potential health risks
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Typical coverage ranges from £1M to £6M (£2M is common for food businesses)
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Annual premiums typically range from £100-£300 for home food businesses
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Some councils and platforms may require proof of insurance
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Consider Product Liability Insurance for additional protection
          </Text>
        </Card>

        {/* Legal Notice */}
        <Card variant="default" padding="md" style={styles.legalCard}>
          <Text variant="body" weight="semibold" style={styles.legalTitle}>
            ⚖️ Legal Notice
          </Text>
          <Text variant="caption" style={styles.legalText}>
            While Public Liability Insurance is not legally required for all food businesses, it is strongly recommended and may be required by:
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • Your local council for certain food business registrations
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • Food delivery platforms and marketplaces
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • Event organizers if you sell at markets or festivals
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • Commercial kitchen rental facilities
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
    color: Colors.light.text,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
