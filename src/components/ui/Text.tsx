import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Colors, Typography, type FontSize, type FontWeight } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';

interface TextProps extends RNTextProps {
  variant?: 'body' | 'caption' | 'heading' | 'subheading' | 'title';
  size?: FontSize;
  weight?: FontWeight;
  color?: keyof typeof Colors.light;
  center?: boolean;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  size,
  weight,
  color,
  center,
  style,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getVariantStyles = () => {
    switch (variant) {
      case 'title':
        return { fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.bold };
      case 'heading':
        return { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.semibold };
      case 'subheading':
        return { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.medium };
      case 'caption':
        return { fontSize: Typography.fontSize.sm, color: colors.textSecondary };
      default:
        return { fontSize: Typography.fontSize.base };
    }
  };

  const textStyle = [
    styles.base,
    getVariantStyles(),
    {
      color: color ? colors[color] : colors.text,
      fontSize: size ? Typography.fontSize[size] : undefined,
      fontWeight: weight ? Typography.fontWeight[weight] : undefined,
      textAlign: center ? 'center' as const : undefined,
    },
    style,
  ];

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    // Natural line height unless overridden
  },
});
