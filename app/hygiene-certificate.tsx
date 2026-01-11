import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import { Text, Card, Button, FormField, Checkbox, HeaderBackButton } from '../src/components/ui';
// TopBar kaldırıldı - Expo Router header kullanılacak
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';
import { useCountry } from '../src/context/CountryContext';

export default function HygieneCertificate() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentCountry } = useCountry();
  
  const [formData, setFormData] = useState({
    certificateLevel: 'Level 2',
    issueDate: '2023-12-15',
    expiryDate: '2025-12-15',
    certificateNumber: 'CIEH-FS-2023-789456',
    holderName: 'Fatma Teyze',
    hasCertificate: true,
    certificateImageUri: null as string | null,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Food hygiene certificate details have been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };



  const uploadCertificate = () => {
    Alert.alert(
      'Upload Certificate',
      'Please select your food hygiene certificate image.',
      [
        { text: 'Camera', onPress: () => console.log('Open camera') },
        { text: 'Gallery', onPress: () => console.log('Open gallery') },
        { text: 'Cancel', style: 'cancel' },
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
    if (isExpired()) return '❌ EXPIRED';
    if (isExpiringSoon()) return '⚠️ EXPIRING SOON';
    return '✅ VALID';
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: currentCountry.code === 'TR' ? '📜 Vergi Levhası' : '📜 Food Hygiene Certificate',
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
              Certificate Status
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
                ? 'Your certificate has expired. Please renew it immediately.'
                : isExpiringSoon()
                ? 'Your certificate expires soon. Consider renewing it.'
                : 'Your food hygiene certificate is valid and up to date.'
              }
            </Text>
          )}
        </Card>



        {/* Level 2 Certificate Link */}
        <View style={styles.level2Container}>
          <TouchableOpacity 
            style={styles.level2Button}
            onPress={() => Linking.openURL('https://www.food.gov.uk/business-guidance/food-safety-training')}
          >
            <Text variant="caption" color="primary" style={styles.level2ButtonText}>
              📜 Level 2 Certificate →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Certificate Upload */}
        <Card variant="default" padding="md" style={styles.uploadCard}>
          <Text variant="body" weight="semibold" style={styles.uploadTitle}>
            📸 Certificate Image
          </Text>
          
          {formData.certificateImageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: formData.certificateImageUri }} style={styles.certificateImage} />
              {isEditing && (
                <Button variant="outline" onPress={uploadCertificate} style={styles.changeImageButton}>
                  Change Image
                </Button>
              )}
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text variant="body" color="textSecondary" style={styles.noImageText}>
                No certificate image uploaded
              </Text>
              {isEditing && (
                <Button variant="primary" onPress={uploadCertificate} style={styles.uploadButton}>
                  📸 Upload Certificate
                </Button>
              )}
            </View>
          )}
        </Card>

        {/* Certificate Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Certificate Details
          </Text>

          <FormField
            label="Certificate Level"
            value={formData.certificateLevel}
            onChangeText={handleInputChange('certificateLevel')}
            editable={isEditing}
            placeholder="e.g. Level 2"
          />


          <FormField
            label="Certificate Holder Name"
            value={formData.holderName}
            onChangeText={handleInputChange('holderName')}
            editable={isEditing}
            placeholder="Full name on certificate"
          />

          <FormField
            label="Certificate Number"
            value={formData.certificateNumber}
            onChangeText={handleInputChange('certificateNumber')}
            editable={isEditing}
            placeholder="Certificate reference number"
          />

          <FormField
            label="Issue Date"
            value={formData.issueDate}
            onChangeText={handleInputChange('issueDate')}
            editable={isEditing}
            placeholder="YYYY-MM-DD"
          />

          <FormField
            label="Expiry Date"
            value={formData.expiryDate}
            onChangeText={handleInputChange('expiryDate')}
            editable={isEditing}
            placeholder="YYYY-MM-DD"
          />

          <Checkbox
            label="I have a valid Food Hygiene certificate"
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
              💾 Save Changes
            </Button>
          )}
        </Card>

        {/* Information */}
        <Card variant="default" padding="md" style={styles.infoCard}>
          <Text variant="body" weight="semibold" style={styles.infoTitle}>
            ℹ️ About Food Hygiene Certificates
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Level 2 Food Safety & Hygiene is the standard requirement for food handlers
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Certificates are typically valid for 3 years from issue date
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Online courses are available and widely accepted
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Having a certificate builds customer trust and demonstrates professionalism
          </Text>
          <Text variant="caption" style={styles.infoText}>
            • Some councils may require this certificate for food business registration
          </Text>
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
