import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Keyboard,
  Animated
} from 'react-native';
import { Text } from './Text';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from '../../hooks/useTranslation';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionPress?: (suggestion: string) => void;
  showFilter?: boolean;
  filterCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  placeholder,
  suggestions = [],
  onSuggestionPress,
  showFilter = true,
  filterCount = 0,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder || t('searchBar.placeholder');
  
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSuggestions && suggestions.length > 0) {
      Animated.timing(animatedHeight, {
        toValue: Math.min(suggestions.length * 50, 200),
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [showSuggestions, suggestions.length]);

  const handleFocus = () => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    setShowSuggestions(text.length > 0 && suggestions.length > 0);
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value);
    }
    Keyboard.dismiss();
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSuggestionPress = (suggestion: string) => {
    if (onSuggestionPress) {
      onSuggestionPress(suggestion);
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChangeText('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: colors.background }]}
      onPress={() => handleSuggestionPress(item)}
    >
      <MaterialIcons name="search" size={14} color={colors.textSecondary} />
      <Text variant="body" style={[styles.suggestionText, { color: colors.text }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchContainer,
        {
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
        }
      ]}>
        <MaterialIcons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder={resolvedPlaceholder}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <MaterialIcons name="cancel" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {showFilter && (
          <TouchableOpacity
            onPress={onFilterPress}
            style={[
              styles.filterButton,
              {
                backgroundColor: filterCount > 0 ? colors.primary : 'transparent',
              }
            ]}
          >
            <MaterialIcons
              name="filter"
              size={16}
              color={filterCount > 0 ? colors.background : colors.textSecondary}
            />
            {filterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.error }]}>
                <Text variant="caption" style={{ color: colors.background, fontSize: 10 }}>
                  {filterCount > 9 ? '9+' : filterCount.toString()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions Dropdown */}
      <Animated.View
        style={[
          styles.suggestionsContainer,
          {
            height: animatedHeight,
            backgroundColor: colors.background,
            borderColor: colors.border,
          }
        ]}
      >
        <FlatList
          data={suggestions}
          renderItem={renderSuggestion}
          keyExtractor={(item, index) => `${item}-${index}`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20, // Reduced border radius for thinner frame
    borderWidth: 0.8, // Thinner border
    paddingHorizontal: Spacing.sm, // Reduced horizontal padding for tighter spacing
    paddingVertical: 3, // Even smaller vertical padding
    minHeight: 34, // Further reduced height for thinner appearance
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  filterButton: {
    position: 'relative',
    padding: 2, // Even more reduced padding
    borderRadius: 6, // Smaller border radius
    marginLeft: 4, // Reduced margin
    paddingHorizontal: 2, // Very minimal horizontal padding
    paddingVertical: 2, // Very minimal vertical padding
    minWidth: 24, // Smaller minimum width
    minHeight: 24, // Smaller minimum height
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
});



