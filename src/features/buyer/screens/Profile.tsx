import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { TopBar } from '../../../components/layout';
import { Text } from '../../../components/ui';
import { WebSafeIcon } from '../../../components/ui/WebSafeIcon';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

interface RowItem {
  id: string;
  title: string;
  icon: string;
  value?: string;
}

const getDefaultUserData = (language: 'tr' | 'en') => ({
  name: language === 'en' ? 'Ahmet Yilmaz' : 'Ahmet Yilmaz',
  email: 'ahmet@example.com',
  location: language === 'en' ? 'Kadikoy, Istanbul' : 'Kadikoy, Istanbul',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&h=180&fit=crop&crop=face',
});

export const Profile: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { signOut } = useAuth();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const defaultUserData = getDefaultUserData(currentLanguage);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem('buyerProfile');
        if (savedProfile) {
          const profileData = JSON.parse(savedProfile);
          setAvatarUri(profileData.avatarUri || null);
          return;
        }

        const personalInfo = await AsyncStorage.getItem('personalInfo');
        if (personalInfo) {
          const personalData = JSON.parse(personalInfo);
          setAvatarUri(personalData.avatar || null);
        }
      } catch (error) {
        console.error('Error loading buyer profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'personal-info':
        router.push('/personal-info');
        break;
      case 'change-password':
        router.push('/change-password');
        break;
      case 'addresses':
        router.push('/addresses');
        break;
      case 'location-settings':
        router.push('/location-settings');
        break;
      case 'wallet':
        router.push('/(buyer)/payment');
        break;
      case 'order-history':
      case 'orders':
        router.push('/order-history');
        break;
      case 'favorites':
        router.push('/favorites');
        break;
      case 'messages':
        router.push('/(buyer)/chat-list');
        break;
      case 'support':
      case 'contact':
        router.push('/contact');
        break;
      case 'help':
        router.push('/help-center');
        break;
      case 'notifications':
        router.push('/notification-settings');
        break;
      case 'language':
        Alert.alert(
          currentLanguage === 'tr' ? 'Dil ayari' : 'Language setting',
          currentLanguage === 'tr'
            ? 'Dil degistirme icin ana ekrandaki dil seciciyi kullanabilirsiniz.'
            : 'Use the language switcher from the main flow to change language.'
        );
        break;
      default:
        Alert.alert(
          t('profileScreen.alerts.comingSoonTitle'),
          t('profileScreen.alerts.comingSoonMessage')
        );
    }
  };

  const handleSignOut = () => {
    const runSignOut = async () => {
      try {
        await signOut();
        router.replace('/(auth)/sign-in');
      } catch (error) {
        console.error('Sign out error:', error);
        Alert.alert(
          t('profileScreen.alerts.signOutErrorTitle'),
          t('profileScreen.alerts.signOutErrorMessage')
        );
      }
    };

    if (Platform.OS === 'web') {
      runSignOut();
      return;
    }

    Alert.alert(
      t('profileScreen.alerts.signOutTitle'),
      t('profileScreen.alerts.signOutMessage'),
      [
        { text: t('profileScreen.alerts.signOutCancel'), style: 'cancel' },
        {
          text: t('profileScreen.alerts.signOutConfirm'),
          style: 'destructive',
          onPress: runSignOut,
        },
      ]
    );
  };

  const quickActions: QuickActionItem[] = useMemo(
    () => [
      {
        id: 'orders',
        title: currentLanguage === 'tr' ? 'Siparislerim' : 'My Orders',
        subtitle:
          currentLanguage === 'tr' ? 'Son siparislerini goruntule' : 'View your latest orders',
        icon: 'event-available',
      },
      {
        id: 'addresses',
        title: t('profileScreen.items.addresses'),
        subtitle:
          currentLanguage === 'tr'
            ? 'Ev, is ve konum ayarlari'
            : 'Home, work and location settings',
        icon: 'location-on',
      },
      {
        id: 'wallet',
        title: currentLanguage === 'tr' ? 'Kartlarim' : 'My Cards',
        subtitle: currentLanguage === 'tr' ? 'Kart ekle ve yonet' : 'Add and manage cards',
        icon: 'credit-card',
      },
      {
        id: 'help',
        title: currentLanguage === 'tr' ? 'Destek' : 'Support',
        subtitle: currentLanguage === 'tr' ? 'Yardim merkezi' : 'Help center',
        icon: 'phone',
      },
    ],
    [currentLanguage, t]
  );

  const accountRows: RowItem[] = useMemo(
    () => [
      {
        id: 'change-password',
        title: t('profileScreen.items.changePassword'),
        icon: 'lock',
      },
      {
        id: 'language',
        title: currentLanguage === 'tr' ? 'Dil' : 'Language',
        icon: 'translate',
        value: currentLanguage === 'tr' ? 'Turkce' : 'English',
      },
    ],
    [currentLanguage, t]
  );

  const shoppingRows: RowItem[] = useMemo(
    () => [
      {
        id: 'favorites',
        title: t('profileScreen.items.favorites'),
        icon: 'heart',
      },
      {
        id: 'messages',
        title: t('profileScreen.items.messages'),
        icon: 'chat',
        value: currentLanguage === 'tr' ? '3 yeni' : '3 new',
      },
    ],
    [currentLanguage, t]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <TopBar title={t('profileScreen.title')} titleStyle={{ fontSize: 28, color: colors.text }} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={styles.profileRow}>
            <Image
              source={avatarUri ? { uri: avatarUri } : { uri: defaultUserData.avatar }}
              style={[styles.avatarImage, { borderColor: colors.primary }]}
            />

            <View style={styles.profileInfo}>
              <Text variant="subheading" weight="bold" style={styles.profileName}>
                {defaultUserData.name}
              </Text>
              <Text variant="body" color="textSecondary" style={styles.profileSubtext}>
                {defaultUserData.location}
              </Text>
              <View style={styles.locationRow}>
                <WebSafeIcon name="location-on" size={17} color={colors.textSecondary} />
                <Text variant="caption" color="textSecondary">
                  {defaultUserData.location}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.surface }]}
              onPress={() => handleItemPress('personal-info')}
              activeOpacity={0.75}
            >
              <Text variant="body" weight="semibold" color="textSecondary">
                {currentLanguage === 'tr' ? 'Duzenle' : 'Edit'}
              </Text>
              <WebSafeIcon name="edit" size={18} color={colors.textSecondary} style={styles.editIcon} />
            </TouchableOpacity>
          </View>

          <View style={[styles.quickGrid, { borderTopColor: colors.border }]}>
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.75}
                onPress={() => handleItemPress(item.id)}
              >
                <View style={styles.quickTitleRow}>
                  <WebSafeIcon name={item.icon} size={20} color={colors.primary} />
                  <Text variant="body" weight="semibold" style={styles.quickTitle}>
                    {item.title}
                  </Text>
                </View>
                <Text variant="caption" color="textSecondary">
                  {item.subtitle}
                </Text>
                <WebSafeIcon
                  name="chevron-right"
                  size={18}
                  color={colors.textSecondary}
                  style={styles.quickArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SectionTitle label={currentLanguage === 'tr' ? 'Hesap' : 'Account'} color={colors.text} />
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {accountRows.map((item, index) => (
            <SectionRow
              key={item.id}
              item={item}
              isLast={index === accountRows.length - 1}
              colors={colors}
              onPress={handleItemPress}
            />
          ))}
        </View>

        <SectionTitle label={currentLanguage === 'tr' ? 'Alisveris' : 'Shopping'} color={colors.text} />
        <View style={styles.dualGrid}>
          {shoppingRows.map((item) => (
            <SquareActionCard key={item.id} item={item} colors={colors} onPress={handleItemPress} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.75}
          onPress={handleSignOut}
        >
          <WebSafeIcon name="logout" size={21} color={colors.text} />
          <Text variant="body" weight="bold" style={styles.signOutLabel}>
            {t('profileScreen.alerts.signOutConfirm')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const SectionTitle: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <Text variant="subheading" weight="bold" style={{ color, marginBottom: Spacing.sm }}>
    {label}
  </Text>
);

const SectionRow: React.FC<{
  item: RowItem;
  isLast: boolean;
  colors: typeof Colors.light;
  onPress: (id: string) => void;
}> = ({ item, isLast, colors, onPress }) => (
  <TouchableOpacity
    style={[styles.rowItem, !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
    activeOpacity={0.75}
    onPress={() => onPress(item.id)}
  >
    <View style={styles.rowLeft}>
      <WebSafeIcon name={item.icon} size={20} color={colors.primary} />
      <Text variant="body" weight="semibold" style={styles.rowTitle}>
        {item.title}
      </Text>
    </View>

    <View style={styles.rowRight}>
      {item.value ? (
        <Text variant="body" color="textSecondary" style={styles.rowValue}>
          {item.value}
        </Text>
      ) : null}
      <WebSafeIcon name="chevron-right" size={20} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const SquareActionCard: React.FC<{
  item: RowItem;
  colors: typeof Colors.light;
  onPress: (id: string) => void;
}> = ({ item, colors, onPress }) => (
  <TouchableOpacity
    style={[styles.squareCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    activeOpacity={0.75}
    onPress={() => onPress(item.id)}
  >
    <View style={styles.squareLeft}>
      <WebSafeIcon name={item.icon} size={20} color={colors.primary} />
      <Text variant="body" weight="semibold" style={styles.squareTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </View>

    <View style={styles.squareRight}>
      {item.value ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}> 
          <Text variant="caption" weight="semibold" style={styles.badgeText}>
            {item.value}
          </Text>
        </View>
      ) : null}
      <WebSafeIcon name="chevron-right" size={18} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    marginBottom: 2,
  },
  profileSubtext: {
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  editIcon: {
    marginLeft: 4,
  },
  quickGrid: {
    borderTopWidth: 1,
    borderTopColor: '#E7E3DD',
    padding: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  quickCard: {
    width: '48.4%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    position: 'relative',
  },
  quickTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  quickTitle: {
    flex: 1,
  },
  quickArrow: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowTitle: {
    marginLeft: 10,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    maxWidth: 130,
  },
  dualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  squareCard: {
    width: '48.4%',
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  squareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  squareTitle: {
    marginLeft: 8,
    flexShrink: 1,
  },
  squareRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  signOutButton: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  signOutLabel: {
    marginLeft: 8,
  },
});
