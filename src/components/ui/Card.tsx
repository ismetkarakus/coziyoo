import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, commonStyles } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';

interface BaseCardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof Spacing;
  children: React.ReactNode;
}

interface CardProps extends Omit<ViewProps, 'children'>, BaseCardProps {
  pressable?: false;
}

interface PressableCardProps extends Omit<TouchableOpacityProps, 'children'>, BaseCardProps {
  pressable: true;
}

type CombinedCardProps = CardProps | PressableCardProps;

export const Card: React.FC<CombinedCardProps> = ({
  variant = 'default',
  padding = 'md',
  pressable,
  style,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          ...commonStyles.shadow,
          elevation: 4,
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.card,
          ...commonStyles.shadow,
        };
    }
  };

  const cardStyle = [
    styles.base,
    getVariantStyles(),
    { padding: Spacing[padding] },
    style,
  ];

  if (pressable) {
    const { pressable: _, ...touchableProps } = props as PressableCardProps;
    return (
      <TouchableOpacity
        style={cardStyle}
        activeOpacity={0.7}
        {...touchableProps}
      >
        {children}
      </TouchableOpacity>
    );
  }

  const { pressable: _, ...viewProps } = props as CardProps;
  return (
    <View style={cardStyle} {...viewProps}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: commonStyles.borderRadius.lg,
  },
});
