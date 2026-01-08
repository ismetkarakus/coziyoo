import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Colors, Spacing } from '../../theme';

interface DeliveryOptionSelectorProps {
  selectedOption: 'pickup' | 'delivery' | null;
  onOptionSelect: (option: 'pickup' | 'delivery') => void;
  availableOptions?: ('pickup' | 'delivery')[];
  style?: any;
}

export const DeliveryOptionSelector: React.FC<DeliveryOptionSelectorProps> = ({
  selectedOption,
  onOptionSelect,
  availableOptions = ['pickup', 'delivery'],
  style,
}) => {
  const getOptionIcon = (option: 'pickup' | 'delivery') => {
    return option === 'pickup' ? '🏪' : '🚚';
  };

  const getOptionTitle = (option: 'pickup' | 'delivery') => {
    return option === 'pickup' ? 'Gel Al' : 'Teslimat';
  };

  const getOptionDescription = (option: 'pickup' | 'delivery') => {
    return option === 'pickup' ? 'Mağazadan al' : 'Adrese getir';
  };

  return (
    <View style={[styles.container, style]}>
      <Text variant="subheading" weight="semibold" style={styles.title}>
        Teslimat Seçeneği
      </Text>
      
      <View style={styles.optionsContainer}>
        {availableOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionCard,
              selectedOption === option && styles.optionCardSelected,
            ]}
            onPress={() => onOptionSelect(option)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionIcon}>
                {getOptionIcon(option)}
              </Text>
              <View style={styles.optionText}>
                <Text 
                  variant="body" 
                  weight="medium"
                  style={[
                    styles.optionTitle,
                    selectedOption === option && styles.optionTitleSelected
                  ]}
                >
                  {getOptionTitle(option)}
                </Text>
                <Text 
                  variant="caption" 
                  style={[
                    styles.optionDescription,
                    selectedOption === option && styles.optionDescriptionSelected
                  ]}
                >
                  {getOptionDescription(option)}
                </Text>
              </View>
              {selectedOption === option && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedIcon}>✓</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  title: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionContent: {
    alignItems: 'center',
    position: 'relative',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  optionText: {
    alignItems: 'center',
  },
  optionTitle: {
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  optionTitleSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  optionDescription: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: Colors.primary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

