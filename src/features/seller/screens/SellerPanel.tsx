import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TouchableWithoutFeedback, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useCountry } from '../../../context/CountryContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemePreference } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useWallet } from '../../../context/WalletContext';
import { WebSafeIcon } from '../../../components/ui/WebSafeIcon';
import { JsonRenderer } from '../../../components/json/JsonRenderer';
import sellerMock from '../../../constants/sellerMock';
import { ManageMeals } from './ManageMeals';
import { sellerPanelLayout } from './sellerPanelLayout';
import { foodService } from '../../../services/foodService';
import { chatService } from '../../../services/chatService';

interface SellerDashboardStats {
  orders: number;
  wallet: string;
  messages: number;
  rating: number;
}

export const SellerPanel: React.FC = () => {
  const { preference, setPreference, colorScheme } = useThemePreference();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { signOut, userData, user } = useAuth();
  const { wallet } = useWallet();
  const localizedMock = (sellerMock as any)[currentLanguage] ?? sellerMock.tr;
  const defaultStats: SellerDashboardStats = localizedMock.stats;
  const buildProfileData = () => ({
    ...localizedMock.profile,
    name: userData?.displayName || localizedMock.profile.name,
    nickname: userData?.sellerNickname || localizedMock.profile.nickname,
    email: userData?.email || localizedMock.profile.email,
    location: userData?.sellerLocation || localizedMock.profile.location,
    avatar: userData?.avatarUri || localizedMock.profile.avatar,
  });
  const [profileData, setProfileData] = useState({
    ...buildProfileData(),
  });
  const [stats, setStats] = useState<SellerDashboardStats>(defaultStats);
  const sellerDisplayName =
    (profileData.nickname && profileData.nickname.trim()) || profileData.name;
  
  const [themeExpanded, setThemeExpanded] = useState(false);
  
  // Hook'ları önce çağır
  const { currentCountry, isBusinessComplianceRequired, formatCurrency } = useCountry();
  const panel = localizedMock.panel;
  const menuItems = localizedMock.panel.menu.map((item: any) => ({
    ...item,
    isManageMeals: item.id === 'manage-meals',
  }));
  const showManageMeals = currentCountry.code === 'TR';
  const visibleMenuItems =
    showManageMeals ? menuItems.filter((item: any) => item.id !== 'manage-meals') : menuItems;
  const scrollStickyHeaderIndices = showManageMeals ? [0, 1] : [0];
  
  // Ülkeye göre menü öğeleri (JSON)

  // UK Compliance Status Check
  const isComplianceComplete = () => {
    const complianceStatus = {
      councilRegistered: !!userData?.complianceCouncilRegistered,
      hygieneCertificate: !!userData?.complianceHygieneCertificate,
      allergensDeclared: !!userData?.complianceAllergensDeclared,
      hygieneRating: !!userData?.complianceHygieneRating,
      insurance: !!userData?.complianceInsurance,
      termsAccepted: !!userData?.complianceTermsAccepted,
      approved: !!userData?.complianceApproved,
    };
    
    return Object.values(complianceStatus).every(Boolean);
  };

  const complianceComplete = isComplianceComplete();
  const numericStatRating = typeof stats.rating === 'number' ? stats.rating : Number(stats.rating);
  const ratingValue = Number.isFinite(numericStatRating) && numericStatRating > 0
    ? numericStatRating
    : (typeof profileData?.rating === 'number' ? profileData.rating : 4.8);
  const ratingStars = Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.floor(ratingValue);
    return {
      id: index,
      name: filled ? 'star' : 'star-outline',
      color: filled ? colors.warning : colors.border,
    };
  });

  // Load profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadDashboardStats = async () => {
        const sellerId = user?.uid || userData?.uid;
        if (!sellerId) {
          setStats({
            ...defaultStats,
            wallet: formatCurrency(wallet.availableEarnings),
          });
          return;
        }

        const [ordersResult, chatsResult, foodsResult] = await Promise.allSettled([
          foodService.getSellerOrders(String(sellerId)),
          chatService.getUserChats(String(sellerId), 'seller'),
          foodService.getFoodsBySeller(String(sellerId)),
        ]);

        const orders =
          ordersResult.status === 'fulfilled' && Array.isArray(ordersResult.value)
            ? ordersResult.value
            : [];
        const chats =
          chatsResult.status === 'fulfilled' && Array.isArray(chatsResult.value)
            ? chatsResult.value
            : [];
        const sellerFoods =
          foodsResult.status === 'fulfilled' && Array.isArray(foodsResult.value)
            ? foodsResult.value
            : [];

        const activeChatCount = chats.filter((chat: any) => chat?.isActive !== false).length;
        const weightedRatingBase = sellerFoods.reduce(
          (acc: { weightedTotal: number; reviewCount: number }, food: any) => {
            const reviewCount = Number(food?.reviewCount ?? 0);
            const rating = Number(food?.rating ?? 0);
            if (reviewCount <= 0 || !Number.isFinite(rating) || rating <= 0) return acc;
            return {
              weightedTotal: acc.weightedTotal + (rating * reviewCount),
              reviewCount: acc.reviewCount + reviewCount,
            };
          },
          { weightedTotal: 0, reviewCount: 0 }
        );

        const computedRating = weightedRatingBase.reviewCount > 0
          ? Number((weightedRatingBase.weightedTotal / weightedRatingBase.reviewCount).toFixed(1))
          : Number(defaultStats.rating);

        setStats({
          orders: orders.length,
          wallet: formatCurrency(wallet.availableEarnings),
          messages: activeChatCount,
          rating: Number.isFinite(computedRating) && computedRating > 0
            ? computedRating
            : Number(defaultStats.rating),
        });
      };

      setProfileData(buildProfileData());
      loadDashboardStats().catch((error) => {
        console.error('Failed to load seller dashboard stats:', error);
        setStats({
          ...defaultStats,
          wallet: formatCurrency(wallet.availableEarnings),
        });
      });
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }, [defaultStats, formatCurrency, localizedMock.profile, user?.uid, userData?.displayName, userData?.email, userData?.sellerLocation, userData?.sellerNickname, userData?.uid, userData?.avatarUri, wallet.availableEarnings])
  );

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  const handleBackPress = () => {
    console.log('Back button pressed - navigating to home'); // Debug log
    router.push('/(buyer)'); // Navigate to home/main screen
  };

  const handleSignOut = () => {
    const runSignOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error('Sign out error:', error);
        Alert.alert(t('sellerPanel.alerts.signOutTitle'), t('sellerPanel.alerts.signOutError'));
      }
    };

    if (Platform.OS === 'web') {
      runSignOut();
      return;
    }

    Alert.alert(
      t('sellerPanel.alerts.signOutTitle'),
      t('sellerPanel.alerts.signOutMessage'),
      [
        { text: t('sellerPanel.alerts.ok'), style: 'cancel' },
        {
          text: t('sellerPanel.alerts.ok'),
          style: 'destructive',
          onPress: runSignOut,
        },
      ]
    );
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
    showManageMeals,
    scrollStickyHeaderIndices,
    hasVisibleMenuItems: visibleMenuItems.length > 0,
    manageMealsTitle: t('manageMealsScreen.title'),
    rootBackgroundStyle: { backgroundColor: colors.background },
    themeMiniButtonBorderStyle: { borderColor: colors.border },
    themeDropdownBackgroundStyle: { backgroundColor: colors.card },
    statsAvatarBorderStyle: { borderColor: colors.primary },
    editProfileButtonBackgroundStyle: { backgroundColor: colors.primary },
    signOutButtonBackgroundStyle: { backgroundColor: colors.error },
    heroGradientColors: colorScheme === 'dark'
      ? ['#3F4A3E', colors.surface]
      : ['#DDE6DD', colors.surface],
    defaultAvatarSource: { uri: 'https://placehold.co/60x60/7FAF9A/FFFFFF?text=S' },
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
      signOut: handleSignOut,
      openProfile: () => router.push('/(seller)/seller-profile'),
      openOrders: () => router.push('/(seller)/orders'),
      openWallet: () => router.push('/(seller)/wallet'),
      openMessages: () => router.push('/(seller)/messages'),
      openRatings: () => router.push('/(seller)/ratings'),
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
    MaterialIcons,
    LinearGradient,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={t('sellerPanelText')} onBack={handleBackPress} />
      <JsonRenderer node={sellerPanelLayout as any} context={context} registry={registry} />
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: Spacing.sm,
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: Spacing.sm,
    paddingTop: 0,
    paddingBottom: Spacing.md,
    marginTop: 0,
  },
  heroHeader: {
    position: 'relative',
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xs,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroAvatarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  heroStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  heroRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  editProfileButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
  },
  editProfileButtonText: {
    color: '#FFFFFF',
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
    marginTop: Spacing.xs,
    transform: [{ translateY: 0 }],
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
    marginTop: 0,
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
  signOutContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  signOutButton: {
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
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
