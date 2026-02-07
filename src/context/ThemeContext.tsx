import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'themePreference';

interface ThemePreferenceProviderProps {
  children: React.ReactNode;
}

export const ThemePreferenceProvider: React.FC<ThemePreferenceProviderProps> = ({ children }) => {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadPreference();
  }, []);

  const setPreference = (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    AsyncStorage.setItem(STORAGE_KEY, nextPreference).catch((error) => {
      console.warn('Failed to save theme preference:', error);
    });
  };

  const colorScheme: 'light' | 'dark' = preference === 'system' ? systemScheme : preference;

  const value = useMemo(
    () => ({ preference, setPreference, colorScheme }),
    [preference, colorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemePreference = (): ThemeContextValue => {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const context = useContext(ThemeContext);

  if (!context) {
    return {
      preference: 'system',
      setPreference: () => {},
      colorScheme: systemScheme,
    };
  }

  return context;
};
