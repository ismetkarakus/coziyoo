import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TouchableWithoutFeedback, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { useCountry } from '../../../context/CountryContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemePreference } from '../../../context/ThemeContext';
import { WebSafeIcon } from '../../../components/ui/WebSafeIcon';
import sellerMock from '../../../mock/seller.json';

export const SellerPanel: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const localizedMock = (sellerMock as any)[currentLanguage] ?? sellerMock.tr;
  const [profileData, setProfileData] = useState(localizedMock.profile);
  const stats = localizedMock.stats;
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  const { preference, setPreference } = useThemePreference();
  
  // Hook'ları önce çağır
  const { currentCountry, isBusinessComplianceRequired } = useCountry();
  const { signOut } = useAuth();
  const panel = localizedMock.panel;
  const menuItems = localizedMock.panel.menu;
  const complianceCopy = currentCountry.code === 'TR' ? panel.compliance.tr : panel.compliance.uk;
  
  // Ülkeye göre menü öğeleri (JSON)

  // UK Compliance Status Check
  const isComplianceComplete = () => {
    // Mock data - gerçek uygulamada AsyncStorage veya API'den gelecek
    const complianceStatus = {
      councilRegistered: true, // Test için true
      hygieneCertificate: true,
      allergensDeclared: true,
      hygieneRating: true,
      insurance: true,
      termsAccepted: true,
      approved: true // Admin onayı
    };
    
    return Object.values(complianceStatus).every(status => status === true);
  };

  const complianceComplete = isComplianceComplete();

  // Load profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('sellerProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        if (profile.formData) {
          setProfileData({
            name: profile.formData.nickname || profile.formData.name || localizedMock.profile.name, // Nickname öncelikli
            email: profile.formData.email || localizedMock.profile.email,
            location: profile.formData.location || localizedMock.profile.location,
            avatar: profile.avatarUri || localizedMock.profile.avatar,
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  const handleBackPress = () => {
    console.log('Back button pressed - navigating to home'); // Debug log
    router.push('/(tabs)'); // Navigate to home/main screen
  };

  const handleSignOut = () => {
    const runSignOut = async () => {
      try {
        await signOut();
        router.replace('/(auth)/sign-in');
      } catch (error) {
        console.error('Sign out error:', error);
        Alert.alert(panel.alerts.signOutTitle, panel.alerts.signOutError);
      }
    };

    if (Platform.OS === 'web') {
      runSignOut();
      return;
    }

    Alert.alert(
      panel.alerts.signOutTitle,
      panel.alerts.signOutMessage,
      [
        { text: panel.alerts.ok, style: 'cancel' },
        {
          text: panel.alerts.ok,
          style: 'destructive',
          onPress: runSignOut,
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={panel.title} 
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity
            onPress={() => router.push('/(seller)/profile')}
            style={styles.headerProfileButton}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: profileData.avatar }}
              style={styles.headerAvatar}
              defaultSource={{ uri: 'https://via.placeholder.com/60x60/7FAF9A/FFFFFF?text=S' }}
            />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
          {/* Stats Section - Moved to top */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (complianceExpanded) {
              setComplianceExpanded(false);
            }
          }}
        >
          <View style={styles.statsContainer}>
            <Text variant="subheading" weight="semibold" style={styles.statsTitle}>
              {panel.statsTitle}
            </Text>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity onPress={() => handleMenuPress('/(seller)/orders')} style={styles.statCard}>
              <Card variant="default" padding="sm">
                <Text variant="title" weight="bold" color="primary" center>
                  {stats.orders}
                </Text>
                <Text variant="caption" center color="textSecondary">
                  {panel.statsLabels.orders}
                </Text>
              </Card>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleMenuPress('/(seller)/wallet')} style={styles.statCard}>
              <Card variant="default" padding="sm">
                <Text variant="title" weight="bold" color="success" center>
                  {stats.wallet}
                </Text>
                <Text variant="caption" center color="textSecondary">
                  {panel.statsLabels.wallet}
                </Text>
              </Card>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleMenuPress('/(seller)/messages')} style={styles.statCard}>
              <Card variant="default" padding="sm">
                <Text variant="title" weight="bold" color="info" center>
                  {stats.messages}
                </Text>
                <Text variant="caption" center color="textSecondary">
                  {panel.statsLabels.messages}
                </Text>
              </Card>
            </TouchableOpacity>
            
            <Card variant="default" padding="sm" style={styles.statCard}>
              <Text variant="title" weight="bold" color="warning" center>
                {stats.rating}
              </Text>
              <Text variant="caption" center color="textSecondary">
                {panel.statsLabels.rating}
              </Text>
            </Card>
          </View>
          </View>
        </TouchableWithoutFeedback>

        {/* Theme */}
        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {panel.themeTitle}
          </Text>
          <Card variant="default" padding="md" style={styles.sectionCard}>
            <View style={styles.themeToggleRow}>
              <TouchableOpacity
                onPress={() => setPreference('light')}
                style={[
                  styles.themeToggleButton,
                  { borderColor: colors.border },
                  preference === 'light' && { borderColor: colors.primary, backgroundColor: colors.surface },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.themeToggleContent}>
                  <WebSafeIcon name="sun-o" size={16} color={colors.text} />
                  <Text variant="body" weight="semibold">
                    {panel.theme.light}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPreference('dark')}
                style={[
                  styles.themeToggleButton,
                  { borderColor: colors.border },
                  preference === 'dark' && { borderColor: colors.primary, backgroundColor: colors.surface },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.themeToggleContent}>
                  <WebSafeIcon name="moon-o" size={16} color={colors.text} />
                  <Text variant="body" weight="semibold">
                    {panel.theme.dark}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPreference('system')}
                style={[
                  styles.themeToggleButton,
                  { borderColor: colors.border },
                  preference === 'system' && { borderColor: colors.primary, backgroundColor: colors.surface },
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.themeToggleContent}>
                  <WebSafeIcon name="cog" size={16} color={colors.text} />
                  <Text variant="body" weight="semibold">
                    {panel.theme.system}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Business Compliance Status Card - Her Ülke İçin Göster */}
        {(
          <View style={styles.complianceWrapper}>
            <TouchableOpacity
              onPress={() => setComplianceExpanded(!complianceExpanded)}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="md" style={styles.complianceCard}>
                <View style={styles.complianceHeader}>
                <Text
                  variant="subheading"
                  weight="semibold"
                  style={[styles.complianceTitle, { color: colors.text }]}
                >
                    {complianceCopy.title}
                  </Text>
                <View style={styles.complianceHeaderRight}>
                  <Text variant="caption" style={[
                    styles.statusBadge, 
                    {
                      backgroundColor: currentCountry.code === 'TR' 
                        ? (complianceComplete ? '#28A745' : '#17A2B8') // Türkiye: Yeşil/Mavi
                        : (complianceComplete ? '#28A745' : '#FFC107'), // UK: Yeşil/Sarı
                      color: 'white'
                    }
                  ]}>
                    {currentCountry.code === 'TR' 
                      ? (complianceComplete ? panel.compliance.tr.statusComplete : panel.compliance.tr.statusOptional)
                      : (complianceComplete ? panel.compliance.uk.statusComplete : panel.compliance.uk.statusOptional)
                    }
                  </Text>
                  <Text variant="body" style={[styles.expandIcon, { color: colors.textSecondary }]}>
                    {complianceExpanded ? '▼' : '▶'}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
          
          {complianceExpanded && (
            <Card variant="default" padding="md" style={[styles.complianceCard, styles.complianceExpandedCard]}>
              <View style={styles.complianceItems}>
            {complianceCopy.items.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.complianceItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  router.push(item.route);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.complianceItemContent}>
                  <Text variant="body" style={[styles.complianceLabel, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text variant="caption" color="primary" style={styles.editLink}>
                    {complianceCopy.edit}
                  </Text>
                </View>
                <Text variant="caption" color="textSecondary">
                  {item.sub}
                </Text>
              </TouchableOpacity>
            ))}
              
                <TouchableOpacity 
                  style={[styles.complianceButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    router.push('/terms-and-conditions');
                  }}
                >
                  <Text variant="body" color="primary" style={styles.complianceButtonText}>
                    {currentCountry.code === 'TR' 
                      ? panel.compliance.tr.terms
                      : panel.compliance.uk.terms
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>
        )}

        {/* Menu Sections - Separate Cards */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (complianceExpanded) {
              setComplianceExpanded(false);
            }
          }}
        >
          <View style={styles.menuSectionsContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                // Türkiye'de compliance zorunlu değil, UK'da zorunlu
                const needsCompliance = isBusinessComplianceRequired;
                
                if (!needsCompliance || complianceComplete) {
                  handleMenuPress(item.route);
                } else {
                  Alert.alert(
                    currentCountry.code === 'TR' 
                      ? panel.alerts.complianceTitleTr
                      : panel.alerts.complianceTitleUk,
                    currentCountry.code === 'TR'
                      ? panel.alerts.complianceMessageTr
                      : panel.alerts.complianceMessageUk,
                    [{ text: panel.alerts.ok }]
                  );
                }
              }}
              style={[
                styles.menuCard,
                {
                  backgroundColor: (!isBusinessComplianceRequired || complianceComplete) ? colors.primary : '#E0E0E0',
                  opacity: (!isBusinessComplianceRequired || complianceComplete) ? 1 : 0.6
                }
              ]}
              activeOpacity={complianceComplete ? 0.7 : 0.3}
            >
              <View style={styles.menuCardContent}>
                <Text style={[
                  styles.menuCardIcon,
                  { opacity: complianceComplete ? 1 : 0.5 }
                ]}>
                  {complianceComplete ? item.icon : '🔒'}
                </Text>
                <View style={styles.menuCardTextContainer}>
                  <Text 
                    variant="subheading" 
                    weight="semibold"
                    style={[
                      styles.menuCardTitle,
                      { color: complianceComplete ? 'white' : '#999999' }
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    variant="caption"
                    style={[
                      styles.menuCardDescription,
                      { color: (!isBusinessComplianceRequired || complianceComplete) ? 'rgba(255,255,255,0.8)' : '#CCCCCC' }
                    ]}
                  >
                    {(!isBusinessComplianceRequired || complianceComplete)
                      ? item.description 
                      : panel.menuLocked
                    }
                  </Text>
                </View>
                <Text style={[
                  styles.menuCardArrow,
                  { color: (!isBusinessComplianceRequired || complianceComplete) ? 'white' : '#999999' }
                ]}>
                  {(!isBusinessComplianceRequired || complianceComplete) ? '→' : '🔒'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          </View>
        </TouchableWithoutFeedback>

        {/* Sign Out Button */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (complianceExpanded) {
              setComplianceExpanded(false);
            }
          }}
        >
          <View>
            <TouchableOpacity
              onPress={handleSignOut}
              style={[styles.signOutButton, { backgroundColor: colors.error }]}
              activeOpacity={0.7}
            >
              <Text variant="body" weight="semibold" style={{ color: 'white' }}>
                {panel.signOut}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback
          onPress={() => {
            if (complianceExpanded) {
              setComplianceExpanded(false);
            }
          }}
        >
          <View style={styles.bottomSpace} />
        </TouchableWithoutFeedback>
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
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  statsTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
    minWidth: 0,
    maxWidth: '24%', // 4 kutu için eşit dağılım
  },
  compactCard: {
    minHeight: 60, // Daha düşük yükseklik
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    marginHorizontal: Spacing.md,
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeToggleButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  themeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  menuSectionsContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  menuCard: {
    borderRadius: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.xs,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuCardIcon: {
    fontSize: 32,
    marginRight: Spacing.lg,
    width: 40,
    color: 'white',
  },
  menuCardTextContainer: {
    flex: 1,
  },
  menuCardTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: Spacing.xs,
  },
  menuCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuCardArrow: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  headerProfileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  signOutButton: {
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
  complianceWrapper: {
    margin: Spacing.md,
    marginBottom: Spacing.lg,
  },
  complianceCard: {
    borderWidth: 2,
    borderColor: '#28A745',
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
  },
  complianceExpandedCard: {
    marginTop: 2,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  complianceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  complianceTitle: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
  },
  complianceItems: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  complianceItem: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 2,
  },
  complianceItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  editLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  complianceLabel: {
    marginBottom: 2,
  },
  complianceButton: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(127, 175, 154, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  complianceButtonText: {
    fontWeight: '500',
  },
});
