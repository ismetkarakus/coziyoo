import React from 'react';
import { Platform, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Comprehensive web-safe icon mapping
const webIconMap: { [key: string]: string } = {
  // Navigation
  'home': '🏠',        // Ana sayfa için
  'store': '🏪',       // Satıcı sayfası için
  'dashboard': '📊',   // Dashboard için alternatif
  'th-large': '▦',
  'arrow-left': '←',
  'arrow-right': '→',
  'chevron-left': '‹',
  'chevron-right': '›',
  
  // User & Profile
  'user': '👤',
  'user-circle': '👤',
  'users': '👥',
  
  // Shopping & Commerce
  'shopping-cart': '🛒',
  'plus': '+',
  'minus': '−',
  
  // Communication
  'bell': '🔔',
  'bell-o': '🔔',
  'envelope': '✉️',
  'envelope-o': '✉️',
  'bullhorn': '📣',
  'phone': '📞',
  
  // Actions
  'times': '✕',
  'check': '✓',
  'edit': '✏️',
  'trash': '🗑️',
  'search': '🔍',
  
  // Food & Restaurant
  'cutlery': '🍴',
  'coffee': '☕',
  
  // Location & Time
  'map-marker': '📍',
  'clock-o': '🕐',
  'calendar': '📅',
  
  // Media
  'camera': '📷',
  'image': '🖼️',
  
  // Status
  'star': '⭐',
  'heart': '❤️',
  'thumbs-up': '👍',

  // Theme
  'sun-o': '☀️',
  'moon-o': '🌙',
  
  // Settings
  'cog': '⚙️',
  'gear': '⚙️',
  
  // Default fallback
  'default': '📱'
};

interface WebSafeIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const WebSafeIcon: React.FC<WebSafeIconProps> = ({ 
  name, 
  size = 20, 
  color = '#000000',
  style 
}) => {
  if (Platform.OS === 'web') {
    const emoji = webIconMap[name] || webIconMap['default'];
    return (
      <Text style={{ 
        fontSize: size, 
        color: color === 'white' ? '#FFFFFF' : color,
        lineHeight: size,
        textAlign: 'center',
        ...style 
      }}>
        {emoji}
      </Text>
    );
  }
  
  // Mobile'da FontAwesome kullan
  return <FontAwesome name={name as any} size={size} color={color} style={style} />;
};
