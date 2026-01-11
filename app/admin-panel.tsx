import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';

// Mock data for demonstration
const MOCK_SELLERS = [
  {
    id: '1',
    name: 'Fatma Teyze',
    email: 'fatma@example.com',
    status: 'APPROVED',
    councilRegistered: true,
    hygieneCertificate: true,
    hygieneRating: '5',
    allergensDeclared: true,
    registrationDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Mehmet Usta',
    email: 'mehmet@example.com',
    status: 'PENDING',
    councilRegistered: true,
    hygieneCertificate: false,
    hygieneRating: 'pending',
    allergensDeclared: true,
    registrationDate: '2024-01-20',
  },
  {
    id: '3',
    name: 'Ayşe Hanım',
    email: 'ayse@example.com',
    status: 'SUSPENDED',
    councilRegistered: true,
    hygieneCertificate: true,
    hygieneRating: '3',
    allergensDeclared: false,
    registrationDate: '2024-01-10',
    suspensionReason: 'Allergen information incomplete',
  },
];

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Ev Yapımı Mantı',
    sellerId: '1',
    status: 'APPROVED',
    allergens: ['eggs', 'cereals'],
    ingredients: 'Un, yumurta, kıyma, soğan',
  },
  {
    id: '2',
    name: 'Çiğ Köfte',
    sellerId: '2',
    status: 'PENDING',
    allergens: [],
    ingredients: '',
  },
];

export default function AdminPanel() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<'sellers' | 'products' | 'rules'>('sellers');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return colors.success;
      case 'PENDING': return colors.warning;
      case 'SUSPENDED': return colors.error;
      case 'BANNED': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'PENDING': return '⏳';
      case 'SUSPENDED': return '⏸️';
      case 'BANNED': return '🚫';
      default: return '❓';
    }
  };

  const renderSellers = () => (
    <ScrollView style={styles.tabContent}>
      <Text variant="subheading" style={styles.sectionTitle}>
        🧑‍🍳 Seller Management
      </Text>
      {MOCK_SELLERS.map((seller) => (
        <Card key={seller.id} variant="default" padding="md" style={styles.sellerCard}>
          <View style={styles.sellerHeader}>
            <View style={styles.sellerInfo}>
              <Text variant="body" weight="semibold">{seller.name}</Text>
              <Text variant="caption" color="textSecondary">{seller.email}</Text>
              <Text variant="caption" color="textSecondary">
                Registered: {seller.registrationDate}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text variant="caption" style={{ color: getStatusColor(seller.status) }}>
                {getStatusIcon(seller.status)} {seller.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.complianceChecklist}>
            <Text variant="caption" weight="medium" style={styles.checklistTitle}>
              UK Compliance Checklist:
            </Text>
            <Text variant="caption" color={seller.councilRegistered ? 'success' : 'error'}>
              {seller.councilRegistered ? '✅' : '❌'} Council Registration
            </Text>
            <Text variant="caption" color={seller.hygieneCertificate ? 'success' : 'error'}>
              {seller.hygieneCertificate ? '✅' : '❌'} Food Hygiene Certificate
            </Text>
            <Text variant="caption" color={seller.hygieneRating !== 'pending' ? 'success' : 'warning'}>
              {seller.hygieneRating !== 'pending' ? '✅' : '⏳'} Hygiene Rating: {seller.hygieneRating}
            </Text>
            <Text variant="caption" color={seller.allergensDeclared ? 'success' : 'error'}>
              {seller.allergensDeclared ? '✅' : '❌'} Allergen Declaration
            </Text>
          </View>

          {seller.suspensionReason && (
            <View style={styles.suspensionReason}>
              <Text variant="caption" color="error" weight="medium">
                Suspension Reason: {seller.suspensionReason}
              </Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            {seller.status === 'PENDING' && (
              <>
                <Button variant="primary" size="small" style={styles.actionButton}>
                  Approve
                </Button>
                <Button variant="outline" size="small" style={styles.actionButton}>
                  Request Info
                </Button>
              </>
            )}
            {seller.status === 'APPROVED' && (
              <Button variant="secondary" size="small" style={styles.actionButton}>
                Suspend
              </Button>
            )}
            {seller.status === 'SUSPENDED' && (
              <Button variant="primary" size="small" style={styles.actionButton}>
                Reactivate
              </Button>
            )}
          </View>
        </Card>
      ))}
    </ScrollView>
  );

  const renderProducts = () => (
    <ScrollView style={styles.tabContent}>
      <Text variant="subheading" style={styles.sectionTitle}>
        🍽️ Product Management
      </Text>
      {MOCK_PRODUCTS.map((product) => (
        <Card key={product.id} variant="default" padding="md" style={styles.productCard}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text variant="body" weight="semibold">{product.name}</Text>
              <Text variant="caption" color="textSecondary">
                Seller ID: {product.sellerId}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text variant="caption" style={{ color: getStatusColor(product.status) }}>
                {getStatusIcon(product.status)} {product.status}
              </Text>
            </View>
          </View>

          <View style={styles.productChecklist}>
            <Text variant="caption" weight="medium" style={styles.checklistTitle}>
              Product Compliance:
            </Text>
            <Text variant="caption" color={product.ingredients ? 'success' : 'error'}>
              {product.ingredients ? '✅' : '❌'} Ingredients: {product.ingredients || 'Missing'}
            </Text>
            <Text variant="caption" color={product.allergens.length > 0 ? 'success' : 'warning'}>
              {product.allergens.length > 0 ? '✅' : '⚠️'} Allergens: {product.allergens.length > 0 ? product.allergens.join(', ') : 'None declared'}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {product.status === 'PENDING' && (
              <>
                <Button variant="primary" size="small" style={styles.actionButton}>
                  Approve
                </Button>
                <Button variant="outline" size="small" style={styles.actionButton}>
                  Request Changes
                </Button>
              </>
            )}
          </View>
        </Card>
      ))}
    </ScrollView>
  );

  const renderRules = () => (
    <ScrollView style={styles.tabContent}>
      <Text variant="subheading" style={styles.sectionTitle}>
        📋 UK Food Business Rules
      </Text>
      
      <Card variant="default" padding="md" style={styles.rulesCard}>
        <Text variant="body" weight="semibold" style={styles.rulesTitle}>
          🇬🇧 Seller Approval Requirements
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Council food business registration (mandatory)
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Food Hygiene Level 2 certificate (strongly recommended)
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Hygiene rating declared (0-5 or inspection pending)
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • All 14 major allergens must be declared
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Legal responsibility acceptance required
        </Text>
      </Card>

      <Card variant="default" padding="md" style={styles.rulesCard}>
        <Text variant="body" weight="semibold" style={styles.rulesTitle}>
          🍽️ Product Approval Rules
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Ingredients list cannot be empty
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Allergen information must be provided
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Seller must be in APPROVED status
        </Text>
      </Card>

      <Card variant="default" padding="md" style={styles.rulesCard}>
        <Text variant="body" weight="semibold" style={styles.rulesTitle}>
          🛡️ Order Security Rules
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Allergen warning must be accepted by buyer
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Marketplace disclaimer must be accepted
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Seller must be APPROVED status
        </Text>
        <Text variant="caption" style={styles.ruleItem}>
          • Product must be APPROVED status
        </Text>
      </Card>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="🛠️ Admin Panel"
        leftComponent={
          <TouchableOpacity onPress={() => router.push('/(seller)/dashboard')} style={styles.sellerButton}>
            <Text variant="body" color="text" style={styles.sellerText}>
              Seller <Text style={styles.sellerIcon}>●</Text>
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sellers' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('sellers')}
        >
          <Text variant="body" color={activeTab === 'sellers' ? 'primary' : 'textSecondary'}>
            Sellers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('products')}
        >
          <Text variant="body" color={activeTab === 'products' ? 'primary' : 'textSecondary'}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rules' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('rules')}
        >
          <Text variant="body" color={activeTab === 'rules' ? 'primary' : 'textSecondary'}>
            Rules
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'sellers' && renderSellers()}
      {activeTab === 'products' && renderProducts()}
      {activeTab === 'rules' && renderRules()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
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
  tabContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.light.primary,
  },
  sellerCard: {
    marginBottom: Spacing.md,
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  sellerInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
  },
  complianceChecklist: {
    marginVertical: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  checklistTitle: {
    marginBottom: Spacing.xs,
    color: Colors.light.text,
  },
  suspensionReason: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  productCard: {
    marginBottom: Spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productChecklist: {
    marginVertical: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  rulesCard: {
    marginBottom: Spacing.md,
  },
  rulesTitle: {
    marginBottom: Spacing.sm,
    color: Colors.light.primary,
  },
  ruleItem: {
    marginBottom: Spacing.xs,
    lineHeight: 18,
    color: Colors.light.text,
  },
});