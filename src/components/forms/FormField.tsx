import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { Text } from '../ui/Text';
import { Spacing } from '../../theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  ...inputProps
}) => {
  return (
    <View style={styles.container}>
      <Input
        label={required ? `${label} *` : label}
        {...inputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
});

