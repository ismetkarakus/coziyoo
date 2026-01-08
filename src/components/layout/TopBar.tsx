import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { Text } from '../ui/Text';

interface TopBarProps {
  title?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  leftComponent,
  rightComponent,
  transparent = false,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
            {leftComponent}
          </View>
          
          <View style={styles.center}>
            {title && (
              <Text variant="heading" weight="bold" center style={{ fontSize: 20 }}>
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
  },
  center: {
    flex: 2,
  },
});

