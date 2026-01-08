import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
  required = false,
  disabled = false,
  helperText,
  error,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: checked ? colors.primary : colors.surface,
              borderColor: error ? colors.error : (checked ? colors.primary : colors.border),
            },
            disabled && styles.disabled,
          ]}
        >
          {checked && (
            <Text variant="caption" style={[styles.checkmark, { color: colors.surface }]}>
              ✓
            </Text>
          )}
        </View>
        <Text
          variant="body"
          style={[
            styles.label,
            { color: disabled ? colors.textSecondary : colors.text },
          ]}
        >
          {required ? `${label} *` : label}
        </Text>
      </TouchableOpacity>
      
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
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm, // Increased padding for better touch area
    paddingHorizontal: Spacing.xs,
  },
  checkbox: {
    width: 24, // Increased size
    height: 24, // Increased size
    borderRadius: 6, // Slightly larger radius
    borderWidth: 2,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1, // Adjust for larger size
  },
  checkmark: {
    fontSize: 14, // Increased size
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  helperText: {
    marginTop: Spacing.xs,
    marginLeft: 36, // Align with label text (adjusted for larger checkbox)
  },
});
