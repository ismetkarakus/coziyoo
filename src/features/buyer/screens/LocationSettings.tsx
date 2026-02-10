import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { WebSafeIcon } from '../../../components/ui';
import { useTranslation } from '../../../hooks/useTranslation';

export const LocationSettings: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    locationEnabled: true,
    autoDetect: false,
    showDistance: true,
    nearbyNotifications: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem('locationSettings');
      if (data) {
        setSettings(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem('locationSettings', JSON.stringify(newSettings));
  };

  const settingsItems = [
    {
      key: 'locationEnabled',
      title: t('locationSettingsScreen.items.locationEnabled.title'),
      description: t('locationSettingsScreen.items.locationEnabled.desc'),
      icon: '📍',
    },
    {
      key: 'autoDetect',
      title: t('locationSettingsScreen.items.autoDetect.title'),
      description: t('locationSettingsScreen.items.autoDetect.desc'),
      icon: '🎯',
    },
    {
      key: 'showDistance',
      title: t('locationSettingsScreen.items.showDistance.title'),
      description: t('locationSettingsScreen.items.showDistance.desc'),
      icon: '📏',
    },
    {
      key: 'nearbyNotifications',
      title: t('locationSettingsScreen.items.nearbyNotifications.title'),
      description: t('locationSettingsScreen.items.nearbyNotifications.desc'),
      icon: '🔔',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('locationSettingsScreen.title')}
        leftComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <WebSafeIcon name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.settingsCard}>
          {settingsItems.map((item, index) => (
            <View key={item.key}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <View style={styles.settingText}>
                    <Text variant="body" weight="medium">
                      {item.title}
                    </Text>
                    <Text variant="caption" color="textSecondary" style={styles.settingDescription}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings[item.key as keyof typeof settings]}
                  onValueChange={(value) => updateSetting(item.key, value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={settings[item.key as keyof typeof settings] ? 'white' : colors.textSecondary}
                />
              </View>
              {index < settingsItems.length - 1 && (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoText}>
              <Text variant="body" weight="medium" style={styles.infoTitle}>
                {t('locationSettingsScreen.privacy.title')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('locationSettingsScreen.privacy.desc')}
              </Text>
            </View>
          </View>
        </Card>
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
  settingsCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingDescription: {
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  infoCard: {
    padding: Spacing.md,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: Spacing.xs,
  },
});









