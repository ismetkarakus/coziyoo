import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showNumber?: boolean;
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  size = 'medium',
  interactive = false,
  onRatingChange,
  showNumber = false,
  color,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { starSize: 12, spacing: 2, textSize: 12 };
      case 'large':
        return { starSize: 24, spacing: 6, textSize: 16 };
      default:
        return { starSize: 16, spacing: 4, textSize: 14 };
    }
  };

  const { starSize, spacing, textSize } = getSizeConfig();
  const starColor = color || '#FFD700'; // Gold color
  const emptyStarColor = colors.border;

  const handleStarPress = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    const safeRating = rating || 0;
    const isFilled = starNumber <= Math.floor(safeRating);
    const isHalfFilled = starNumber === Math.ceil(safeRating) && safeRating % 1 !== 0;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(starNumber)}
        disabled={!interactive}
        style={[styles.starContainer, { marginRight: spacing }]}
      >
        {isHalfFilled ? (
          <View style={styles.halfStarContainer}>
            <MaterialIcons
              name="star"
              size={starSize}
              color={emptyStarColor}
              style={styles.starBase}
            />
            <View style={[styles.halfStarOverlay, { width: starSize * 0.5 }]}>
              <MaterialIcons
                name="star"
                size={starSize}
                color={starColor}
              />
            </View>
          </View>
        ) : (
          <MaterialIcons
            name={isFilled ? "star" : "star-o"}
            size={starSize}
            color={isFilled ? starColor : emptyStarColor}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </View>
      {showNumber && (
        <Text
          variant="body"
          style={[
            styles.ratingText,
            { fontSize: textSize, color: colors.text, marginLeft: spacing * 2 }
          ]}
        >
          {(rating || 0).toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    position: 'relative',
  },
  halfStarContainer: {
    position: 'relative',
  },
  starBase: {
    position: 'absolute',
  },
  halfStarOverlay: {
    overflow: 'hidden',
  },
  ratingText: {
    fontWeight: '500',
  },
});
