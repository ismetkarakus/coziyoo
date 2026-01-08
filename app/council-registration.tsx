import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';

export default function CouncilRegistration() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [formData, setFormData] = useState({
    councilName: 'Westminster City Council',
    postcode: 'SW1A 1AA',
    businessName: 'Home Kitchen',
    contactName: 'Fatma Teyze',
    phoneNumber: '+44 20 7946 0958',
    email: 'fatma@example.com',
    businessType: 'Home-based food business',
    startDate: '2024-01-15',
    registrationNumber: 'WCC-FB-2024-001',
    isRegistered: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Council registration details have been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const openCouncilWebsite = () => {
    Linking.openURL('https://www.gov.uk/food-business-registration');
  };

  const openCouncilSearch = () => {
    Linking.openURL('https://www.gov.uk/find-local-council');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="🏛️ Council Registration"
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
              Registration Status
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: formData.isRegistered ? '#28A745' : '#FFC107' }]}>
              <Text variant="caption" style={{ color: 'white', fontWeight: 'bold' }}>
                {formData.isRegistered ? '✅ REGISTERED' : '⏳ PENDING'}
              </Text>
            </View>
          </View>
          
          {formData.isRegistered && (
            <Text variant="body" color="success" style={styles.statusMessage}>
              Your food business is successfully registered with your local council.
            </Text>
          )}
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            📋 Quick Actions
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openCouncilWebsite}>
            <Text variant="body" color="primary">🌐 Register New Food Business →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openCouncilSearch}>
            <Text variant="body" color="primary">🔍 Find Your Local Council →</Text>
          </TouchableOpacity>
        </Card>

        {/* Registration Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Registration Details
          </Text>

          <FormField
            label="Council Name"
            value={formData.councilName}
            onChangeText={handleInputChange('councilName')}
            editable={isEditing}
            placeholder="e.g. Westminster City Council"
          />

          <FormField
            label="Postcode"
            value={formData.postcode}
            onChangeText={handleInputChange('postcode')}
            editable={isEditing}
            placeholder="SW1A 1AA"
          />

          <FormField
            label="Business Name"
            value={formData.businessName}
            onChangeText={handleInputChange('businessName')}
            editable={isEditing}
            placeholder="Your business name"
          />

          <FormField
            label="Contact Name"
            value={formData.contactName}
            onChangeText={handleInputChange('contactName')}
            editable={isEditing}
            placeholder="Your full name"
          />

          <FormField
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={handleInputChange('phoneNumber')}
            editable={isEditing}
            placeholder="+44 20 7946 0958"
          />

          <FormField
            label="Email Address"
            value={formData.email}
            onChangeText={handleInputChange('email')}
            editable={isEditing}
            placeholder="your.email@example.com"
          />

          <FormField
            label="Business Type"
            value={formData.businessType}
            onChangeText={handleInputChange('businessType')}
            editable={isEditing}
            placeholder="e.g. Home-based food business"
          />

          <FormField
            label="Business Start Date"
            value={formData.startDate}
            onChangeText={handleInputChange('startDate')}
            editable={isEditing}
            placeholder="YYYY-MM-DD"
          />

          {formData.isRegistered && (
            <FormField
              label="Registration Number"
              value={formData.registrationNumber}
              onChangeText={handleInputChange('registrationNumber')}
              editable={isEditing}
              placeholder="Council registration number"
            />
          )}

          <Checkbox
            label="I confirm this food business is registered with the local council"
            checked={formData.isRegistered}
            onPress={() => setFormData(prev => ({ ...prev, isRegistered: !prev.isRegistered }))}
            disabled={!isEditing}
          />

          {isEditing && (
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              💾 Save Changes
            </Button>
          )}
        </Card>

        {/* Legal Information */}
        <Card variant="default" padding="md" style={styles.legalCard}>
          <Text variant="body" weight="semibold" style={styles.legalTitle}>
            ⚖️ Legal Requirements
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • Registration must be completed at least 28 days before starting your food business
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • Registration is free and mandatory under UK food safety law
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • You must notify the council of any changes to your business
          </Text>
          <Text variant="caption" style={styles.legalText}>
            • Failure to register is a criminal offense with potential fines
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
