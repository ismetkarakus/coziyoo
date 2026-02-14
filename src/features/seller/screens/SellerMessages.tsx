import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, PanResponder } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getSyncedOrderStatuses } from '../../../utils/orderStatusSync';

type SellerChatStatus = 'preparing' | 'ready' | 'onWay' | 'delivered';

export const SellerMessages: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const [chats, setChats] = React.useState<any[]>([]);
  const swipeToPanelResponder = React.useMemo(
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

  const handleBackPress = () => {
    console.log('Back button pressed from SellerMessages');
    router.replace('/(seller)/seller-panel');
  };

  const handleChatPress = (chatId: string, orderId: string, foodName: string, status: SellerChatStatus) => {
    const statusLabel = t(`sellerMessagesScreen.status.${status}`);
    router.push(
      `/(seller)/chat-detail?chatId=${chatId}&orderId=${orderId}&foodName=${encodeURIComponent(foodName)}&orderStatus=${encodeURIComponent(statusLabel)}&type=seller`
    );
  };

  const getStatusColor = (status: SellerChatStatus) => {
    switch (status) {
      case 'preparing':
        return colors.warning;
      case 'ready':
        return colors.success;
      case 'onWay':
        return colors.info;
      case 'delivered':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  const mockChats = [
    {
      id: '1',
      foodName: t('sellerMessagesScreen.mock.c1Food'),
      customerName: t('sellerMessagesScreen.mock.c1Customer'),
      orderStatus: 'preparing' as SellerChatStatus,
      lastMessage: t('sellerMessagesScreen.mock.c1Message'),
      timestamp: t('sellerMessagesScreen.mock.c1Time'),
      unreadCount: 1,
      orderId: t('sellerMessagesScreen.mock.c1OrderId'),
    },
    {
      id: '2',
      foodName: t('sellerMessagesScreen.mock.c2Food'),
      customerName: t('sellerMessagesScreen.mock.c2Customer'),
      orderStatus: 'ready' as SellerChatStatus,
      lastMessage: t('sellerMessagesScreen.mock.c2Message'),
      timestamp: t('sellerMessagesScreen.mock.c2Time'),
      unreadCount: 0,
      orderId: t('sellerMessagesScreen.mock.c2OrderId'),
    },
    {
      id: '3',
      foodName: t('sellerMessagesScreen.mock.c3Food'),
      customerName: t('sellerMessagesScreen.mock.c3Customer'),
      orderStatus: 'delivered' as SellerChatStatus,
      lastMessage: t('sellerMessagesScreen.mock.c3Message'),
      timestamp: t('sellerMessagesScreen.mock.c3Time'),
      unreadCount: 0,
      orderId: t('sellerMessagesScreen.mock.c3OrderId'),
    },
  ];

  const refreshChats = React.useCallback(async () => {
    try {
      const syncedStatuses = await getSyncedOrderStatuses();
      const nextChats = mockChats.map((chat) => {
        const synced = syncedStatuses[chat.orderId];
        if (!synced) return chat;

        const mappedStatus: SellerChatStatus =
          synced.statusKey === 'preparing'
            ? 'preparing'
            : synced.statusKey === 'ready'
              ? 'ready'
              : synced.statusKey === 'onTheWay'
                ? 'onWay'
                : 'delivered';

        return {
          ...chat,
          orderStatus: mappedStatus,
        };
      });
      setChats(nextChats);
    } catch (error) {
      console.error('Failed to load synced seller chat statuses:', error);
      setChats(mockChats);
    }
  }, [t]);

  React.useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  useFocusEffect(
    React.useCallback(() => {
      refreshChats();
    }, [refreshChats])
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...swipeToPanelResponder.panHandlers}
    >
      <TopBar 
        title={t('sellerMessagesScreen.title')}
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
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              {t('sellerMessagesScreen.emptyTitle')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              {t('sellerMessagesScreen.emptyDesc')}
            </Text>
          </View>
        ) : (
          <View style={styles.chatsContainer}>
            {chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => handleChatPress(chat.id, chat.orderId, chat.foodName, chat.orderStatus)}
                activeOpacity={0.7}
              >
                <Card variant="default" padding="md" style={styles.chatCard}>
                  <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                      <View style={styles.chatInfo}>
                        <Text variant="subheading" weight="semibold" numberOfLines={1}>
                          {chat.foodName}
                        </Text>
                        <Text variant="caption" color="textSecondary">
                          {chat.customerName} • {t('sellerMessagesScreen.orderLabel')} {chat.orderId}
                        </Text>
                      </View>
                      
                      <View style={styles.chatMeta}>
                        <Text variant="caption" color="textSecondary">
                          {chat.timestamp}
                        </Text>
                        {chat.unreadCount > 0 && (
                          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                            <Text variant="caption" style={{ color: 'white', fontSize: 10 }}>
                              {chat.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(chat.orderStatus) }]}>
                        <Text variant="caption" style={{ color: 'white' }}>
                          {t(`sellerMessagesScreen.status.${chat.orderStatus}`)}
                        </Text>
                      </View>
                    </View>
                    
                    <Text 
                      variant="body" 
                      color="textSecondary" 
                      numberOfLines={2}
                      style={styles.lastMessage}
                    >
                      {chat.lastMessage}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    marginTop: 100,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  chatsContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chatCard: {
    marginBottom: 0,
  },
  chatContent: {
    gap: Spacing.sm,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chatInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  chatMeta: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  lastMessage: {
    lineHeight: 20,
  },
});




