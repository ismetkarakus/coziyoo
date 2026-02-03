import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card, LanguageSwitcher } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';

const getProfileSections = (t: (key: string) => string) => ([
  {
    id: 'account',
    title: t('profileScreen.sections.account'),
    items: [
      { id: 'personal-info', title: t('profileScreen.items.personalInfo'), icon: '👤' },
      { id: 'change-password', title: t('profileScreen.items.changePassword'), icon: '🔒' },
    ],
  },
  {
    id: 'location',
    title: t('profileScreen.sections.location'),
    items: [
      { id: 'addresses', title: t('profileScreen.items.addresses'), icon: '📍' },
      { id: 'location-settings', title: t('profileScreen.items.locationSettings'), icon: '🗺️' },
    ],
  },
  {
    id: 'wallet',
    title: t('profileScreen.sections.wallet'),
    items: [
      { id: 'wallet', title: t('profileScreen.items.wallet'), icon: '💰' },
    ],
  },
  {
    id: 'orders',
    title: t('profileScreen.sections.orders'),
    items: [
      { id: 'order-history', title: t('profileScreen.items.orderHistory'), icon: '📋' },
      { id: 'favorites', title: t('profileScreen.items.favorites'), icon: '❤️' },
    ],
  },
  {
    id: 'communication',
    title: t('profileScreen.sections.communication'),
    items: [
      { id: 'messages', title: t('profileScreen.items.messages'), icon: '💬' },
      { id: 'notifications', title: t('profileScreen.items.notifications'), icon: '🔔' },
    ],
  },
  {
    id: 'support',
    title: t('profileScreen.sections.support'),
    items: [
      { id: 'help', title: t('profileScreen.items.help'), icon: '❓' },
      { id: 'contact', title: t('profileScreen.items.contact'), icon: '📞' },
      { id: 'about', title: t('profileScreen.items.about'), icon: 'ℹ️' },
    ],
  },
]);

// Mock user data
const USER_DATA = {
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com',
  location: 'Kadıköy, İstanbul',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
};

export const Profile: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const profileSections = getProfileSections(t);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Önce buyerProfile'dan yükle
      const savedProfile = await AsyncStorage.getItem('buyerProfile');
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setAvatarUri(profileData.avatarUri || null);
      } else {
        // Eğer buyerProfile yoksa personalInfo'dan yükle
        const personalInfo = await AsyncStorage.getItem('personalInfo');
        if (personalInfo) {
          const personalData = JSON.parse(personalInfo);
          setAvatarUri(personalData.avatar || null);
        }
      }
    } catch (error) {
      console.error('Error loading buyer profile data:', error);
    }
  };

  const saveProfileData = async () => {
    try {
      const profileData = {
        avatarUri,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('buyerProfile', JSON.stringify(profileData));
      console.log('Buyer profile data saved successfully');
    } catch (error) {
      console.error('Error saving buyer profile data:', error);
      throw error;
    }
  };


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
        router.push('/buyer-wallet');
        break;
      case 'order-history':
        router.push('/order-history');
        break;
      case 'favorites':
        router.push('/favorites');
        break;
      case 'messages':
        router.push('/(tabs)/chat-list');
        break;
      case 'notifications':
        router.push('/notification-settings');
        break;
      case 'help':
        router.push('/help-center');
        break;
      case 'contact':
        router.push('/contact');
        break;
      case 'about':
        router.push('/about');
        break;
      default:
        Alert.alert(
          t('profileScreen.alerts.comingSoonTitle'),
          t('profileScreen.alerts.comingSoonMessage')
        );
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('profileScreen.alerts.signOutTitle'),
      t('profileScreen.alerts.signOutMessage'),
      [
        { text: t('profileScreen.alerts.signOutCancel'), style: 'cancel' },
        {
          text: t('profileScreen.alerts.signOutConfirm'),
          style: 'destructive',
          onPress: () => {
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="" leftComponent={
        <Text variant="heading" weight="bold" color="primary" style={{ fontSize: 24 }}>
          {t('profileScreen.title')}
        </Text>
      } />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <Card variant="default" padding="md" style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                key={`${avatarUri || 'default'}-${forceUpdate}`}
                source={avatarUri ? { uri: avatarUri } : { uri: USER_DATA.avatar }}
                style={styles.avatarImage}
                defaultSource={{ uri: 'https://via.placeholder.com/150x150/7FAF9A/FFFFFF?text=A' }}
                onLoad={() => console.log('Buyer avatar loaded:', avatarUri)}
                onError={(error) => console.log('Buyer avatar error:', error)}
              />
            </View>
            <View style={styles.userDetails}>
              <Text variant="subheading" weight="semibold">
                {USER_DATA.name}
              </Text>
              <Text variant="body" color="textSecondary">
                {USER_DATA.email}
              </Text>
              <Text variant="caption" color="textSecondary">
                {USER_DATA.location}
              </Text>
            </View>
          </View>
        </Card>

        {/* Profile Sections */}
        {profileSections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {section.title}
            </Text>
            
            <Card variant="default" padding="xs" style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item.id)}
                  style={[
                    styles.menuItem,
                    index !== section.items.length - 1 && styles.menuItemBorder,
                    { borderBottomColor: colors.border }
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text variant="body" style={styles.menuTitle}>
                      {item.title}
                    </Text>
                    <Text variant="body" color="textSecondary">
                      →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Language */}
        <View style={styles.section}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t('profileScreen.sections.language')}
          </Text>
          <Card variant="default" padding="md" style={styles.sectionCard}>
            <LanguageSwitcher />
          </Card>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutButton, { backgroundColor: colors.error }]}
          activeOpacity={0.7}
        >
          <Text variant="body" weight="semibold" style={{ color: 'white' }}>
            Çıkış Yap
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
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
  userCard: {
    margin: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 70, // Slightly larger for better visibility
    height: 70,
    borderRadius: 35,
    marginRight: Spacing.md,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.light.primary, // Sage green border
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  userDetails: {
    flex: 1,
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
  menuItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    width: 24,
  },
  menuTitle: {
    flex: 1,
  },
  signOutButton: {
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
