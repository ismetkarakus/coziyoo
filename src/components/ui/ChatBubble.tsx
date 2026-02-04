import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { ChatMessage } from '../../services/chatService';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onPress?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(currentLanguage === 'en' ? 'en-GB' : 'tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBubbleStyle = () => {
    if (message.messageType === 'order_update') {
      return [
        styles.bubble,
        styles.systemBubble,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ];
    }
    
    return [
      styles.bubble,
      isOwn ? 
        [styles.ownBubble, { backgroundColor: colors.primary }] :
        [styles.otherBubble, { backgroundColor: colors.surface }]
    ];
  };

  const getTextColor = () => {
    if (message.messageType === 'order_update') {
      return colors.text;
    }
    return isOwn ? colors.background : colors.text;
  };

  const renderOrderUpdate = () => {
    if (message.messageType !== 'order_update' || !message.orderData) {
      return null;
    }

    const { orderId, status, foodName } = message.orderData;
    const statusEmojis = {
      pending: '⏳',
      approved: '✅',
      preparing: '👨‍🍳',
      ready: '🎉',
      completed: '✨',
      cancelled: '❌'
    };

    return (
      <View style={styles.orderUpdateContent}>
        <Text variant="caption" weight="medium" style={{ color: colors.primary }}>
          {statusEmojis[status as keyof typeof statusEmojis]} {t('chatBubble.orderUpdated')}
        </Text>
        <Text variant="body" style={{ color: getTextColor(), marginTop: 2 }}>
          {foodName}
        </Text>
        <Text variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
          {t('chatBubble.orderLabel', { id: orderId.substring(0, 8) })}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <TouchableOpacity
        style={getBubbleStyle()}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {message.messageType === 'order_update' ? (
          renderOrderUpdate()
        ) : (
          <Text variant="body" style={{ color: getTextColor() }}>
            {message.message}
          </Text>
        )}
        
        <View style={styles.timeContainer}>
          <Text variant="caption" style={{ 
            color: message.messageType === 'order_update' ? colors.textSecondary : 
                   isOwn ? 'rgba(255,255,255,0.7)' : colors.textSecondary 
          }}>
            {formatTime(message.timestamp)}
          </Text>
          {isOwn && (
            <Text variant="caption" style={{ 
              color: 'rgba(255,255,255,0.7)', 
              marginLeft: 4 
            }}>
              {message.isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    paddingHorizontal: Spacing.md,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 18,
    minWidth: 60,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  systemBubble: {
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  orderUpdateContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
});








