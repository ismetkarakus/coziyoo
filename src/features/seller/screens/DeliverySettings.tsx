import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface DeliverySettingsData {
  hasPickup: boolean;
  hasDelivery: boolean;
  maxDeliveryDistance: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryTime: number;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
}

const DEFAULT_SETTINGS: DeliverySettingsData = {
  hasPickup: true,
  hasDelivery: true,
  maxDeliveryDistance: 5,
  deliveryFee: 10,
  freeDeliveryThreshold: 100,
  estimatedDeliveryTime: 30,
  workingHours: {
    start: '09:00',
    end: '22:00',
  },
  workingDays: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
};

const DAYS_OF_WEEK = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
];

export const DeliverySettings: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [settings, setSettings] = useState<DeliverySettingsData>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('deliverySettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading delivery settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem('deliverySettings', JSON.stringify(settings));
      Alert.alert(
        'Başarılı',
        'Teslimat ayarlarınız kaydedildi.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      Alert.alert(
        'Hata',
        'Ayarlar kaydedilirken bir hata oluştu.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    console.log('Back button pressed from DeliverySettings');
    router.back();
  };

  const toggleDeliveryOption = (option: 'pickup' | 'delivery') => {
    if (option === 'pickup') {
      setSettings(prev => ({ ...prev, hasPickup: !prev.hasPickup }));
    } else {
      setSettings(prev => ({ ...prev, hasDelivery: !prev.hasDelivery }));
    }
  };

  const toggleWorkingDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const updateSetting = (key: keyof DeliverySettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Teslimat Ayarları"
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
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Teslimat Seçenekleri */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Teslimat Seçenekleri
          </Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                {
                  backgroundColor: settings.hasPickup ? colors.primary : colors.surface,
                  borderColor: settings.hasPickup ? colors.primary : colors.border,
                }
              ]}
              onPress={() => toggleDeliveryOption('pickup')}
            >
              <Text
                variant="body"
                weight="medium"
                style={{
                  color: settings.hasPickup ? 'white' : colors.text,
                }}
              >
                🏪 Gel Al (Pickup)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                {
                  backgroundColor: settings.hasDelivery ? colors.primary : colors.surface,
                  borderColor: settings.hasDelivery ? colors.primary : colors.border,
                }
              ]}
              onPress={() => toggleDeliveryOption('delivery')}
            >
              <Text
                variant="body"
                weight="medium"
                style={{
                  color: settings.hasDelivery ? 'white' : colors.text,
                }}
              >
                🚗 Teslimat (Delivery)
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Teslimat Detayları */}
        {settings.hasDelivery && (
          <Card variant="default" padding="md" style={styles.sectionCard}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              Teslimat Detayları
            </Text>
            
            <View style={styles.formContainer}>
              <FormField
                label="Maksimum Teslimat Mesafesi (km)"
                value={settings.maxDeliveryDistance.toString()}
                onChangeText={(text) => updateSetting('maxDeliveryDistance', parseInt(text) || 0)}
                placeholder="5"
                keyboardType="numeric"
              />
              
              <FormField
                label="Teslimat Ücreti (₺)"
                value={settings.deliveryFee.toString()}
                onChangeText={(text) => updateSetting('deliveryFee', parseFloat(text) || 0)}
                placeholder="10"
                keyboardType="numeric"
              />
              
              <FormField
                label="Ücretsiz Teslimat Minimum Tutarı (₺)"
                value={settings.freeDeliveryThreshold.toString()}
                onChangeText={(text) => updateSetting('freeDeliveryThreshold', parseFloat(text) || 0)}
                placeholder="100"
                keyboardType="numeric"
              />
              
              <FormField
                label="Tahmini Teslimat Süresi (dakika)"
                value={settings.estimatedDeliveryTime.toString()}
                onChangeText={(text) => updateSetting('estimatedDeliveryTime', parseInt(text) || 0)}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>
          </Card>
        )}

        {/* Çalışma Saatleri */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Çalışma Saatleri
          </Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <FormField
                label="Başlangıç Saati"
                value={settings.workingHours.start}
                onChangeText={(text) => updateSetting('workingHours', { ...settings.workingHours, start: text })}
                placeholder="09:00"
              />
            </View>
            <View style={styles.timeField}>
              <FormField
                label="Bitiş Saati"
                value={settings.workingHours.end}
                onChangeText={(text) => updateSetting('workingHours', { ...settings.workingHours, end: text })}
                placeholder="22:00"
              />
            </View>
          </View>
        </Card>

        {/* Çalışma Günleri */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Çalışma Günleri
          </Text>
          
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: settings.workingDays.includes(day) ? colors.primary : colors.surface,
                    borderColor: settings.workingDays.includes(day) ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => toggleWorkingDay(day)}
              >
                <Text
                  variant="caption"
                  weight="medium"
                  style={{
                    color: settings.workingDays.includes(day) ? 'white' : colors.text,
                  }}
                >
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Kaydet Butonu */}
        <View style={styles.saveContainer}>
          <Button
            variant="primary"
            onPress={saveSettings}
            disabled={isLoading}
            style={styles.saveButton}
          >
            {isLoading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  sectionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  formContainer: {
    gap: Spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeField: {
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dayButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  saveContainer: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  saveButton: {
    paddingVertical: Spacing.md,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});




