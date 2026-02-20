export const Typography = {
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 21,
    '3xl': 25,
    '4xl': 30,
  },
  
  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '400' as const,
    semibold: '500' as const,
    bold: '600' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font families
  fontFamily: {
    mono: 'SpaceMono-Regular',
  },
};

export type FontSize = keyof typeof Typography.fontSize;
export type FontWeight = keyof typeof Typography.fontWeight;


















