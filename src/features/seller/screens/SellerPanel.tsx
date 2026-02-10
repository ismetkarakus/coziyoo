import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TouchableWithoutFeedback } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useCountry } from '../../../context/CountryContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemePreference } from '../../../context/ThemeContext';
import { WebSafeIcon } from '../../../components/ui/WebSafeIcon';
import { JsonRenderer } from '../../../components/json/JsonRenderer';
import sellerMock from '../../../mock/seller.json';
import { ManageMeals } from './ManageMeals';

const layout = require('./sellerPanelLayout.json');

export const SellerPanel: React.FC = () => {
  const { preference, setPreference, colorScheme } = useThemePreference();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const localizedMock = (sellerMock as any)[currentLanguage] ?? sellerMock.tr;
  const [profileData, setProfileData] = useState(localizedMock.profile);
  const stats = localizedMock.stats;
  const sellerDisplayName =
    (profileData.nickname && profileData.nickname.trim()) || profileData.name;
  
  const [themeExpanded, setThemeExpanded] = useState(false);
  
  // Hook'ları önce çağır
  const { currentCountry, isBusinessComplianceRequired } = useCountry();
  const panel = localizedMock.panel;
  const menuItems = localizedMock.panel.menu.map((item: any) => ({
    ...item,
    isManageMeals: item.id === 'manage-meals',
  }));
  const visibleMenuItems =
    currentCountry.code === 'TR' ? menuItems.filter((item: any) => item.id !== 'manage-meals') : menuItems;
  
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
  const ratingValue = typeof profileData?.rating === 'number' ? profileData.rating : 4.8;
  const ratingStars = Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.floor(ratingValue);
    return {
      id: index,
      name: filled ? 'star' : 'star-o',
      color: filled ? colors.primary : colors.border,
    };
  });

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

  const isMenuEnabled = !isBusinessComplianceRequired || complianceComplete;
  const menuCardStyle = () => [
    styles.menuCard,
    {
      backgroundColor: isMenuEnabled ? colors.primary : '#E0E0E0',
      opacity: isMenuEnabled ? 1 : 0.6,
    },
  ];
  const menuCardIconStyle = () => [
    styles.menuCardIcon,
    { opacity: complianceComplete ? 1 : 0.5 },
  ];
  const menuCardTitleStyle = () => [
    styles.menuCardTitle,
    { color: complianceComplete ? 'white' : '#999999' },
  ];
  const menuCardDescriptionStyle = () => [
    styles.menuCardDescription,
    { color: isMenuEnabled ? 'rgba(255,255,255,0.8)' : '#CCCCCC' },
  ];
  const menuCardArrowStyle = () => [
    styles.menuCardArrow,
    { color: isMenuEnabled ? 'white' : '#999999' },
  ];
  const menuCardIconText = (item: any) => (complianceComplete ? item.icon : '🔒');
  const menuCardArrowText = () => (isMenuEnabled ? '→' : '🔒');
  const menuCardDescriptionText = (item: any) => (isMenuEnabled ? item.description : panel.menuLocked);
  const menuCardActiveOpacity = () => (complianceComplete ? 0.7 : 0.3);

  const themeOptionStyle = (mode: 'light' | 'dark' | 'system') => [
    styles.themeOptionButton,
    preference === mode ? { backgroundColor: colors.surface } : null,
  ].filter(Boolean);

  const handleMenuItemPress = (item: any) => {
    if (isMenuEnabled) {
      handleMenuPress(item.route);
      return;
    }

    Alert.alert(
      currentCountry.code === 'TR' 
        ? panel.alerts.complianceTitleTr
        : panel.alerts.complianceTitleUk,
      currentCountry.code === 'TR'
        ? panel.alerts.complianceMessageTr
        : panel.alerts.complianceMessageUk,
      [{ text: panel.alerts.ok }]
    );
  };

  const context = {
    styles,
    colors,
    panel,
    stats,
    profileData,
    sellerDisplayName,
    ratingStars,
    currentCountry,
    manageMealsSummary: panel.manageMealsSummary,
    themeExpanded,
    visibleMenuItems,
    showManageMeals: currentCountry.code === 'TR',
    hasVisibleMenuItems: visibleMenuItems.length > 0,
    manageMealsTitle: t('manageMealsScreen.title'),
    rootBackgroundStyle: { backgroundColor: colors.background },
    themeMiniButtonBorderStyle: { borderColor: colors.border },
    themeDropdownBackgroundStyle: { backgroundColor: colors.card },
    statsAvatarBorderStyle: { borderColor: colors.primary },
    defaultAvatarSource: { uri: 'https://via.placeholder.com/60x60/7FAF9A/FFFFFF?text=S' },
    menuCardStyle,
    menuCardIconStyle,
    menuCardTitleStyle,
    menuCardDescriptionStyle,
    menuCardArrowStyle,
    menuCardIconText,
    menuCardArrowText,
    menuCardDescriptionText,
    menuCardActiveOpacity,
    themeOptionStyle,
    handlers: {
      onBackPress: handleBackPress,
      openProfile: () => router.push('/(seller)/profile'),
      navigate: handleMenuPress,
      onMenuItemPress: handleMenuItemPress,
      toggleThemeExpanded: () => setThemeExpanded(prev => !prev),
      closeTheme: () => setThemeExpanded(false),
      setTheme: (mode: 'light' | 'dark' | 'system') => {
        setPreference(mode);
        setThemeExpanded(false);
      },
    },
  };

  const registry = {
    View,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    Text,
    Card,
    TopBar,
    WebSafeIcon,
    ManageMeals,
    FontAwesome,
  };

  return <JsonRenderer node={layout} context={context} registry={registry} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.sm,
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.xl * 2,
    paddingBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statsTitleColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsAvatarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    transform: [{ translateY: 2 }],
  },
  statsAvatar: {
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  themeMiniWrapper: {
    position: 'relative',
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
  },
  themeMiniWrapperTop: {
    position: 'relative',
    alignItems: 'flex-end',
    marginRight: Spacing.xs,
    marginTop: 18,
    transform: [{ translateX: -12 }],
  },
  statsTitle: {
    marginBottom: 0,
    textAlign: 'center',
    flex: 1,
    fontSize: 18,
    marginTop: 8,
    transform: [{ translateY: 18 }],
  },
  sellerLevelLabel: {
    marginTop: Spacing.md,
    textAlign: 'center',
    fontSize: 16,
    transform: [{ translateY: -4 }],
  },
  sellerLevelStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  themeMiniButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 0,
    transform: [{ translateY: -16 }],
  },
  themeDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: Spacing.xs,
    width: 88,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  themeBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  themeDropdownColumn: {
    gap: 2,
  },
  themeOptionButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.md,
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
  menuSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  menuSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuSummaryText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
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
  bottomSpace: {
    height: Spacing.xl,
  },
  manageMealsEmbed: {
    marginTop: Spacing.sm,
  },
  manageMealsHeader: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontSize: 20,
  },
});
