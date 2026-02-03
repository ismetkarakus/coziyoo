import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';

export const About: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  const appInfo = [
    { label: t('aboutScreen.appInfo.version'), value: '1.0.0' },
    { label: t('aboutScreen.appInfo.lastUpdate'), value: '7 Ocak 2026' },
    { label: t('aboutScreen.appInfo.developer'), value: 'Cazi Team' },
    { label: t('aboutScreen.appInfo.platform'), value: 'iOS & Android' },
  ];

  const legalLinks = [
    {
      title: t('aboutScreen.legalLinks.terms'),
      onPress: () => Linking.openURL('https://cazi.com/terms'),
    },
    {
      title: t('aboutScreen.legalLinks.privacy'),
      onPress: () => Linking.openURL('https://cazi.com/privacy'),
    },
    {
      title: t('aboutScreen.legalLinks.cookies'),
      onPress: () => Linking.openURL('https://cazi.com/cookies'),
    },
    {
      title: t('aboutScreen.legalLinks.kvkk'),
      onPress: () => Linking.openURL('https://cazi.com/kvkk'),
    },
  ];

  const features = [
    {
      icon: '🍽️',
      title: t('aboutScreen.features.homeMealsTitle'),
      description: t('aboutScreen.features.homeMealsDesc'),
    },
    {
      icon: '🚚',
      title: t('aboutScreen.features.fastDeliveryTitle'),
      description: t('aboutScreen.features.fastDeliveryDesc'),
    },
    {
      icon: '💳',
      title: t('aboutScreen.features.securePaymentTitle'),
      description: t('aboutScreen.features.securePaymentDesc'),
    },
    {
      icon: '⭐',
      title: t('aboutScreen.features.qualityTitle'),
      description: t('aboutScreen.features.qualityDesc'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('aboutScreen.title')}
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
              {t('aboutScreen.heroDescription')}
            </Text>
          </View>
        </Card>

        {/* Features */}
        <Card style={styles.featuresCard}>
          <Text variant="subheading" weight="bold" style={styles.sectionTitle}>
            {t('aboutScreen.sections.features')}
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
            {t('aboutScreen.sections.appInfo')}
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
            {t('aboutScreen.sections.legal')}
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
            {t('aboutScreen.sections.support')}
          </Text>
          
          <TouchableOpacity
            style={styles.supportItem}
            onPress={() => router.push('/help-center')}
          >
            <Text style={styles.supportIcon}>❓</Text>
            <View style={styles.supportText}>
              <Text variant="body" weight="medium">
                {t('aboutScreen.support.helpTitle')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('aboutScreen.support.helpDesc')}
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
                {t('aboutScreen.support.contactTitle')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('aboutScreen.support.contactDesc')}
              </Text>
            </View>
            <WebSafeIcon name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text variant="caption" color="textSecondary" style={styles.copyrightText}>
            {t('aboutScreen.copyright.line1')}
          </Text>
          <Text variant="caption" color="textSecondary" style={styles.copyrightText}>
            {t('aboutScreen.copyright.line2')}
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









