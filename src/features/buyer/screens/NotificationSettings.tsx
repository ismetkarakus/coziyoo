import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useNotifications } from '../../../context/NotificationContext';

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
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir hata oluştu.');
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPreferences);
  };

  const handleTestNotification = async () => {
    if (!isInitialized) {
      Alert.alert('Bildirim Servisi', 'Bildirim servisi henüz hazır değil.');
      return;
    }

    Alert.alert(
      'Test Bildirimi',
      'Test bildirimi gönderildi! Birkaç saniye içinde görmelisiniz.',
      [{ text: 'Tamam' }]
    );

    // Send a test notification
    // This would typically be done through your backend
    console.log('Test notification sent');
  };

  const copyToken = (token: string | null, type: string) => {
    if (!token) {
      Alert.alert('Token Yok', `${type} token henüz oluşturulmadı.`);
      return;
    }
    
    // In a real app, you would copy to clipboard
    Alert.alert(
      `${type} Token`,
      `Token: ${token.substring(0, 50)}...`,
      [{ text: 'Tamam' }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar 
          title="Bildirim Ayarları"
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textSecondary">Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Bildirim Ayarları"
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notification Types */}
        <Card style={styles.section}>
          <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
            Bildirim Türleri
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">Sipariş Güncellemeleri</Text>
              <Text variant="caption" color="textSecondary">
                Sipariş durumu değişikliklerinde bildirim al
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
              <Text variant="body" weight="medium">Yeni Mesajlar</Text>
              <Text variant="caption" color="textSecondary">
                Satıcılardan gelen mesajlarda bildirim al
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
              <Text variant="body" weight="medium">Düşük Stok Uyarıları</Text>
              <Text variant="caption" color="textSecondary">
                Favori yemeklerin stoku azaldığında bildirim al
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
              <Text variant="body" weight="medium">Promosyonlar</Text>
              <Text variant="caption" color="textSecondary">
                İndirimler ve özel teklifler hakkında bildirim al
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
            Bildirim Davranışı
          </Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">Ses</Text>
              <Text variant="caption" color="textSecondary">
                Bildirimler geldiğinde ses çal
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
              <Text variant="body" weight="medium">Titreşim</Text>
              <Text variant="caption" color="textSecondary">
                Bildirimler geldiğinde telefonu titret
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
            Sistem Durumu
          </Text>
          
          <View style={styles.statusItem}>
            <Text variant="body" weight="medium">Bildirim Servisi</Text>
            <Text 
              variant="caption" 
              color={isInitialized ? "success" : "error"}
              weight="medium"
            >
              {isInitialized ? 'Aktif' : 'Pasif'}
            </Text>
          </View>

          {expoPushToken && (
            <View style={styles.statusItem}>
              <Text variant="body" weight="medium">Expo Push Token</Text>
              <Button
                variant="outline"
                size="small"
                onPress={() => copyToken(expoPushToken, 'Expo')}
              >
                Token Göster
              </Button>
            </View>
          )}

          {fcmToken && (
            <View style={styles.statusItem}>
              <Text variant="body" weight="medium">FCM Token</Text>
              <Button
                variant="outline"
                size="small"
                onPress={() => copyToken(fcmToken, 'FCM')}
              >
                Token Göster
              </Button>
            </View>
          )}
        </Card>

        {/* Test Notification */}
        <Card style={styles.section}>
          <Text variant="subheading" weight="medium" style={styles.sectionTitle}>
            Test
          </Text>
          
          <Text variant="body" color="textSecondary" style={styles.testDescription}>
            Bildirim ayarlarınızın çalışıp çalışmadığını test edin.
          </Text>
          
          <Button
            variant="outline"
            onPress={handleTestNotification}
            disabled={!isInitialized}
          >
            Test Bildirimi Gönder
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