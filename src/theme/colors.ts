export const Colors = {
  light: {
    primary: '#8B9D8A',
    primaryDark: '#6B7A6A',
    secondary: '#8B9D8A',
    background: '#E8E6E1',
    surface: '#F0EDE8',
    card: '#FFFFFF',
    text: '#2E2E2E',
    textSecondary: '#8E8E93',
    border: '#D1CFC9',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#8B9D8A',
  },
  dark: {
    primary: '#8B9D8A',
    primaryDark: '#6B7A6A',
    secondary: '#8B9D8A',
    background: '#2E2E2E',
    surface: '#3A3A3A',
    card: '#3A3A3A',
    text: '#F0EDE8',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    info: '#8B9D8A',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light;

