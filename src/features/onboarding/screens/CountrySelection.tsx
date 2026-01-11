import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useCountry } from '../../../context/CountryContext';
import { COUNTRIES } from '../../../config/countries';

export const CountrySelection: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setCountry, detectCountry } = useCountry();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [detecting, setDetecting] = useState(false);

  const getCountryFlag = (code: string) => {
    switch (code) {
      case 'TR': return '🇹🇷';
      case 'UK': return '🇬🇧';
      default: return '🌍';
    }
  };

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

  const handleContinue = async () => {
    if (!selectedCountry) {
      Alert.alert('Ülke Seçin', 'Lütfen bir ülke seçin.');
      return;
    }

    await setCountry(selectedCountry);
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    
    // Ana sayfaya yönlendir
    router.replace('/(tabs)');
  };

  const handleAutoDetect = async () => {
    setDetecting(true);
    try {
      await detectCountry();
      // Tespit edilen ülkeyi seçili yap
      const savedCountry = await AsyncStorage.getItem('selectedCountry');
      if (savedCountry) {
        setSelectedCountry(savedCountry);
        // Otomatik tespit başarılıysa direkt devam et
        setTimeout(() => {
          handleContinue();
        }, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not detect location. Please select manually.');
    } finally {
      setDetecting(false);
    }
  };

  const handleSkip = async () => {
    // Varsayılan ülke ile devam et (dil bazlı)
    const deviceLanguage = await AsyncStorage.getItem('deviceLanguage') || 'tr';
    const defaultCountry = deviceLanguage === 'en' ? 'UK' : 'TR';
    
    await setCountry(defaultCountry);
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop' }}
          style={styles.logo}
        />
        <Text variant="title" weight="bold" center style={styles.title}>
          Welcome to Cazi
        </Text>
        <Text variant="body" center color="textSecondary" style={styles.subtitle}>
          Choose your country to get started
        </Text>
      </View>

      {/* Auto Detect Button */}
      <TouchableOpacity
        onPress={handleAutoDetect}
        disabled={detecting}
        style={[styles.autoDetectButton, { 
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary 
        }]}
      >
        <Text variant="body" color="primary" weight="medium">
          {detecting ? '🌍 Detecting location...' : '📍 Auto-detect my country'}
        </Text>
      </TouchableOpacity>

      <Text variant="body" center color="textSecondary" style={styles.orText}>
        or choose manually
      </Text>

      {/* Country Options */}
      <View style={styles.countriesContainer}>
        {Object.entries(COUNTRIES).map(([code, country]) => (
          <TouchableOpacity
            key={code}
            onPress={() => handleCountrySelect(code)}
            style={[
              styles.countryCard,
              {
                backgroundColor: selectedCountry === code ? colors.primary + '20' : colors.surface,
                borderColor: selectedCountry === code ? colors.primary : colors.border,
                borderWidth: selectedCountry === code ? 2 : 1,
              }
            ]}
          >
            <Text style={styles.flagText}>{getCountryFlag(code)}</Text>
            <View style={styles.countryInfo}>
              <Text variant="subheading" weight="semibold">
                {country.name}
              </Text>
              <Text variant="caption" color="textSecondary">
                {country.currency} • {country.language.toUpperCase()}
              </Text>
              {country.businessCompliance.required && (
                <View style={styles.complianceTag}>
                  <Text variant="caption" color="warning">
                    ⚠️ Business compliance required
                  </Text>
                </View>
              )}
            </View>
            {selectedCountry === code && (
              <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Continue & Skip Buttons */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedCountry}
          style={[
            styles.continueButton,
            { opacity: selectedCountry ? 1 : 0.5 }
          ]}
        />
        
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text variant="body" color="textSecondary" center>
            Skip - Use device language
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl * 2,
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  autoDetectButton: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orText: {
    marginBottom: Spacing.lg,
  },
  countriesContainer: {
    flex: 1,
    gap: Spacing.md,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    position: 'relative',
  },
  flagText: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  countryInfo: {
    flex: 1,
  },
  complianceTag: {
    marginTop: Spacing.xs,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    paddingTop: Spacing.lg,
  },
  continueButton: {
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
  },
});