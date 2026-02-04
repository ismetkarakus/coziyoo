import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from './Text';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../../components/useColorScheme';
import { Chat } from '../../services/chatService';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  currentUserType: 'buyer' | 'seller';
  onPress: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  currentUserId,
  currentUserType,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();

  const getOtherUserName = () => {
    return currentUserType === 'buyer' ? chat.sellerName : chat.buyerName;
  };

  const getUnreadCount = () => {
    return currentUserType === 'buyer' ? chat.buyerUnreadCount : chat.sellerUnreadCount;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    const locale = currentLanguage === 'en' ? 'en-GB' : 'tr-TR';
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString(locale, {
        weekday: 'short',
      });
    } else {
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const getAvatarUrl = () => {
    // Generate a simple avatar based on user name
    const name = getOtherUserName();
    const firstLetter = name.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=50`;
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const unreadCount = getUnreadCount();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: getAvatarUrl() }}
          style={styles.avatar}
        />
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text variant="caption" style={{ color: colors.background, fontSize: 10 }} weight="medium">
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            variant="body" 
            weight="medium" 
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
          >
            {getOtherUserName()}
          </Text>
          <Text variant="caption" style={{ color: colors.textSecondary }}>
            {formatTime(chat.lastMessageTime)}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text 
            variant="body" 
            style={[
              styles.lastMessage, 
              { 
                color: unreadCount > 0 ? colors.text : colors.textSecondary,
                fontWeight: unreadCount > 0 ? '500' : 'normal'
              }
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage ? truncateMessage(chat.lastMessage) : t('chatListItem.emptyMessage')}
          </Text>
        </View>

        {chat.foodName && (
          <View style={styles.foodInfo}>
            <Text variant="caption" style={{ color: colors.primary }} numberOfLines={1}>
              🍽️ {chat.foodName}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.indicator}>
        {chat.lastMessageSender === currentUserId && (
          <Text variant="caption" style={{ color: colors.textSecondary }}>
            ✓
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  foodInfo: {
    marginTop: 4,
  },
  indicator: {
    marginLeft: Spacing.sm,
    width: 20,
    alignItems: 'center',
  },
});








