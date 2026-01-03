import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

const MENU_ITEMS = [
  {
    id: 'profile',
    title: 'Satıcı Profili',
    description: 'Profil bilgilerini düzenle',
    icon: '👤',
    route: '/(seller)/profile',
  },
  {
    id: 'add-meal',
    title: 'Yemek Ekle',
    description: 'Yeni yemek menüye ekle',
    icon: '🍽️',
    route: '/(seller)/add-meal',
  },
  {
    id: 'orders',
    title: 'Siparişler',
    description: 'Gelen siparişleri yönet',
    icon: '📋',
    route: '/(seller)/orders',
  },
  {
    id: 'messages',
    title: 'Mesajlar',
    description: 'Müşterilerle mesajlaş',
    icon: '💬',
    route: '/(seller)/messages',
  },
  {
    id: 'delivery',
    title: 'Teslimat Ayarları',
    description: 'Teslimat seçeneklerini ayarla',
    icon: '🚗',
    route: '/(seller)/delivery-settings',
  },
];

export const SellerPanel: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleMenuPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="" 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
        }
        rightComponent={
          <Text variant="heading" weight="bold" color="primary" style={{ fontSize: 24 }}>
            Satıcı Paneli
          </Text>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section - Moved to top */}
        <View style={styles.statsContainer}>
          <Text variant="subheading" weight="semibold" style={styles.statsTitle}>
            Bu Hafta
          </Text>
          
          <View style={styles.statsGrid}>
            <Card variant="default" padding="md" style={styles.statCard}>
              <Text variant="title" weight="bold" color="primary" center>
                12
              </Text>
              <Text variant="caption" center color="textSecondary">
                Sipariş
              </Text>
            </Card>
            
            <Card variant="default" padding="md" style={styles.statCard}>
              <Text variant="title" weight="bold" color="success" center>
                ₺480
              </Text>
              <Text variant="caption" center color="textSecondary">
                Kazanç
              </Text>
            </Card>
            
            <Card variant="default" padding="md" style={styles.statCard}>
              <Text variant="title" weight="bold" color="warning" center>
                4.8
              </Text>
              <Text variant="caption" center color="textSecondary">
                Puan
              </Text>
            </Card>
          </View>
        </View>

        {/* User Info Card - Like Profile */}
        <Card variant="default" padding="md" style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text variant="title" style={{ color: 'white' }}>
                A
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text variant="subheading" weight="semibold">
                Ayşe Hanım
              </Text>
              <Text variant="body" color="textSecondary">
                ayse@example.com
              </Text>
              <Text variant="caption" color="textSecondary">
                Satıcı • Kadıköy, İstanbul
              </Text>
            </View>
          </View>
        </Card>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleMenuPress(item.route)}
              style={[
                styles.menuItem,
                index !== MENU_ITEMS.length - 1 && styles.menuItemBorder,
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
        </View>
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
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  statsTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
  },
  userCard: {
    marginHorizontal: Spacing.md,
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
  menuContainer: {
    marginHorizontal: Spacing.md,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
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
});

