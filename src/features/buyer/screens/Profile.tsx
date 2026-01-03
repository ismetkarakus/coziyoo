import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

export const Profile: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleItemPress = (itemId: string) => {
    switch (itemId) {
      case 'messages':
        router.push('/(tabs)/chat-list');
        break;
      case 'order-history':
        router.push('/(tabs)/notifications');
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
            router.replace('/(auth)/sign-in');
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
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text variant="title" style={{ color: 'white' }}>
                A
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text variant="subheading" weight="semibold">
                Ahmet Yılmaz
              </Text>
              <Text variant="body" color="textSecondary">
                ahmet@example.com
              </Text>
              <Text variant="caption" color="textSecondary">
                Kadıköy, İstanbul
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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

