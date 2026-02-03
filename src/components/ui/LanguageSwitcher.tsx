import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useColorScheme } from '../../../components/useColorScheme';
import { Colors, Spacing } from '../../theme';
import { Text } from './Text';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setLanguage('tr')}
        style={[
          styles.button,
          { borderColor: colors.border },
          currentLanguage === 'tr' && {
            backgroundColor: colors.primary + '20',
            borderColor: colors.primary,
          }
        ]}
      >
        <Text weight="medium">🇹🇷 Türkçe</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setLanguage('en')}
        style={[
          styles.button,
          { borderColor: colors.border },
          currentLanguage === 'en' && {
            backgroundColor: colors.primary + '20',
            borderColor: colors.primary,
          }
        ]}
      >
        <Text weight="medium">🇬🇧 English</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
});
