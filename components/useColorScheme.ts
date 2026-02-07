import { useThemePreference } from '@/src/context/ThemeContext';

export const useColorScheme = () => {
  const { colorScheme } = useThemePreference();
  return colorScheme;
};
