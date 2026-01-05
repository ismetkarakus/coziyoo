import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    id: 'manage-meals',
    title: 'Yemeklerimi Yönet',
    description: 'Yemekleri düzenle, sil veya güncelle',
    icon: '📝',
    route: '/(seller)/manage-meals',
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
            
            <TouchableOpacity onPress={() => handleMenuPress('/(seller)/earnings')}>
              <Card variant="default" padding="md" style={styles.statCard}>
                <Text variant="title" weight="bold" color="success" center>
                  ₺285
                </Text>
                <Text variant="caption" center color="textSecondary">
                  Kazanç
                </Text>
              </Card>
            </TouchableOpacity>
            
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
                Satıcı • {profileData.location}
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
});

