import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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

  const handleBackPress = () => {
    console.log('Back button pressed - navigating to home'); // Debug log
    router.push('/(tabs)/'); // Navigate to home/main screen
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Satıcı Paneli" 
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

        {/* Menu Sections - Separate Cards */}
        <View style={styles.menuSectionsContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleMenuPress(item.route)}
              style={[styles.menuCard, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <View style={styles.menuCardContent}>
                <Text style={styles.menuCardIcon}>
                  {item.icon}
                </Text>
                <View style={styles.menuCardTextContainer}>
                  <Text 
                    variant="subheading" 
                    weight="semibold"
                    style={styles.menuCardTitle}
                  >
                    {item.title}
                  </Text>
                  <Text 
                    variant="caption"
                    style={styles.menuCardDescription}
                  >
                    {item.description}
                  </Text>
                </View>
                <Text style={styles.menuCardArrow}>
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
});

