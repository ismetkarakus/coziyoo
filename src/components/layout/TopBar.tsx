import React from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { Text } from '../ui/Text';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface TopBarProps {
  title?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  onBack?: () => void;
  titleStyle?: object;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  leftComponent,
  rightComponent,
  transparent = false,
  onBack,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Create back button if onBack is provided and no leftComponent exists
  const renderLeftComponent = () => {
    if (leftComponent) return leftComponent;
    if (onBack) {
      return (
        <TouchableOpacity
          onPress={onBack}
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
            {rightComponent}
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
    alignItems: 'flex-end', // Changed from center to flex-end (bottom alignment)
    height: 48, // Reduced from 56 to 48 (8px shorter)
    paddingHorizontal: Spacing.sm, // Reduced from md to sm
    paddingBottom: Spacing.xs, // Added bottom padding for buttons
  },
  side: {
    flex: 1,
    zIndex: 1,
  },
  centerContainer: {
    position: 'absolute',
    left: Spacing['2xl'] + Spacing.sm,
    right: Spacing['2xl'] + Spacing.sm,
    bottom: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
