import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { Text } from '../ui/Text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useThemePreference } from '../../context/ThemeContext';

interface TopBarProps {
  title?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  onBack?: () => void;
  showBack?: boolean;
  showThemeToggle?: boolean;
  titleStyle?: object;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  leftComponent,
  rightComponent,
  transparent = false,
  onBack,
  showBack = false,
  showThemeToggle = true,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setPreference } = useThemePreference();

  // Create back button if onBack is provided and no leftComponent exists
  const renderLeftComponent = () => {
    if (leftComponent) return leftComponent;
    if (onBack || showBack) {
      return (
        <TouchableOpacity
          onPress={onBack ?? (() => router.back())}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : colors.background}
      />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: transparent ? 'transparent' : colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.side}>
            {renderLeftComponent()}
          </View>
          
          <View style={styles.centerContainer}>
            {title && (
              <Text variant="heading" weight="bold" center style={[{ fontSize: 20 }, titleStyle]}>
                {title}
              </Text>
            )}
          </View>
          
          <View style={styles.side}>
            <View style={styles.rightContainer}>
              {rightComponent}
              {showThemeToggle && (
                <TouchableOpacity
                  onPress={() => setPreference(colorScheme === 'dark' ? 'light' : 'dark')}
                  style={styles.themeToggle}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name={colorScheme === 'dark' ? 'sun-o' : 'moon-o'}
                    size={18}
                    color={colors.text}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 4,
    paddingBottom: Spacing.xs,
  },
  side: {
    width: 48,
    zIndex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggle: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
});
