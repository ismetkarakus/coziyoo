import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card, LanguageSwitcher } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';

const getProfileSections = (t: (key: string) => string) => ([
  {
    id: 'support',
    title: t('profileScreen.items.contact'),
    items: [
      { id: 'contact', title: t('profileScreen.items.contact'), icon: '📞' },
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
  const { signOut } = useAuth();
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
    const runSignOut = async () => {
      try {
        await signOut();
        router.replace('/sign-in');
      } catch (error) {
        console.error('Sign out error:', error);
        Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title={t('profileScreen.title')}
        titleStyle={{ fontSize: 24, color: colors.primary }}
      />
      
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

        {/* Quick Actions under profile */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => handleItemPress('personal-info')}
            activeOpacity={0.7}
          >
            <Text variant="body" weight="semibold" style={styles.quickActionText}>
              👤 {t('profileScreen.items.personalInfo')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => handleItemPress('change-password')}
            activeOpacity={0.7}
          >
            <Text variant="body" weight="semibold" style={styles.quickActionText}>
              🔒 {t('profileScreen.items.changePassword')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => handleItemPress('order-history')}
            activeOpacity={0.7}
          >
            <Text variant="body" weight="semibold" style={styles.quickActionText}>
              📋 {t('profileScreen.items.orderHistory')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => handleItemPress('favorites')}
            activeOpacity={0.7}
          >
            <Text variant="body" weight="semibold" style={styles.quickActionText}>
              ❤️ {t('profileScreen.items.favorites')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => handleItemPress('location-settings')}
            activeOpacity={0.7}
          >
            <Text variant="body" weight="semibold" style={styles.quickActionText}>
              🗺️ {t('profileScreen.items.locationSettings')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => handleItemPress('addresses')}
            activeOpacity={0.7}
          >
            <Text variant="body" weight="semibold" style={styles.quickActionText}>
              📍 {t('profileScreen.items.addresses')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Card (Language button style) */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <TouchableOpacity
            onPress={() => handleItemPress('contact')}
            style={[styles.contactButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text variant="body" weight="semibold">
              {t('profileScreen.items.contact')}
            </Text>
          </TouchableOpacity>
        </Card>

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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickActionItem: {
    flexBasis: '48%',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: 'white',
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
  contactButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
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
