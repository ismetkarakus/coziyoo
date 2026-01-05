import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, Input, Button } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock messages data
const MOCK_MESSAGES = [
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

const QUICK_REPLIES = [
  'Ne zaman hazır olur?',
  'Yoldayım',
  'Geldim',
  'Teşekkür ederim',
];

export const ChatDetail: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const foodName = params.foodName as string;
  const orderStatus = params.orderStatus as string;

  const sendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'buyer' as const,
      content,
      timestamp: new Date().toLocaleTimeString('tr-TR', { 
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hazırlanıyor':
        return colors.warning;
      case 'Hazır':
        return colors.success;
      case 'Yolda':
        return colors.info;
      case 'Teslim Edildi':
        return colors.textSecondary;
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
        title={foodName}
        rightComponent={
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
            <Text variant="caption" style={{ color: 'white' }}>
              {orderStatus}
            </Text>
          </View>
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
          {QUICK_REPLIES.map((reply, index) => (
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
          <Input
            value={message}
            onChangeText={setMessage}
            placeholder="Mesaj yazın..."
            style={styles.messageInput}
            containerStyle={styles.inputContainerStyle}
          />
          <Button
            variant="primary"
            onPress={handleSendMessage}
            style={styles.sendButton}
          >
            Gönder
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  messageInput: {
    flex: 1,
  },
  inputContainerStyle: {
    marginBottom: 0,
  },
  sendButton: {
    minWidth: 80,
  },
});






