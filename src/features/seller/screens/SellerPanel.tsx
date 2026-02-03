import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TouchableWithoutFeedback } from 'react-native';
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

const getMenuItems = (t: (key: string) => string) => ([
  {
    id: 'profile',
    title: t('sellerPanel.menu.profile.title'),
    description: t('sellerPanel.menu.profile.description'),
    icon: '👤',
    route: '/(seller)/profile',
  },
  {
    id: 'add-meal',
    title: t('sellerPanel.menu.addFood.title'),
    description: t('sellerPanel.menu.addFood.description'),
    icon: '🍽️',
    route: '/(seller)/add-meal',
  },
  {
    id: 'manage-meals',
    title: t('sellerPanel.menu.manageFoods.title'),
    description: t('sellerPanel.menu.manageFoods.description'),
    icon: '📝',
    route: '/(seller)/manage-meals',
  },
  {
    id: 'messages',
    title: t('sellerPanel.menu.messages.title'),
    description: t('sellerPanel.menu.messages.description'),
    icon: '💬',
    route: '/(seller)/messages',
  },
]);

// Default seller data
const DEFAULT_SELLER_DATA = {
  name: 'Ayşe Hanım',
  email: 'ayse@example.com',
  location: 'Kadıköy, İstanbul',
  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
};

export const SellerPanel: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [profileData, setProfileData] = useState(DEFAULT_SELLER_DATA);
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  
  // Hook'ları önce çağır
  const { currentCountry, isBusinessComplianceRequired } = useCountry();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  
  // Ülkeye göre menü öğeleri
  const menuItems = getMenuItems(t);

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
            name: profile.formData.nickname || profile.formData.name || DEFAULT_SELLER_DATA.name, // Nickname öncelikli
            email: profile.formData.email || DEFAULT_SELLER_DATA.email,
            location: profile.formData.location || DEFAULT_SELLER_DATA.location,
            avatar: profile.avatarUri || DEFAULT_SELLER_DATA.avatar,
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
    Alert.alert(
      t('sellerPanel.alerts.signOutTitle'),
      t('sellerPanel.alerts.signOutMessage'),
      [
        { text: t('profileScreen.alerts.signOutCancel'), style: 'cancel' },
        {
          text: t('profileScreen.alerts.signOutConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // AuthGuard will automatically redirect to sign-in
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert(t('error'), t('sellerPanel.alerts.signOutError'));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('seller.panel')} 
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
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
              {t('sellerPanel.stats.week')}
            </Text>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity onPress={() => handleMenuPress('/(seller)/orders')} style={styles.statCard}>
              <Card variant="default" padding="sm">
                <Text variant="title" weight="bold" color="primary" center>
                  12
                </Text>
                <Text variant="caption" center color="textSecondary">
                  {t('sellerPanel.stats.orders')}
                </Text>
              </Card>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleMenuPress('/(seller)/wallet')} style={styles.statCard}>
              <Card variant="default" padding="sm">
                <Text variant="title" weight="bold" color="success" center>
                  ₺425
                </Text>
                <Text variant="caption" center color="textSecondary">
                  {t('sellerPanel.stats.wallet')}
                </Text>
              </Card>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleMenuPress('/(seller)/messages')} style={styles.statCard}>
              <Card variant="default" padding="sm">
                <Text variant="title" weight="bold" color="info" center>
                  3
                </Text>
                <Text variant="caption" center color="textSecondary">
                  {t('sellerPanel.stats.messages')}
                </Text>
              </Card>
            </TouchableOpacity>
            
            <Card variant="default" padding="sm" style={styles.statCard}>
              <Text variant="title" weight="bold" color="warning" center>
                4.8
              </Text>
              <Text variant="caption" center color="textSecondary">
                {t('sellerPanel.stats.rating')}
              </Text>
            </Card>
          </View>
          </View>
        </TouchableWithoutFeedback>

        {/* User Info Card - Like Profile */}
        <Card variant="default" padding="md" style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profileData.avatar }}
                style={styles.avatarImage}
                defaultSource={{ uri: 'https://via.placeholder.com/60x60/7FAF9A/FFFFFF?text=S' }}
              />
            </View>
            <View style={styles.userDetails}>
              <Text variant="subheading" weight="semibold">
                {profileData.name}
              </Text>
              <Text variant="body" color="textSecondary">
                {profileData.email}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('sellerPanel.user.role')} • {profileData.location}
              </Text>
            </View>
          </View>
        </Card>

        {/* Business Compliance Status Card - Her Ülke İçin Göster */}
        {(
          <View style={styles.complianceWrapper}>
            <TouchableOpacity
              onPress={() => setComplianceExpanded(!complianceExpanded)}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="md" style={styles.complianceCard}>
                <View style={styles.complianceHeader}>
                  <Text variant="subheading" weight="semibold" style={styles.complianceTitle}>
                    {currentCountry.code === 'TR' 
                      ? t('sellerPanel.compliance.tr.title')
                      : t('sellerPanel.compliance.uk.title')
                    }
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
                      ? (complianceComplete ? t('sellerPanel.compliance.tr.statusComplete') : t('sellerPanel.compliance.tr.statusOptional'))
                      : (complianceComplete ? t('sellerPanel.compliance.uk.statusComplete') : t('sellerPanel.compliance.uk.statusOptional'))
                    }
                  </Text>
                  <Text variant="body" style={styles.expandIcon}>
                    {complianceExpanded ? '▼' : '▶'}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
          
          {complianceExpanded && (
            <Card variant="default" padding="md" style={[styles.complianceCard, styles.complianceExpandedCard]}>
              <View style={styles.complianceItems}>
            <TouchableOpacity 
              style={styles.complianceItem}
              onPress={(e) => {
                e?.stopPropagation?.();
                if (currentCountry.code === 'TR') {
                  router.push('/gida-isletme-belgesi');
                } else {
                  router.push('/council-registration');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.complianceItemContent}>
                <Text variant="body" style={styles.complianceLabel}>
                  {currentCountry.code === 'TR' 
                    ? t('sellerPanel.compliance.tr.license')
                    : t('sellerPanel.compliance.uk.license')
                  }
                </Text>
                <Text variant="caption" color="primary" style={styles.editLink}>
                  {t('sellerPanel.compliance.edit')}
                </Text>
              </View>
              <Text variant="caption" color="textSecondary">
                {currentCountry.code === 'TR' 
                  ? t('sellerPanel.compliance.tr.licenseSub')
                  : t('sellerPanel.compliance.uk.licenseSub')
                }
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.complianceItem}
              onPress={(e) => {
                e?.stopPropagation?.();
                if (currentCountry.code === 'TR') {
                  router.push('/vergi-levhasi');
                } else {
                  router.push('/hygiene-certificate');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.complianceItemContent}>
                <Text variant="body" style={styles.complianceLabel}>
                  {currentCountry.code === 'TR' 
                    ? t('sellerPanel.compliance.tr.tax')
                    : t('sellerPanel.compliance.uk.tax')
                  }
                </Text>
                <Text variant="caption" color="primary" style={styles.editLink}>
                  {t('sellerPanel.compliance.edit')}
                </Text>
              </View>
              <Text variant="caption" color="textSecondary">
                {currentCountry.code === 'TR' 
                  ? t('sellerPanel.compliance.tr.taxSub')
                  : t('sellerPanel.compliance.uk.taxSub')
                }
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.complianceItem}
              onPress={(e) => {
                e?.stopPropagation?.();
                if (currentCountry.code === 'TR') {
                  router.push('/kvkk-uyumluluk');
                } else {
                  router.push('/hygiene-rating');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.complianceItemContent}>
                <Text variant="body" style={styles.complianceLabel}>
                  {currentCountry.code === 'TR' 
                    ? t('sellerPanel.compliance.tr.training')
                    : t('sellerPanel.compliance.uk.training')
                  }
                </Text>
                <Text variant="caption" color="primary" style={styles.editLink}>
                  {t('sellerPanel.compliance.edit')}
                </Text>
              </View>
              <Text variant="caption" color="textSecondary">
                {currentCountry.code === 'TR' 
                  ? t('sellerPanel.compliance.tr.trainingSub')
                  : t('sellerPanel.compliance.uk.trainingSub')
                }
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.complianceItem}
              onPress={(e) => {
                e?.stopPropagation?.();
                if (currentCountry.code === 'TR') {
                  router.push('/gida-guvenligi-egitimi');
                } else {
                  router.push('/allergen-declaration');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.complianceItemContent}>
                <Text variant="body" style={styles.complianceLabel}>
                  {currentCountry.code === 'TR' 
                    ? t('sellerPanel.compliance.tr.kvkk')
                    : t('sellerPanel.compliance.uk.kvkk')
                  }
                </Text>
                <Text variant="caption" color="primary" style={styles.editLink}>
                  {t('sellerPanel.compliance.edit')}
                </Text>
              </View>
              <Text variant="caption" color="textSecondary">
                {currentCountry.code === 'TR' 
                  ? t('sellerPanel.compliance.tr.kvkkSub')
                  : t('sellerPanel.compliance.uk.kvkkSub')
                }
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.complianceItem}
              onPress={(e) => {
                e?.stopPropagation?.();
                if (currentCountry.code === 'TR') {
                  router.push('/is-yeri-sigortasi');
                } else {
                  router.push('/insurance-details');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.complianceItemContent}>
                <Text variant="body" style={styles.complianceLabel}>
                  {currentCountry.code === 'TR' 
                    ? t('sellerPanel.compliance.tr.insurance')
                    : t('sellerPanel.compliance.uk.insurance')
                  }
                </Text>
                <Text variant="caption" color="primary" style={styles.editLink}>
                  {t('sellerPanel.compliance.edit')}
                </Text>
              </View>
              <Text variant="caption" color="textSecondary">
                {currentCountry.code === 'TR' 
                  ? t('sellerPanel.compliance.tr.insuranceSub')
                  : t('sellerPanel.compliance.uk.insuranceSub')
                }
              </Text>
            </TouchableOpacity>
              
                <TouchableOpacity 
                  style={styles.complianceButton}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    router.push('/terms-and-conditions');
                  }}
                >
                  <Text variant="body" color="primary" style={styles.complianceButtonText}>
                    {currentCountry.code === 'TR' 
                      ? t('sellerPanel.compliance.tr.terms')
                      : t('sellerPanel.compliance.uk.terms')
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
                      ? t('sellerPanel.alerts.complianceTitleTr')
                      : t('sellerPanel.alerts.complianceTitleUk'),
                    currentCountry.code === 'TR'
                      ? t('sellerPanel.alerts.complianceMessageTr')
                      : t('sellerPanel.alerts.complianceMessageUk'),
                    [{ text: t('sellerPanel.alerts.ok') }]
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
                      : t('sellerPanel.menu.complianceLocked')
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
                {t('sellerPanel.signOutButton')}
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
  userCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  userDetails: {
    flex: 1,
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
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#2D5A4A',
    fontWeight: 'bold',
  },
  complianceTitle: {
    flex: 1,
    color: '#2D5A4A',
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
