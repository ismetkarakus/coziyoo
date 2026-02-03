import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { useCountry } from './CountryContext';

type SupportedLanguage = 'tr' | 'en';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'userLanguage';
const DEVICE_LANGUAGE_KEY = 'deviceLanguage';

const isSupportedLanguage = (value: string | null): value is SupportedLanguage => {
  return value === 'tr' || value === 'en';
};

const detectDeviceLanguage = (): SupportedLanguage => {
  const deviceLocale = Localization.locale || 'tr-TR';
  const languageCode = deviceLocale.split('-')[0];
  return languageCode === 'en' ? 'en' : 'tr';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentCountry } = useCountry();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('tr');

  useEffect(() => {
    const initializeLanguage = async () => {
      const deviceLanguage = detectDeviceLanguage();
      await AsyncStorage.setItem(DEVICE_LANGUAGE_KEY, deviceLanguage);

      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isSupportedLanguage(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        return;
      }

      const countryLanguage = currentCountry.language;
      if (isSupportedLanguage(countryLanguage)) {
        setCurrentLanguage(countryLanguage);
        return;
      }

      setCurrentLanguage(deviceLanguage);
    };

    initializeLanguage();
  }, [currentCountry.language]);

  const setLanguage = async (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  const value = useMemo(
    () => ({ currentLanguage, setLanguage }),
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
