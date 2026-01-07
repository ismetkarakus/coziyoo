import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, ChatBubble, ChatInput } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import { chatService, ChatMessage } from '../../../services/chatService';

export const ChatScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { sendMessageNotification } = useNotifications();
  const params = useLocalSearchParams();
  
  const chatId = params.id as string;
  const otherUserName = params.name as string;
  const userType = (params.type as string) || 'buyer';
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatId && user) {
      loadMessages();
      
      // Real-time listener
      const unsubscribe = chatService.onMessagesUpdate(chatId, (updatedMessages) => {
        setMessages(updatedMessages);
        setLoading(false);
        
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      // Mark messages as read when entering chat
      chatService.markMessagesAsRead(chatId, user.uid, userType as 'buyer' | 'seller');

      return () => unsubscribe();
    }
  }, [chatId, user, userType]);

  const loadMessages = async () => {
    if (!chatId) return;
    
    try {
      setLoading(true);
      const chatMessages = await chatService.getChatMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Hata', 'Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!user || !chatId || sending) return;
    
    try {
      setSending(true);
      
      await chatService.sendMessage(
        chatId,
        user.uid,
        user.displayName || user.email || 'Kullanıcı',
        userType as 'buyer' | 'seller',
        message
      );

      // Send notification to other user
      await sendMessageNotification(
        user.displayName || user.email || 'Kullanıcı',
        message,
        chatId
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  const handleMessagePress = (message: ChatMessage) => {
    if (message.messageType === 'order_update' && message.orderData) {
      // Navigate to order detail
      router.push(`/order-detail?id=${message.orderData.orderId}`);
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.senderId === user?.uid;
    const showSender = !isOwn && (index === 0 || messages[index - 1].senderId !== item.senderId);
    
    return (
      <View>
        {showSender && (
          <View style={styles.senderContainer}>
            <Text variant="caption" style={{ color: colors.textSecondary, marginLeft: Spacing.md }}>
              {item.senderName}
            </Text>
          </View>
        )}
        <ChatBubble
          message={item}
          isOwn={isOwn}
          onPress={item.messageType === 'order_update' ? () => handleMessagePress(item) : undefined}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text variant="heading" style={{ color: colors.textSecondary, fontSize: 48 }}>
        👋
      </Text>
      <Text variant="subheading" style={{ color: colors.text, marginTop: Spacing.md }}>
        Sohbet başlıyor
      </Text>
      <Text variant="body" style={{ color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm }}>
        {otherUserName} ile ilk mesajınızı gönderin
      </Text>
    </View>
  );

  if (!user || !chatId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TopBar 
          title="Sohbet" 
          onBack={() => router.back()}
        />
        <View style={styles.emptyContainer}>
          <Text variant="body" color="textSecondary">
            Sohbet bulunamadı
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <TopBar 
        title={otherUserName || 'Sohbet'}
        onBack={() => router.back()}
      />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id || ''}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={messages.length === 0 ? styles.emptyListContainer : styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      <ChatInput
        onSend={handleSendMessage}
        disabled={sending}
        placeholder={`${otherUserName}'e mesaj yazın...`}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyListContainer: {
    flex: 1,
  },
  senderContainer: {
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
});

