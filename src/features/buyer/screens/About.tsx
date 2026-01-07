import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';

export const About: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const appInfo = [
    { label: 'Versiyon', value: '1.0.0' },
    { label: 'Son Güncelleme', value: '7 Ocak 2026' },
    { label: 'Geliştirici', value: 'Cazi Team' },
    { label: 'Platform', value: 'iOS & Android' },
  ];

  const legalLinks = [
    {
      title: 'Kullanım Koşulları',
      onPress: () => Linking.openURL('https://cazi.com/terms'),
    },
    {
      title: 'Gizlilik Politikası',
      onPress: () => Linking.openURL('https://cazi.com/privacy'),
    },
    {
      title: 'Çerez Politikası',
      onPress: () => Linking.openURL('https://cazi.com/cookies'),
    },
    {
      title: 'KVKK Aydınlatma Metni',
      onPress: () => Linking.openURL('https://cazi.com/kvkk'),
    },
  ];

  const features = [
    {
      icon: '🍽️',
      title: 'Ev Yemekleri',
      description: 'Yerel aşçılardan taze ve lezzetli ev yemekleri',
    },
    {
      icon: '🚚',
      title: 'Hızlı Teslimat',
      description: 'Siparişiniz ortalama 30-45 dakikada kapınızda',
    },
    {
      icon: '💳',
      title: 'Güvenli Ödeme',
      description: 'Kredi kartı ve kapıda ödeme seçenekleri',
    },
    {
      icon: '⭐',
      title: 'Kalite Garantisi',
      description: 'Tüm aşçılarımız titizlikle seçilmiştir',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Hakkında"
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo & Description */}
        <Card style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.appLogo}>🍽️</Text>
            <Text variant="heading" weight="bold" style={styles.appName}>
              Cazi
            </Text>
            <Text variant="body" color="textSecondary" style={styles.appDescription}>
              Ev yemeklerinin lezzetini kapınıza getiren platform. 
              Yerel aşçılardan taze, sağlıklı ve lezzetli yemekleri 
              kolayca sipariş edin.
            </Text>
          </View>
        </Card>

        {/* Features */}
        <Card style={styles.featuresCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Özellikler
          </Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureText}>
                <Text variant="body" weight="medium" style={styles.featureTitle}>
                  {feature.title}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* App Information */}
        <Card style={styles.infoCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Uygulama Bilgileri
          </Text>
          
          {appInfo.map((info, index) => (
            <View key={index} style={styles.infoItem}>
              <Text variant="body" color="textSecondary">
                {info.label}
              </Text>
              <Text variant="body" weight="medium">
                {info.value}
              </Text>
            </View>
          ))}
        </Card>

        {/* Legal Links */}
        <Card style={styles.legalCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Yasal Belgeler
          </Text>
          
          {legalLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.legalItem}
              onPress={link.onPress}
            >
              <Text variant="body" color="primary">
                {link.title}
              </Text>
              <WebSafeIcon name="chevron-right" size={16} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Contact & Support */}
        <Card style={styles.supportCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            Destek & İletişim
          </Text>
          
          <TouchableOpacity
            style={styles.supportItem}
            onPress={() => router.push('/help-center')}
          >
            <Text style={styles.supportIcon}>❓</Text>
            <View style={styles.supportText}>
              <Text variant="body" weight="medium">
                Yardım Merkezi
              </Text>
              <Text variant="caption" color="textSecondary">
                Sık sorulan sorular ve destek
              </Text>
            </View>
            <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportItem}
            onPress={() => router.push('/contact')}
          >
            <Text style={styles.supportIcon}>📞</Text>
            <View style={styles.supportText}>
              <Text variant="body" weight="medium">
                İletişim
              </Text>
              <Text variant="caption" color="textSecondary">
                Bizimle iletişime geçin
              </Text>
            </View>
            <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text variant="caption" color="textSecondary" style={styles.copyrightText}>
            © 2026 Cazi. Tüm hakları saklıdır.
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.copyrightText}>
            Made with ❤️ in Turkey
          </Text>
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
    padding: Spacing.md,
  },
  heroCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
  },
  appLogo: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  appDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: 2,
  },
  infoCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  legalCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  supportCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  supportIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  supportText: {
    flex: 1,
  },
  copyright: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  copyrightText: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
});



