import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Input, Button } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from '../../../hooks/useTranslation';

const getMockMessages = (language: 'tr' | 'en') => {
  if (language === 'tr') {
    return [
      {
        id: '1',
        type: 'system',
        content: 'Sipariş onaylandı ve hazırlanmaya başlandı.',
        timestamp: '14:00',
      },
      {
        id: '2',
        type: 'seller',
        content: 'Merhaba! Siparişinizi aldım, yaklaşık 30 dakika içinde hazır olacak.',
        timestamp: '14:05',
      },
      {
        id: '3',
        type: 'buyer',
        content: 'Teşekkür ederim, bekliyorum.',
        timestamp: '14:06',
      },
      {
        id: '4',
        type: 'system',
        content: 'Yemek hazırlanıyor.',
        timestamp: '14:15',
      },
      {
        id: '5',
        type: 'seller',
        content: 'Yemeğiniz 15 dakika içinde hazır olacak.',
        timestamp: '14:30',
      },
    ];
  }

  return [
    {
      id: '1',
      type: 'system',
      content: 'Order approved and preparation started.',
      timestamp: '14:00',
    },
    {
      id: '2',
      type: 'seller',
      content: 'Hi! I received your order, it will be ready in about 30 minutes.',
      timestamp: '14:05',
    },
    {
      id: '3',
      type: 'buyer',
      content: 'Thank you, I am waiting.',
      timestamp: '14:06',
    },
    {
      id: '4',
      type: 'system',
      content: 'Meal is being prepared.',
      timestamp: '14:15',
    },
    {
      id: '5',
      type: 'seller',
      content: 'Your meal will be ready in 15 minutes.',
      timestamp: '14:30',
    },
  ];
};

const getQuickReplies = (language: 'tr' | 'en') => (
  language === 'tr'
    ? ['Ne zaman hazır olur?', 'Yoldayım', 'Geldim', 'Teşekkür ederim']
    : ['When will it be ready?', 'On my way', 'I arrived', 'Thank you']
);

export const ChatDetail: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(getMockMessages(currentLanguage));
  const quickReplies = getQuickReplies(currentLanguage);

  const foodName = params.foodName as string;
  const orderStatus = params.orderStatus as string;

  React.useEffect(() => {
    setMessages(getMockMessages(currentLanguage));
  }, [currentLanguage]);

  const sendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'buyer' as const,
      content,
      timestamp: new Date().toLocaleTimeString(currentLanguage === 'en' ? 'en-GB' : 'tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message.trim());
    }
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleBackPress = () => {
    console.log('Back button pressed from ChatDetail');
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('chatListScreen.statuses.preparing'):
        return colors.warning;
      case t('chatListScreen.statuses.ready'):
        return colors.success;
      case t('chatListScreen.statuses.onTheWay'):
        return colors.info;
      case t('chatListScreen.statuses.delivered'):
        return colors.textSecondary;
      case t('chatListScreen.statuses.awaitingApproval'):
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const renderMessage = (msg: typeof MOCK_MESSAGES[0]) => {
    if (msg.type === 'system') {
      return (
        <View key={msg.id} style={styles.systemMessageContainer}>
          <View style={[styles.systemMessage, { backgroundColor: colors.surface }]}>
            <Text variant="caption" center color="textSecondary">
              {msg.content}
            </Text>
            <Text variant="caption" center color="textSecondary" style={styles.systemTimestamp}>
              {msg.timestamp}
            </Text>
          </View>
        </View>
      );
    }

    const isFromBuyer = msg.type === 'buyer';
    return (
      <View key={msg.id} style={[
        styles.messageContainer,
        isFromBuyer ? styles.buyerMessage : styles.sellerMessage
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isFromBuyer ? colors.primary : colors.surface,
          }
        ]}>
          <Text 
            variant="body" 
            style={{ 
              color: isFromBuyer ? 'white' : colors.text 
            }}
          >
            {msg.content}
          </Text>
          <Text 
            variant="caption" 
            style={[
              styles.messageTimestamp,
              { 
                color: isFromBuyer ? 'rgba(255,255,255,0.8)' : colors.textSecondary 
              }
            ]}
          >
            {msg.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={foodName || t('chatDetailScreen.titleFallback')}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          orderStatus ? (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
              <Text variant="caption" style={{ color: 'white' }}>
                {orderStatus}
              </Text>
            </View>
          ) : null
        }
      />
      
      <ScrollView 
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Quick Replies */}
      <View style={[styles.quickRepliesContainer, { backgroundColor: colors.background }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesContent}
        >
          {quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleQuickReply(reply)}
              style={[styles.quickReplyButton, { backgroundColor: colors.surface }]}
            >
              <Text variant="caption" color="primary">
                {reply}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Message Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Input
              value={message}
              onChangeText={setMessage}
              placeholder={t('chatDetailScreen.placeholder')}
              style={styles.messageInput}
              containerStyle={styles.inputContainerStyle}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[styles.sendButton, { backgroundColor: message.trim() ? colors.primary : colors.border }]}
            disabled={!message.trim()}
            activeOpacity={0.7}
          >
            <FontAwesome 
              name="send" 
              size={16} 
              color={message.trim() ? 'white' : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  systemMessage: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: commonStyles.borderRadius.md,
    maxWidth: '80%',
  },
  systemTimestamp: {
    marginTop: Spacing.xs,
  },
  messageContainer: {
    marginVertical: Spacing.xs,
  },
  buyerMessage: {
    alignItems: 'flex-end',
  },
  sellerMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: commonStyles.borderRadius.md,
  },
  messageTimestamp: {
    marginTop: Spacing.xs,
    fontSize: 10,
  },
  quickRepliesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingVertical: Spacing.sm,
  },
  quickRepliesContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  quickReplyButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: commonStyles.borderRadius.full,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 40,
    maxHeight: 100,
  },
  messageInput: {
    minHeight: 24,
    maxHeight: 80,
    paddingVertical: 0,
    fontSize: 16,
  },
  inputContainerStyle: {
    marginBottom: 0,
    backgroundColor: 'transparent',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
});



