import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, PanResponder } from 'react-native';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { Text } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing, commonStyles } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../context/AuthContext';
import { getSyncedOrderStatus, setSyncedOrderStatus, SyncedOrderStatusKey } from '../../../utils/orderStatusSync';

type ChatRole = 'buyer' | 'seller';
type ChatMessageType = 'system' | ChatRole;
type StatusKey = 'preparing' | 'ready' | 'onTheWay' | 'delivered';

interface MockMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: string;
}

const getMockMessages = (language: 'tr' | 'en'): MockMessage[] => {
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

const getQuickReplies = (language: 'tr' | 'en', role: ChatRole): string[] => {
  if (language === 'tr') {
    return role === 'seller'
      ? ['Siparişinizi onayladım.', 'Şu an hazırlanıyor.', 'Tahmini 15 dakika içinde hazır.', 'Siparişiniz hazır, teslim alabilirsiniz.', 'Teslim edildi.']
      : ['Ne zaman hazır olur?', 'Tahmini kaç dakika kaldı?', 'Adresi tekrar paylaşır mısınız?', 'Yoldayım, birazdan oradayım.', 'Kapıya geldim.'];
  }

  return role === 'seller'
    ? ['Order is approved.', 'Preparing now.', 'Estimated 15 minutes.', 'Your order is ready for pickup.', 'Delivered.']
    : ['When will it be ready?', 'How many minutes left?', 'Can you share the address again?', 'I am on my way.', 'I arrived at the door.'];
};

const getStatusOptions = (language: 'tr' | 'en'): Array<{ key: StatusKey; label: string }> => {
  if (language === 'tr') {
    return [
      { key: 'preparing', label: 'Hazırlanıyor' },
      { key: 'ready', label: 'Hazır' },
      { key: 'onTheWay', label: 'Yolda' },
      { key: 'delivered', label: 'Teslim Edildi' },
    ];
  }

  return [
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'onTheWay', label: 'On The Way' },
    { key: 'delivered', label: 'Delivered' },
  ];
};

const getSystemStatusMessage = (language: 'tr' | 'en', status: StatusKey): string => {
  if (language === 'tr') {
    switch (status) {
      case 'preparing':
        return 'Siparişiniz hazırlanmaya başlandı.';
      case 'ready':
        return 'Siparişiniz hazır.';
      case 'onTheWay':
        return 'Siparişiniz yola çıktı.';
      case 'delivered':
        return 'Siparişiniz teslim edildi.';
      default:
        return 'Sipariş durumu güncellendi.';
    }
  }

  switch (status) {
    case 'preparing':
      return 'Your order is now being prepared.';
    case 'ready':
      return 'Your order is ready.';
    case 'onTheWay':
      return 'Your order is on the way.';
    case 'delivered':
      return 'Your order has been delivered.';
    default:
      return 'Order status updated.';
  }
};

const getStatusLabelByKey = (language: 'tr' | 'en', statusKey: StatusKey): string => {
  const options = getStatusOptions(language);
  const match = options.find((item) => item.key === statusKey);
  return match?.label ?? options[0].label;
};

export const ChatDetail: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const { userData } = useAuth();
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const rawRoleParam = params.type;
  const roleParam = Array.isArray(rawRoleParam) ? rawRoleParam[0] : rawRoleParam;
  const roleFromUser: ChatRole = userData?.userType === 'seller' ? 'seller' : 'buyer';
  const role: ChatRole = roleParam === 'seller' || roleFromUser === 'seller' ? 'seller' : 'buyer';
  const [messages, setMessages] = useState<MockMessage[]>(getMockMessages(currentLanguage));
  const [currentStatus, setCurrentStatus] = useState((params.orderStatus as string) || '');
  const quickReplies = getQuickReplies(currentLanguage, role);
  const statusOptions = getStatusOptions(currentLanguage);

  const foodName = params.foodName as string;
  const orderStatus = currentStatus;
  const orderId = (Array.isArray(params.orderId) ? params.orderId[0] : params.orderId) ?? '';
  const returnToParam = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const swipeToSellerProfileResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 40 &&
          Math.abs(gestureState.dy) < 25 &&
          Math.abs(gestureState.vx) > 0.2,
        onPanResponderRelease: (_, gestureState) => {
          const isHorizontalSwipe =
            Math.abs(gestureState.dx) > 90 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;

          if (isHorizontalSwipe) {
            router.replace('/(seller)/seller-panel');
          }
        },
      }),
    []
  );

  React.useEffect(() => {
    setMessages(getMockMessages(currentLanguage));
  }, [currentLanguage]);

  React.useEffect(() => {
    setCurrentStatus((params.orderStatus as string) || '');
  }, [params.orderStatus]);

  React.useEffect(() => {
    const loadSyncedStatus = async () => {
      if (!orderId) return;
      try {
        const synced = await getSyncedOrderStatus(orderId);
        if (!synced) return;
        setCurrentStatus(getStatusLabelByKey(currentLanguage, synced.statusKey));
      } catch (error) {
        console.error('Failed to load synced chat status:', error);
      }
    };

    loadSyncedStatus();
  }, [currentLanguage, orderId]);

  const sendMessage = (content: string) => {
    const newMessage: MockMessage = {
      id: Date.now().toString(),
      type: role,
      content,
      timestamp: new Date().toLocaleTimeString(currentLanguage === 'en' ? 'en-GB' : 'tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const handleStatusUpdate = async (status: StatusKey, statusLabel: string) => {
    setCurrentStatus(statusLabel);

    if (orderId) {
      try {
        await setSyncedOrderStatus(orderId, status as SyncedOrderStatusKey);
      } catch (error) {
        console.error('Failed to persist chat status update:', error);
      }
    }

    const systemMessage: MockMessage = {
      id: `status-${Date.now()}`,
      type: 'system',
      content: getSystemStatusMessage(currentLanguage, status),
      timestamp: new Date().toLocaleTimeString(currentLanguage === 'en' ? 'en-GB' : 'tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleBackPress = () => {
    console.log('Back button pressed from ChatDetail');
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    if (typeof returnToParam === 'string' && returnToParam.length > 0) {
      router.replace(returnToParam as any);
      return;
    }
    router.replace((role === 'seller' ? '/(seller)/messages' : '/(buyer)/messages') as any);
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

  const renderMessage = (msg: MockMessage) => {
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
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...swipeToSellerProfileResponder.panHandlers}
    >
      <TopBar 
        title={foodName || t('chatDetailScreen.titleFallback')}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      {orderStatus ? (
        <View style={[styles.orderStatusRow, { backgroundColor: colors.background }]}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderStatus) }]}>
            <Text variant="caption" style={styles.statusBadgeText} numberOfLines={1}>
              {orderStatus}
            </Text>
          </View>
        </View>
      ) : null}
      {role === 'seller' ? (
        <View style={[styles.statusActionsContainer, { backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusActionsContent}
          >
            {statusOptions.map((statusOption) => {
              const isActive = orderStatus === statusOption.label;
              return (
                <TouchableOpacity
                  key={statusOption.key}
                  onPress={() => handleStatusUpdate(statusOption.key, statusOption.label)}
                  style={[
                    styles.statusActionButton,
                    {
                      backgroundColor: isActive ? colors.success : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text variant="caption" style={{ color: isActive ? 'white' : colors.text }}>
                    {statusOption.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
      
      <ScrollView 
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Quick Replies */}
      <View style={[styles.quickRepliesContainer, { backgroundColor: colors.background }]}>
        <Text variant="caption" color="textSecondary" style={styles.quickRepliesTitle}>
          {role === 'seller'
            ? (currentLanguage === 'tr' ? 'Satıcı sabit mesajları' : 'Seller quick messages')
            : (currentLanguage === 'tr' ? 'Alıcı sabit mesajları' : 'Buyer quick messages')}
        </Text>
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

      <View style={[styles.fixedInfoContainer, { backgroundColor: colors.background }]}>
        <Text variant="caption" color="textSecondary" center>
          {currentLanguage === 'tr' ? 'Sabit mesajlardan birini seçerek gönderin.' : 'Send one of the predefined messages.'}
        </Text>
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
    maxWidth: '60%',
  },
  statusBadgeText: {
    color: 'white',
  },
  orderStatusRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'flex-end',
  },
  statusActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  statusActionsContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  statusActionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: commonStyles.borderRadius.full,
    borderWidth: 1,
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
  quickRepliesTitle: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
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
  fixedInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: Spacing.md,
  },
});
