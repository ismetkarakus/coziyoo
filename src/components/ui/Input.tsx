import React, { forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Typography, commonStyles } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const baseStyle = {
    ...styles.input,
    backgroundColor: colors.surface,
    borderColor: error ? colors.error : colors.border,
    color: colors.text,
    ...(leftIcon && styles.inputWithLeftIcon),
    ...(rightIcon && styles.inputWithRightIcon),
  };
  
  const inputStyle = style ? [baseStyle, style] : baseStyle;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" weight="medium" style={styles.label}>
          {label}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={inputStyle}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text
          variant="caption"
          color={error ? 'error' : 'textSecondary'}
          style={styles.helperText}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: commonStyles.borderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.base,
  },
  inputWithLeftIcon: {
    paddingLeft: 40,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  leftIcon: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 1,
  },
  helperText: {
    marginTop: Spacing.xs,
  },
});
