import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';

interface HeaderBackButtonProps {
  onPress?: () => void;
}

export const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({ 
  onPress 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.backButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialIcons 
        name="chevron-left" 
        size={18} 
        color={colors.primary} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
    borderRadius: 8,
  },
});