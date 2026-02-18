import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Text, Card, Button } from '../src/components/ui';
import { TopBar } from '../src/components/layout/TopBar';
import { Colors, Spacing } from '../src/theme';
import { useColorScheme } from '../components/useColorScheme';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');
const ADMIN_TOKEN_KEY = 'admin_auth_token';

type AdminTab = 'sellers' | 'products' | 'rules';

interface AdminApiEnvelope<T> {
  status: number;
  data?: T;
  error?: string;
}

interface AdminLoginData {
  token: string;
  tokenType: string;
  expiresIn: number;
  admin: {
    email: string;
    role: string;
  };
}

interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface SellerRecord {
  uid: string;
  email: string;
  fullName?: string;
  displayName?: string;
  birthDate?: string;
  gender?: string;
  userType?: string;
  createdAt?: string;
  identityStatus?: string;
  complianceApproved?: boolean | number | string;
  complianceCouncilRegistered?: boolean | number | string;
  complianceHygieneCertificate?: boolean | number | string;
  complianceHygieneRating?: boolean | number | string;
  complianceAllergensDeclared?: boolean | number | string;
  suspensionReason?: string;
}

interface ProductRecord {
  id: string;
  name?: string;
  cookId?: string;
  sellerId?: string;
  status?: string;
  ingredients?: string;
  allergens?: string[] | string;
  isAvailable?: boolean;
}

const toBool = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
};

const parseAllergens = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // fall back to comma separated parsing
    }

    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const formatDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const resolveSellerStatus = (seller: SellerRecord): string => {
  if (toBool(seller.complianceApproved)) return 'APPROVED';

  const raw = String(seller.identityStatus || '').trim();
  if (!raw) return 'PENDING';

  const normalized = raw.toUpperCase();
  if (normalized === 'VERIFIED') return 'APPROVED';
  if (normalized === 'REJECTED') return 'SUSPENDED';
  return normalized;
};

const resolveProductStatus = (product: ProductRecord): string => {
  const raw = String(product.status || '').trim();
  if (raw) return raw.toUpperCase();
  return product.isAvailable === false ? 'INACTIVE' : 'ACTIVE';
};

const resolveFullName = (seller: SellerRecord): string => {
  const fullName = String(seller.fullName || '').trim();
  if (fullName) return fullName;
  const displayName = String(seller.displayName || '').trim();
  if (displayName) return displayName;
  return '-';
};

export default function AdminPanel() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [activeTab, setActiveTab] = useState<AdminTab>('sellers');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);

  const requestAdminApi = useCallback(
    async <T,>(path: string, options?: RequestInit, tokenOverride?: string): Promise<T> => {
      if (!API_BASE_URL) {
        throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured. Admin panel requires remote API mode.');
      }

      const bearer = tokenOverride || adminToken;
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
          ...(options?.headers || {}),
        },
        body: options?.body,
      });

      const payload = (await response.json().catch(() => null)) as AdminApiEnvelope<T> | null;
      if (!response.ok || payload?.error || !payload || payload.status >= 400) {
        throw new Error(payload?.error || `Request failed (${response.status})`);
      }

      return payload.data as T;
    },
    [adminToken]
  );

  const loadDashboardData = useCallback(
    async (token: string) => {
      setDataLoading(true);
      setErrorMessage('');

      try {
        const [sellerResponse, productResponse] = await Promise.all([
          requestAdminApi<Paginated<SellerRecord>>('/admin/users?role=seller&page=1&pageSize=200&sortBy=updatedAt&sortDir=desc', undefined, token),
          requestAdminApi<Paginated<ProductRecord>>('/admin/foods?page=1&pageSize=200&sortBy=updatedAt&sortDir=desc', undefined, token),
        ]);

        setSellers(Array.isArray(sellerResponse?.items) ? sellerResponse.items : []);
        setProducts(Array.isArray(productResponse?.items) ? productResponse.items : []);
      } catch (error: any) {
        const message = error?.message || 'Failed to load admin data';
        setErrorMessage(message);
      } finally {
        setDataLoading(false);
      }
    },
    [requestAdminApi]
  );

  useEffect(() => {
    const restoreSession = async () => {
      setAuthLoading(true);

      if (!API_BASE_URL) {
        setErrorMessage('Set EXPO_PUBLIC_API_BASE_URL in .env.local to use the admin API.');
        setAuthLoading(false);
        return;
      }

      try {
        const storedToken = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
        if (!storedToken) {
          setAuthLoading(false);
          return;
        }

        await requestAdminApi('/admin/auth/me', undefined, storedToken);
        setAdminToken(storedToken);
        await loadDashboardData(storedToken);
      } catch {
        await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
      } finally {
        setAuthLoading(false);
      }
    };

    void restoreSession();
  }, [loadDashboardData, requestAdminApi]);

  const handleAdminLogin = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      Alert.alert('Missing fields', 'Enter admin email and password.');
      return;
    }

    setLoginLoading(true);
    setErrorMessage('');

    try {
      const login = await requestAdminApi<AdminLoginData>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: adminEmail.trim().toLowerCase(),
          password: adminPassword,
        }),
      });

      await AsyncStorage.setItem(ADMIN_TOKEN_KEY, login.token);
      setAdminToken(login.token);
      setAdminPassword('');
      await loadDashboardData(login.token);
    } catch (error: any) {
      const message = error?.message || 'Admin login failed';
      setErrorMessage(message);
      Alert.alert('Admin login failed', message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setSellers([]);
    setProducts([]);
    setAdminPassword('');
    setErrorMessage('');
  };

  const handleRefresh = async () => {
    if (!adminToken) return;
    await loadDashboardData(adminToken);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'VERIFIED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'SUSPENDED':
      case 'BANNED':
      case 'INACTIVE':
      case 'REJECTED':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'VERIFIED':
        return '✅';
      case 'PENDING':
        return '⏳';
      case 'SUSPENDED':
      case 'INACTIVE':
        return '⏸️';
      case 'BANNED':
      case 'REJECTED':
        return '🚫';
      default:
        return '❓';
    }
  };

  const renderSellers = () => (
    <ScrollView style={styles.tabContent}>
      <Text variant="subheading" style={styles.sectionTitle}>
        Seller Management
      </Text>

      {sellers.length === 0 && !dataLoading ? (
        <Card variant="default" padding="md">
          <Text variant="body" color="textSecondary">No sellers found.</Text>
        </Card>
      ) : null}

      {sellers.map((seller) => {
        const status = resolveSellerStatus(seller);
        const fullName = resolveFullName(seller);
        return (
          <Card key={seller.uid} variant="default" padding="md" style={styles.sellerCard}>
            <View style={styles.sellerHeader}>
              <View style={styles.sellerInfo}>
                <Text variant="body" weight="semibold">Display name: {seller.displayName || '-'}</Text>
                <Text variant="caption" color="textSecondary">Full name: {fullName}</Text>
                <Text variant="caption" color="textSecondary">Date of birth: {seller.birthDate || '-'}</Text>
                <Text variant="caption" color="textSecondary">Gender: {seller.gender || '-'}</Text>
                <Text variant="caption" color="textSecondary">{seller.email}</Text>
                <Text variant="caption" color="textSecondary">Registered: {formatDate(seller.createdAt)}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text variant="caption" style={{ color: getStatusColor(status) }}>
                  {getStatusIcon(status)} {status}
                </Text>
              </View>
            </View>

            <View style={styles.complianceChecklist}>
              <Text variant="caption" weight="medium" style={styles.checklistTitle}>
                Compliance
              </Text>
              <Text variant="caption" color={toBool(seller.complianceCouncilRegistered) ? 'success' : 'error'}>
                {toBool(seller.complianceCouncilRegistered) ? '✅' : '❌'} Council Registration
              </Text>
              <Text variant="caption" color={toBool(seller.complianceHygieneCertificate) ? 'success' : 'error'}>
                {toBool(seller.complianceHygieneCertificate) ? '✅' : '❌'} Food Hygiene Certificate
              </Text>
              <Text variant="caption" color={toBool(seller.complianceHygieneRating) ? 'success' : 'warning'}>
                {toBool(seller.complianceHygieneRating) ? '✅' : '⏳'} Hygiene Rating
              </Text>
              <Text variant="caption" color={toBool(seller.complianceAllergensDeclared) ? 'success' : 'error'}>
                {toBool(seller.complianceAllergensDeclared) ? '✅' : '❌'} Allergen Declaration
              </Text>
            </View>

            {seller.suspensionReason ? (
              <View style={styles.suspensionReason}>
                <Text variant="caption" color="error" weight="medium">
                  Suspension Reason: {seller.suspensionReason}
                </Text>
              </View>
            ) : null}
          </Card>
        );
      })}
    </ScrollView>
  );

  const renderProducts = () => (
    <ScrollView style={styles.tabContent}>
      <Text variant="subheading" style={styles.sectionTitle}>
        Product Management
      </Text>

      {products.length === 0 && !dataLoading ? (
        <Card variant="default" padding="md">
          <Text variant="body" color="textSecondary">No products found.</Text>
        </Card>
      ) : null}

      {products.map((product) => {
        const status = resolveProductStatus(product);
        const allergens = parseAllergens(product.allergens);

        return (
          <Card key={product.id} variant="default" padding="md" style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text variant="body" weight="semibold">{product.name || '-'}</Text>
                <Text variant="caption" color="textSecondary">
                  Seller ID: {product.cookId || product.sellerId || '-'}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text variant="caption" style={{ color: getStatusColor(status) }}>
                  {getStatusIcon(status)} {status}
                </Text>
              </View>
            </View>

            <View style={styles.productChecklist}>
              <Text variant="caption" weight="medium" style={styles.checklistTitle}>
                Product Compliance
              </Text>
              <Text variant="caption" color={product.ingredients ? 'success' : 'error'}>
                {product.ingredients ? '✅' : '❌'} Ingredients: {product.ingredients || 'Missing'}
              </Text>
              <Text variant="caption" color={allergens.length > 0 ? 'success' : 'warning'}>
                {allergens.length > 0 ? '✅' : '⚠️'} Allergens: {allergens.length > 0 ? allergens.join(', ') : 'None declared'}
              </Text>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );

  const renderRules = () => (
    <ScrollView style={styles.tabContent}>
      <Text variant="subheading" style={styles.sectionTitle}>
        UK Food Business Rules
      </Text>

      <Card variant="default" padding="md" style={styles.rulesCard}>
        <Text variant="body" weight="semibold" style={styles.rulesTitle}>
          Seller Approval Requirements
        </Text>
        <Text variant="caption" style={styles.ruleItem}>• Council food business registration (mandatory)</Text>
        <Text variant="caption" style={styles.ruleItem}>• Food Hygiene Level 2 certificate (strongly recommended)</Text>
        <Text variant="caption" style={styles.ruleItem}>• Hygiene rating declared (0-5 or inspection pending)</Text>
        <Text variant="caption" style={styles.ruleItem}>• All 14 major allergens must be declared</Text>
        <Text variant="caption" style={styles.ruleItem}>• Legal responsibility acceptance required</Text>
      </Card>

      <Card variant="default" padding="md" style={styles.rulesCard}>
        <Text variant="body" weight="semibold" style={styles.rulesTitle}>
          Product Approval Rules
        </Text>
        <Text variant="caption" style={styles.ruleItem}>• Ingredients list cannot be empty</Text>
        <Text variant="caption" style={styles.ruleItem}>• Allergen information must be provided</Text>
        <Text variant="caption" style={styles.ruleItem}>• Seller must be in APPROVED status</Text>
      </Card>

      <Card variant="default" padding="md" style={styles.rulesCard}>
        <Text variant="body" weight="semibold" style={styles.rulesTitle}>
          Order Security Rules
        </Text>
        <Text variant="caption" style={styles.ruleItem}>• Allergen warning must be accepted by buyer</Text>
        <Text variant="caption" style={styles.ruleItem}>• Marketplace disclaimer must be accepted</Text>
        <Text variant="caption" style={styles.ruleItem}>• Seller must be APPROVED status</Text>
        <Text variant="caption" style={styles.ruleItem}>• Product must be APPROVED status</Text>
      </Card>
    </ScrollView>
  );

  const renderLogin = () => (
    <View style={styles.loginWrapper}>
      <Card variant="default" padding="md" style={styles.loginCard}>
        <Text variant="subheading" weight="semibold" style={styles.loginTitle}>
          Admin API Login
        </Text>
        <Text variant="caption" color="textSecondary" style={styles.apiHint}>
          API: {API_BASE_URL || 'not configured'}
        </Text>

        <TextInput
          value={adminEmail}
          onChangeText={setAdminEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Admin email"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
        />

        <TextInput
          value={adminPassword}
          onChangeText={setAdminPassword}
          secureTextEntry
          placeholder="Admin password"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
        />

        <Button variant="primary" onPress={handleAdminLogin} loading={loginLoading}>
          Sign In
        </Button>

        {errorMessage ? (
          <Text variant="caption" color="error" style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}
      </Card>
    </View>
  );

  if (authLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <TopBar
        title="Admin Panel"
        leftComponent={
          <TouchableOpacity onPress={() => router.push('/(seller)/seller-panel')} style={styles.sellerButton}>
            <Text variant="body" color="text" style={styles.sellerText}>
              Seller
            </Text>
          </TouchableOpacity>
        }
        rightComponent={
          adminToken ? (
            <TouchableOpacity onPress={handleAdminLogout} style={styles.logoutButton}>
              <Text variant="caption" color="error" weight="medium">Logout</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {!adminToken ? (
        renderLogin()
      ) : (
        <>
          <View style={styles.toolbar}>
            <Button variant="outline" size="sm" onPress={handleRefresh} loading={dataLoading}>
              Refresh
            </Button>
            <Text variant="caption" color="textSecondary">
              Sellers: {sellers.length} | Products: {products.length}
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text variant="caption" color="error">{errorMessage}</Text>
            </View>
          ) : null}

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

          {activeTab === 'sellers' && renderSellers()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'rules' && renderRules()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginWrapper: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  loginCard: {
    gap: Spacing.sm,
  },
  loginTitle: {
    marginBottom: Spacing.xs,
  },
  apiHint: {
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  toolbar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBanner: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
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
  logoutButton: {
    padding: Spacing.xs,
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
