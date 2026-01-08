import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock seller data for admin review
const PENDING_SELLERS = [
  {
    id: '1',
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    postcode: 'SW1A 1AA',
    councilName: 'Westminster City Council',
    councilRegistered: true,
    foodHygieneCertificate: true,
    hygieneRating: '4',
    allergenDeclaration: true,
    legalResponsibility: true,
    insuranceOptional: false,
    submittedAt: '2024-01-08 10:30',
    status: 'pending',
  },
  {
    id: '2',
    fullName: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    postcode: 'E1 6AN',
    councilName: 'Tower Hamlets Council',
    councilRegistered: true,
    foodHygieneCertificate: false,
    hygieneRating: 'Pending',
    allergenDeclaration: true,
    legalResponsibility: true,
    insuranceOptional: true,
    submittedAt: '2024-01-08 09:15',
    status: 'pending',
  },
];

export const AdminPanel: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [sellers, setSellers] = useState(PENDING_SELLERS);

  const handleApprove = (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;

    // Check compliance requirements
    if (!seller.councilRegistered) {
      Alert.alert('Cannot Approve', 'Seller must be registered with local council.');
      return;
    }
    
    if (!seller.allergenDeclaration) {
      Alert.alert('Cannot Approve', 'Seller must complete allergen declaration.');
      return;
    }
    
    if (!seller.legalResponsibility) {
      Alert.alert('Cannot Approve', 'Seller must accept legal responsibility.');
      return;
    }

    Alert.alert(
      'Approve Seller',
      `Approve ${seller.fullName} as a food seller?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            setSellers(prev => prev.map(s => 
              s.id === sellerId ? { ...s, status: 'approved' } : s
            ));
            Alert.alert('Success', `${seller.fullName} has been approved and can now sell food.`);
          }
        }
      ]
    );
  };

  const handleSuspend = (sellerId: string, reason: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;

    Alert.alert(
      'Suspend Seller',
      `Suspend ${seller.fullName}?\nReason: ${reason}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: () => {
            setSellers(prev => prev.map(s => 
              s.id === sellerId ? { ...s, status: 'suspended', suspensionReason: reason } : s
            ));
            Alert.alert('Suspended', `${seller.fullName} has been suspended.`);
          }
        }
      ]
    );
  };

  const getComplianceStatus = (seller: any) => {
    const requirements = [
      seller.councilRegistered,
      seller.allergenDeclaration,
      seller.legalResponsibility,
    ];
    const completed = requirements.filter(Boolean).length;
    return `${completed}/3 Required`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#28A745';
      case 'suspended': return '#DC3545';
      case 'pending': return '#FFC107';
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="🛠️ Admin Panel - UK Compliance"
        subtitle={`${sellers.filter(s => s.status === 'pending').length} pending reviews`}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="subheading" weight="semibold">
            Seller Applications
          </Text>
          <Text variant="caption" color="textSecondary">
            Review UK food business compliance
          </Text>
        </View>

        {sellers.map((seller) => (
          <Card key={seller.id} variant="default" padding="md" style={styles.sellerCard}>
            <View style={styles.sellerHeader}>
              <View style={styles.sellerInfo}>
                <Text variant="subheading" weight="semibold">
                  {seller.fullName}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {seller.email}
                </Text>
                <Text variant="caption" color="textSecondary">
                  📍 {seller.postcode} • {seller.councilName}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text 
                  variant="caption" 
                  weight="semibold"
                  style={[styles.statusText, { color: getStatusColor(seller.status) }]}
                >
                  {seller.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.complianceSection}>
              <Text variant="body" weight="medium" style={styles.complianceTitle}>
                UK Compliance Check ({getComplianceStatus(seller)})
              </Text>
              
              <View style={styles.complianceItems}>
                <View style={styles.complianceItem}>
                  <Text variant="caption" style={styles.complianceLabel}>
                    {seller.councilRegistered ? '✅' : '❌'} Council Registration
                  </Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text variant="caption" style={styles.complianceLabel}>
                    {seller.foodHygieneCertificate ? '✅' : '⚠️'} Food Hygiene Certificate
                  </Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text variant="caption" style={styles.complianceLabel}>
                    🏛️ Hygiene Rating: {seller.hygieneRating}
                  </Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text variant="caption" style={styles.complianceLabel}>
                    {seller.allergenDeclaration ? '✅' : '❌'} Allergen Declaration
                  </Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text variant="caption" style={styles.complianceLabel}>
                    {seller.legalResponsibility ? '✅' : '❌'} Legal Responsibility
                  </Text>
                </View>
                <View style={styles.complianceItem}>
                  <Text variant="caption" style={styles.complianceLabel}>
                    {seller.insuranceOptional ? '✅' : '⚠️'} Insurance (Optional)
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.submissionInfo}>
              <Text variant="caption" color="textSecondary">
                Submitted: {seller.submittedAt}
              </Text>
            </View>

            {seller.status === 'pending' && (
              <View style={styles.actions}>
                <Button
                  variant="outline"
                  onPress={() => handleSuspend(seller.id, 'Incomplete documentation')}
                  style={styles.suspendButton}
                >
                  Suspend
                </Button>
                <Button
                  variant="primary"
                  onPress={() => handleApprove(seller.id)}
                  style={styles.approveButton}
                >
                  Approve
                </Button>
              </View>
            )}

            {seller.status === 'suspended' && (
              <View style={styles.suspendedInfo}>
                <Text variant="caption" style={{ color: '#DC3545' }}>
                  Suspended: {seller.suspensionReason || 'No reason provided'}
                </Text>
              </View>
            )}
          </Card>
        ))}

        <View style={styles.footer}>
          <Text variant="caption" color="textSecondary" style={styles.footerText}>
            🇬🇧 UK Food Business Compliance System
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.footerText}>
            All sellers must comply with UK food safety regulations
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
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  sellerCard: {
    marginBottom: Spacing.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sellerInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusText: {
    fontSize: 10,
  },
  complianceSection: {
    marginBottom: Spacing.md,
  },
  complianceTitle: {
    marginBottom: Spacing.sm,
    color: '#2D5A4A',
  },
  complianceItems: {
    gap: Spacing.xs,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceLabel: {
    fontSize: 12,
  },
  submissionInfo: {
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  suspendButton: {
    flex: 1,
    borderColor: '#DC3545',
  },
  approveButton: {
    flex: 1,
  },
  suspendedInfo: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.3)',
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
  },
});

