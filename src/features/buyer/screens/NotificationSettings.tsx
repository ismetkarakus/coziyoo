import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useNotifications } from '../../../context/NotificationContext';
import { useTranslation } from '../../../hooks/useTranslation';

interface NotificationPreferences {
  orderUpdates: boolean;
  newMessages: boolean;
  lowStock: boolean;
  promotions: boolean;
  sound: boolean;
  vibration: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  newMessages: true,
  lowStock: true,
  promotions: false,
  sound: true,
  vibration: true,
};

export const NotificationSettings: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isInitialized, expoPushToken, fcmToken } = useNotifications();
  const { t } = useTranslation();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Alert.alert(
        t('notificationSettingsScreen.alerts.saveErrorTitle'),
        t('notificationSettingsScreen.alerts.saveErrorMessage')
      );
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPreferences);
  };

  const handleTestNotification = async () => {
    if (!isInitialized) {
      Alert.alert(
        t('notificationSettingsScreen.alerts.serviceTitle'),
        t('notificationSettingsScreen.alerts.serviceNotReady')
      );
      return;
    }

    Alert.alert(
      t('notificationSettingsScreen.test.alertTitle'),
      t('notificationSettingsScreen.test.alertMessage'),
      [{ text: t('notificationSettingsScreen.alerts.ok') }]
    );

    // Send a test notification
    // This would typically be done through your backend
    console.log('Test notification sent');
  };

  const copyToken = (token: string | null, type: string) => {
    if (!token) {
      Alert.alert(
        t('notificationSettingsScreen.alerts.tokenMissingTitle'),
        t('notificationSettingsScreen.alerts.tokenMissingMessage', { type })
      );
      return;
    }
    
    // In a real app, you would copy to clipboard
    Alert.alert(
      t('notificationSettingsScreen.alerts.tokenTitle', { type }),
      t('notificationSettingsScreen.alerts.tokenValue', { value: token.substring(0, 50) }),
      [{ text: t('notificationSettingsScreen.alerts.ok') }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar 
          title={t('notificationSettingsScreen.title')}
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textSecondary">
            {t('notificationSettingsScreen.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('notificationSettingsScreen.title')}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Types */}
        <Card style={styles.section}>
          <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
            {t('notificationSettingsScreen.sections.types')}
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                {t('notificationSettingsScreen.types.orderUpdates')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('notificationSettingsScreen.types.orderUpdatesDesc')}
              </Text>
            </View>
            <Switch
              value={preferences.orderUpdates}
              onValueChange={() => handleToggle('orderUpdates')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                {t('notificationSettingsScreen.types.newMessages')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('notificationSettingsScreen.types.newMessagesDesc')}
              </Text>
            </View>
            <Switch
              value={preferences.newMessages}
              onValueChange={() => handleToggle('newMessages')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                {t('notificationSettingsScreen.types.lowStock')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('notificationSettingsScreen.types.lowStockDesc')}
              </Text>
            </View>
            <Switch
              value={preferences.lowStock}
              onValueChange={() => handleToggle('lowStock')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                {t('notificationSettingsScreen.types.promotions')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('notificationSettingsScreen.types.promotionsDesc')}
              </Text>
            </View>
            <Switch
              value={preferences.promotions}
              onValueChange={() => handleToggle('promotions')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </Card>

        {/* Notification Behavior */}
        <Card style={styles.section}>
          <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
            {t('notificationSettingsScreen.sections.behavior')}
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                {t('notificationSettingsScreen.behavior.sound')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('notificationSettingsScreen.behavior.soundDesc')}
              </Text>
            </View>
            <Switch
              value={preferences.sound}
              onValueChange={() => handleToggle('sound')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                {t('notificationSettingsScreen.behavior.vibration')}
              </Text>
              <Text variant="caption" color="textSecondary">
                {t('notificationSettingsScreen.behavior.vibrationDesc')}
              </Text>
            </View>
            <Switch
              value={preferences.vibration}
              onValueChange={() => handleToggle('vibration')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </Card>

        {/* System Status */}
        <Card style={styles.section}>
          <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
            {t('notificationSettingsScreen.sections.system')}
          </Text>
          
          <View style={styles.statusItem}>
            <Text variant="body" weight="medium">
              {t('notificationSettingsScreen.system.service')}
            </Text>
            <Text 
              variant="caption" 
              color={isInitialized ? "success" : "error"}
              weight="medium"
            >
              {isInitialized ? t('notificationSettingsScreen.system.active') : t('notificationSettingsScreen.system.inactive')}
            </Text>
          </View>

          {expoPushToken && (
            <View style={styles.statusItem}>
              <Text variant="body" weight="medium">{t('notificationSettingsScreen.system.expoToken')}</Text>
              <Button
                variant="outline"
                size="small"
                onPress={() => copyToken(expoPushToken, 'Expo')}
              >
                {t('notificationSettingsScreen.system.showToken')}
              </Button>
            </View>
          )}

          {fcmToken && (
            <View style={styles.statusItem}>
              <Text variant="body" weight="medium">{t('notificationSettingsScreen.system.fcmToken')}</Text>
              <Button
                variant="outline"
                size="small"
                onPress={() => copyToken(fcmToken, 'FCM')}
              >
                {t('notificationSettingsScreen.system.showToken')}
              </Button>
            </View>
          )}
        </Card>

        {/* Test Notification */}
        <Card style={styles.section}>
          <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
            {t('notificationSettingsScreen.sections.test')}
          </Text>
          
          <Text variant="body" color="textSecondary" style={styles.testDescription}>
            {t('notificationSettingsScreen.test.description')}
          </Text>
          
          <Button
            variant="outline"
            onPress={handleTestNotification}
            disabled={!isInitialized}
        >
            {t('notificationSettingsScreen.test.send')}
          </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  testDescription: {
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
});
