import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button, FormField } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';

export default function HygieneRating() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [formData, setFormData] = useState({
    currentRating: 5,
    lastInspectionDate: '2024-11-15',
    nextInspectionDue: '2025-11-15',
    inspectorName: 'Sarah Johnson',
    councilName: 'Westminster City Council',
    inspectionType: 'Routine Inspection',
    businessName: 'Fatma Teyze Home Kitchen',
    businessAddress: 'SW1A 1AA, Westminster, London',
    certificateNumber: 'WCC-HR-2024-001',
    status: 'active' as 'active' | 'pending' | 'overdue',
  });

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

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Hygiene rating details have been updated successfully.',
      [{ text: 'OK', onPress: () => setIsEditing(false) }]
    );
  };

  const openFSAWebsite = () => {
    Linking.openURL('https://www.food.gov.uk/safety-hygiene/food-hygiene-rating-scheme');
  };

  const openRatingSearch = () => {
    Linking.openURL('https://ratings.food.gov.uk/');
  };

  const requestInspection = () => {
    Alert.alert(
      'Request Inspection',
      'Would you like to request a new hygiene inspection from your local council?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request', 
          onPress: () => {
            Alert.alert('Request Sent', 'Your inspection request has been sent to Westminster City Council.');
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
    switch (rating) {
      case 5: return 'Very Good';
      case 4: return 'Good';
      case 3: return 'Generally Satisfactory';
      case 2: return 'Improvement Necessary';
      case 1: return 'Major Improvement Necessary';
      case 0: return 'Urgent Improvement Necessary';
      default: return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (formData.status === 'pending') return '#FFC107';
    if (formData.status === 'overdue') return '#DC3545';
    return getRatingColor(formData.currentRating);
  };

  const getStatusText = () => {
    if (formData.status === 'pending') return '⏳ INSPECTION PENDING';
    if (formData.status === 'overdue') return '❌ INSPECTION OVERDUE';
    return `⭐ RATING: ${formData.currentRating}/5`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="🏛️ Food Hygiene Rating"
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
              Current Rating
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
              ? 'Your food hygiene inspection is pending. You will receive your rating after the inspection.'
              : formData.status === 'overdue'
              ? 'Your hygiene inspection is overdue. Please contact your local council.'
              : `Your business has received an excellent hygiene rating. Last inspected on ${formData.lastInspectionDate}.`
            }
          </Text>
        </Card>

        {/* Quick Actions */}
        <Card variant="default" padding="md" style={styles.actionsCard}>
          <Text variant="body" weight="semibold" style={styles.actionsTitle}>
            🔍 Hygiene Rating Information
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={openFSAWebsite}>
            <Text variant="body" color="primary">📖 About Food Hygiene Rating Scheme →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={openRatingSearch}>
            <Text variant="body" color="primary">🔍 Search Business Ratings →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={requestInspection}>
            <Text variant="body" color="primary">📋 Request New Inspection →</Text>
          </TouchableOpacity>
        </Card>

        {/* Rating Selection */}
        {isEditing && (
          <Card variant="default" padding="md" style={styles.ratingCard}>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              Select Your Rating
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
                  Inspection Pending
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Inspection Details */}
        <Card variant="default" padding="md" style={styles.detailsCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Inspection Details
          </Text>

          <FormField
            label="Business Name"
            value={formData.businessName}
            onChangeText={handleInputChange('businessName')}
            editable={isEditing}
            placeholder="Your registered business name"
          />

          <FormField
            label="Business Address"
            value={formData.businessAddress}
            onChangeText={handleInputChange('businessAddress')}
            editable={isEditing}
            placeholder="Full business address"
          />

          <FormField
            label="Local Council"
            value={formData.councilName}
            onChangeText={handleInputChange('councilName')}
            editable={isEditing}
            placeholder="e.g. Westminster City Council"
          />

          <FormField
            label="Last Inspection Date"
            value={formData.lastInspectionDate}
            onChangeText={handleInputChange('lastInspectionDate')}
            editable={isEditing}
            placeholder="YYYY-MM-DD"
          />

          <FormField
            label="Next Inspection Due"
            value={formData.nextInspectionDue}
            onChangeText={handleInputChange('nextInspectionDue')}
            editable={isEditing}
            placeholder="YYYY-MM-DD"
          />

          <FormField
            label="Inspector Name"
            value={formData.inspectorName}
            onChangeText={handleInputChange('inspectorName')}
            editable={isEditing}
            placeholder="Name of the food safety inspector"
          />

          <FormField
            label="Inspection Type"
            value={formData.inspectionType}
            onChangeText={handleInputChange('inspectionType')}
            editable={isEditing}
            placeholder="e.g. Routine, Follow-up, Complaint"
          />

          <FormField
            label="Certificate Number"
            value={formData.certificateNumber}
            onChangeText={handleInputChange('certificateNumber')}
            editable={isEditing}
            placeholder="Official certificate reference"
          />

          {isEditing && (
            <Button
              variant="primary"
              onPress={handleSave}
              style={styles.saveButton}
            >
              💾 Save Rating Details
            </Button>
          )}
        </Card>

        {/* Rating Information */}
        <Card variant="default" padding="md" style={styles.infoCard}>
          <Text variant="body" weight="semibold" style={styles.infoTitle}>
            ℹ️ Understanding Food Hygiene Ratings
          </Text>
          <View style={styles.ratingInfo}>
            <Text variant="caption" style={[styles.infoText, { color: '#28A745' }]}>
              <Text weight="bold">5 - Very Good:</Text> Excellent hygiene standards
            </Text>
            <Text variant="caption" style={[styles.infoText, { color: '#28A745' }]}>
              <Text weight="bold">4 - Good:</Text> Good hygiene standards
            </Text>
            <Text variant="caption" style={[styles.infoText, { color: '#FFC107' }]}>
              <Text weight="bold">3 - Generally Satisfactory:</Text> Hygiene standards are generally satisfactory
            </Text>
            <Text variant="caption" style={[styles.infoText, { color: '#DC3545' }]}>
              <Text weight="bold">2 - Improvement Necessary:</Text> Some improvement necessary
            </Text>
            <Text variant="caption" style={[styles.infoText, { color: '#DC3545' }]}>
              <Text weight="bold">1 - Major Improvement Necessary:</Text> Major improvement necessary
            </Text>
            <Text variant="caption" style={[styles.infoText, { color: '#DC3545' }]}>
              <Text weight="bold">0 - Urgent Improvement Necessary:</Text> Urgent improvement necessary
            </Text>
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
