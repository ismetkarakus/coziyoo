import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card } from '../../../components/ui';
import { FormField } from '../../../components/forms';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
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
  workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
};

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const DAYS_OF_WEEK: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DAY_ALIASES: Record<string, DayKey> = {
  Pazartesi: 'mon',
  Salı: 'tue',
  Çarşamba: 'wed',
  Perşembe: 'thu',
  Cuma: 'fri',
  Cumartesi: 'sat',
  Pazar: 'sun',
  Monday: 'mon',
  Tuesday: 'tue',
  Wednesday: 'wed',
  Thursday: 'thu',
  Friday: 'fri',
  Saturday: 'sat',
  Sunday: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

export const DeliverySettings: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
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
        const normalizedDays = Array.isArray(parsedSettings.workingDays)
          ? parsedSettings.workingDays
              .map((day: string) => DAY_ALIASES[day] || day)
              .filter((day: string) => DAYS_OF_WEEK.includes(day as DayKey))
          : DEFAULT_SETTINGS.workingDays;
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings, workingDays: normalizedDays });
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
        t('deliverySettingsScreen.alerts.successTitle'),
        t('deliverySettingsScreen.alerts.successMessage'),
        [{ text: t('deliverySettingsScreen.alerts.ok') }]
      );
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      Alert.alert(
        t('deliverySettingsScreen.alerts.errorTitle'),
        t('deliverySettingsScreen.alerts.errorMessage'),
        [{ text: t('deliverySettingsScreen.alerts.ok') }]
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

  const toggleWorkingDay = (day: DayKey) => {
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
        title={t('deliverySettingsScreen.title')}
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
            {t('deliverySettingsScreen.sections.options')}
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
                {t('deliverySettingsScreen.options.pickup')}
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
                {t('deliverySettingsScreen.options.delivery')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Teslimat Detayları */}
        {settings.hasDelivery && (
          <Card variant="default" padding="md" style={styles.sectionCard}>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              {t('deliverySettingsScreen.sections.details')}
            </Text>
            
            <View style={styles.formContainer}>
              <FormField
                label={t('deliverySettingsScreen.fields.maxDistance')}
                value={settings.maxDeliveryDistance.toString()}
                onChangeText={(text) => updateSetting('maxDeliveryDistance', parseInt(text) || 0)}
                placeholder={t('deliverySettingsScreen.placeholders.maxDistance')}
                keyboardType="numeric"
              />
              
              <FormField
                label={t('deliverySettingsScreen.fields.deliveryFee')}
                value={settings.deliveryFee.toString()}
                onChangeText={(text) => updateSetting('deliveryFee', parseFloat(text) || 0)}
                placeholder={t('deliverySettingsScreen.placeholders.deliveryFee')}
                keyboardType="numeric"
              />
              
              <FormField
                label={t('deliverySettingsScreen.fields.freeThreshold')}
                value={settings.freeDeliveryThreshold.toString()}
                onChangeText={(text) => updateSetting('freeDeliveryThreshold', parseFloat(text) || 0)}
                placeholder={t('deliverySettingsScreen.placeholders.freeThreshold')}
                keyboardType="numeric"
              />
              
              <FormField
                label={t('deliverySettingsScreen.fields.estimatedTime')}
                value={settings.estimatedDeliveryTime.toString()}
                onChangeText={(text) => updateSetting('estimatedDeliveryTime', parseInt(text) || 0)}
                placeholder={t('deliverySettingsScreen.placeholders.estimatedTime')}
                keyboardType="numeric"
              />
            </View>
          </Card>
        )}

        {/* Çalışma Saatleri */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t('deliverySettingsScreen.sections.hours')}
          </Text>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeField}>
              <FormField
                label={t('deliverySettingsScreen.fields.startTime')}
                value={settings.workingHours.start}
                onChangeText={(text) => updateSetting('workingHours', { ...settings.workingHours, start: text })}
                placeholder={t('deliverySettingsScreen.placeholders.startTime')}
              />
            </View>
            <View style={styles.timeField}>
              <FormField
                label={t('deliverySettingsScreen.fields.endTime')}
                value={settings.workingHours.end}
                onChangeText={(text) => updateSetting('workingHours', { ...settings.workingHours, end: text })}
                placeholder={t('deliverySettingsScreen.placeholders.endTime')}
              />
            </View>
          </View>
        </Card>

        {/* Çalışma Günleri */}
        <Card variant="default" padding="md" style={styles.sectionCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t('deliverySettingsScreen.sections.days')}
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
                  {t(`deliverySettingsScreen.daysShort.${day}`)}
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
            {isLoading ? t('deliverySettingsScreen.saving') : t('deliverySettingsScreen.save')}
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










