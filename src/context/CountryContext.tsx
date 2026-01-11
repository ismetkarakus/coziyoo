import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { COUNTRIES, CountryConfig, DEFAULT_COUNTRY } from '../config/countries';

interface CountryContextType {
  currentCountry: CountryConfig;
  countryCode: string;
  setCountry: (countryCode: string) => void;
  detectCountry: () => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  isBusinessComplianceRequired: boolean;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryCode, setCountryCode] = useState<string>(DEFAULT_COUNTRY);
  const [currentCountry, setCurrentCountry] = useState<CountryConfig>(COUNTRIES[DEFAULT_COUNTRY]);

  useEffect(() => {
    initializeCountryAndLanguage();
  }, []);

  const initializeCountryAndLanguage = async () => {
    try {
      console.log('🌍 Initializing automatic country detection...');
      
      // 1. Kaydedilmiş ülke var mı kontrol et
      const savedCountry = await AsyncStorage.getItem('selectedCountry');
      if (savedCountry && COUNTRIES[savedCountry]) {
        setCountry(savedCountry);
        console.log(`💾 Using saved country: ${savedCountry}`);
      } else {
        // 2. Otomatik tespit et
        await autoDetectCountryAndLanguage();
      }
      
      // Onboarding'i otomatik tamamla
      await AsyncStorage.setItem('autoDetected', 'true');
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
    } catch (error) {
      console.error('Error initializing:', error);
      await setCountry('TR'); // Fallback olarak Türkiye
    }
  };

  const loadSavedCountry = async () => {
    try {
      const savedCountry = await AsyncStorage.getItem('selectedCountry');
      if (savedCountry && COUNTRIES[savedCountry]) {
        setCountry(savedCountry);
      } else {
        // İlk açılışta otomatik tespit et
        await autoDetectCountryAndLanguage();
      }
    } catch (error) {
      console.error('Error loading saved country:', error);
      // Hata durumunda da otomatik tespit et
      await autoDetectCountryAndLanguage();
    }
  };

  const setCountry = async (newCountryCode: string) => {
    if (COUNTRIES[newCountryCode]) {
      setCountryCode(newCountryCode);
      setCurrentCountry(COUNTRIES[newCountryCode]);
      await AsyncStorage.setItem('selectedCountry', newCountryCode);
      console.log(`🌍 Country changed to: ${COUNTRIES[newCountryCode].name}`);
    }
  };

  // Gelişmiş otomatik tespit - dil + konum
  const autoDetectCountryAndLanguage = async () => {
    try {
      console.log('🌍 Auto-detecting country and language...');

      // 1. Cihaz dilini tespit et
      let deviceLanguage = 'tr'; // Default fallback
      try {
        // Cihaz ayarlarından dil tespit et
        const deviceLocale = 'tr-TR'; // Simülasyon için Türkçe
        deviceLanguage = deviceLocale.split('-')[0];
        console.log(`📱 Device language detected: ${deviceLanguage}`);
      } catch (localeError) {
        console.warn('Could not detect device locale, using Turkish as default');
      }
      
      // 2. Dil bazında ülke tahmini
      let detectedCountry = DEFAULT_COUNTRY;
      if (deviceLanguage === 'tr') {
        detectedCountry = 'TR';
        console.log('🇹🇷 Turkish detected -> Turkey');
      } else if (deviceLanguage === 'en') {
        // İngilizce için konum kontrolü yapalım
        const locationCountry = await detectLocationBasedCountry();
        detectedCountry = locationCountry || 'UK';
        console.log(`🇬🇧 English detected -> ${detectedCountry}`);
      } else {
        console.log(`🌍 Other language (${deviceLanguage}) -> Default (${DEFAULT_COUNTRY})`);
      }
      
      console.log(`🎯 Final auto-detected country: ${detectedCountry}`);
      await setCountry(detectedCountry);
      
      // Otomatik tespit edildiğini kaydet
      await AsyncStorage.setItem('autoDetected', 'true');
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
    } catch (error) {
      console.error('Error in auto-detection:', error);
      // Fallback: default ülke
      await setCountry(DEFAULT_COUNTRY);
    }
  };

  // Sadece konum bazlı tespit (opsiyonel)
  const detectLocationBasedCountry = async (): Promise<string | null> => {
    try {
      // Konum izni iste (opsiyonel)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('📍 Location permission denied, using language-based detection');
        return null;
      }

      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      // Reverse geocoding ile ülke bilgisi al
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const country = reverseGeocode[0].isoCountryCode;
        console.log(`📍 Location-detected country: ${country}`);
        
        // Desteklenen ülkelerden biriyse döndür
        if (country === 'TR') return 'TR';
        if (country === 'GB' || country === 'UK') return 'UK';
      }
      
      return null;
    } catch (error) {
      console.error('Location detection error:', error);
      return null;
    }
  };

  // Manuel tespit (eski fonksiyon - uyumluluk için)
  const detectCountry = async () => {
    await autoDetectCountryAndLanguage();
  };

  const formatCurrency = (amount: number): string => {
    const formatted = amount.toFixed(2);
    return `${currentCountry.currencySymbol}${formatted}`;
  };

  const formatDate = (date: Date): string => {
    if (currentCountry.dateFormat === 'DD/MM/YYYY') {
      return date.toLocaleDateString('en-GB');
    }
    return date.toLocaleDateString();
  };

  const isBusinessComplianceRequired = currentCountry.businessCompliance.required;

  return (
    <CountryContext.Provider
      value={{
        currentCountry,
        countryCode,
        setCountry,
        detectCountry,
        formatCurrency,
        formatDate,
        isBusinessComplianceRequired,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};