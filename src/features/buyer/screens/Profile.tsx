import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

const PROFILE_SECTIONS = [
  {
    id: 'account',
    title: 'Hesap Bilgileri',
    items: [
      { id: 'personal-info', title: 'Kişisel Bilgiler', icon: '👤' },
      { id: 'change-password', title: 'Şifre Değiştir', icon: '🔒' },
    ],
  },
  {
    id: 'location',
    title: 'Konum',
    items: [
      { id: 'addresses', title: 'Adreslerim', icon: '📍' },
      { id: 'location-settings', title: 'Konum Ayarları', icon: '🗺️' },
    ],
  },
  {
    id: 'wallet',
    title: 'Cüzdan & Ödemeler',
    items: [
      { id: 'wallet', title: 'Cüzdanım', icon: '💰' },
    ],
  },
  {
    id: 'orders',
    title: 'Siparişler',
    items: [
      { id: 'order-history', title: 'Sipariş Geçmişi', icon: '📋' },
      { id: 'favorites', title: 'Favorilerim', icon: '❤️' },
    ],
  },
  {
    id: 'communication',
    title: 'İletişim',
    items: [
      { id: 'messages', title: 'Mesajlarım', icon: '💬' },
      { id: 'notifications', title: 'Bildirim Ayarları', icon: '🔔' },
    ],
  },
  {
    id: 'support',
    title: 'Yardım & Destek',
    items: [
      { id: 'help', title: 'Yardım Merkezi', icon: '❓' },
      { id: 'contact', title: 'İletişim', icon: '📞' },
      { id: 'about', title: 'Hakkında', icon: 'ℹ️' },
    ],
  },
];

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
        Alert.alert('Yakında', 'Bu özellik yakında gelecek.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
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
          Profil
        </Text>
      } />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <Card variant="default" padding="md" style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: USER_DATA.avatar }}
                style={styles.avatarImage}
                defaultSource={{ uri: 'https://via.placeholder.com/150x150/7FAF9A/FFFFFF?text=A' }}
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
        {PROFILE_SECTIONS.map((section) => (
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

