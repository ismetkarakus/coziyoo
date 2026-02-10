import React from 'react';
import { Platform, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Comprehensive web-safe icon mapping
const webIconMap: { [key: string]: string } = {
  // Navigation
  'home': '🏠',        // Ana sayfa için
  'store': '🏪',       // Satıcı sayfası için
  'dashboard': '📊',   // Dashboard için alternatif
  'grid-view': '▦',
  'arrow-back': '←',
  'arrow-forward': '→',
  'chevron-left': '‹',
  'chevron-right': '›',
  
  // User & Profile
  'person': '👤',
  'account-circle': '👤',
  'users': '👥',
  
  // Shopping & Commerce
  'shopping-cart': '🛒',
  'local-mall': '🛍️',
  'add': '+',
  'remove': '−',
  
  // Communication
  'bell': '🔔',
  'bell-o': '🔔',
  'email': '✉️',
  'bullhorn': '📣',
  'phone': '📞',
  
  // Actions
  'close': '✕',
  'check': '✓',
  'edit': '✏️',
  'delete': '🗑️',
  'search': '🔍',
  
  // Food & Restaurant
  'restaurant': '🍴',
  'coffee': '☕',
  
  // Location & Time
  'location-on': '📍',
  'schedule': '🕐',
  'calendar-today': '📅',
  'event-available': '📅',
  
  // Media
  'photo-camera': '📷',
  'image': '🖼️',
  
  // Status
  'star': '⭐',
  'heart': '❤️',
  'thumb-up': '👍',

  // Theme
  'light-mode': '☀️',
  'dark-mode': '🌙',
  
  // Settings
  'settings': '⚙️',
  
  // Other commonly used
  'info': 'ℹ️',
  'account-balance': '🏦',
  'credit-card': '💳',
  'badge': '🪪',
  'local-shipping': '🚚',
  'emoji-events': '🏆',
  'label': '🏷️',
  
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
  
  // Mobile'da MaterialIcons kullan
  return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
};
