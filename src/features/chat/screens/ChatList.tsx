import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const getMockChats = (language: 'tr' | 'en') => {
  if (language === 'tr') {
    return {
      buyerChats: [
        {
          id: '1',
          foodName: 'Ev Yapımı Mantı',
          cookName: 'Ayşe Hanım',
          orderStatus: 'Hazırlanıyor',
          lastMessage: 'Yemeğiniz 15 dakika içinde hazır olacak.',
          timestamp: '14:30',
          unreadCount: 2,
          orderId: 'ORD-001',
          userType: 'buyer',
        },
        {
          id: '2',
          foodName: 'Karnıyarık',
          cookName: 'Fatma Teyze',
          orderStatus: 'Hazır',
          lastMessage: 'Yemeğiniz hazır, gel al yapabilirsiniz.',
          timestamp: '13:45',
          unreadCount: 1,
          orderId: 'ORD-002',
          userType: 'buyer',
        },
        {
          id: '3',
          foodName: 'Ev Böreği',
          cookName: 'Zehra Hanım',
          orderStatus: 'Teslim Edildi',
          lastMessage: 'Teşekkür ederim, çok lezzetliydi!',
          timestamp: 'Dün',
          unreadCount: 0,
          orderId: 'ORD-003',
          userType: 'buyer',
        },
      ],
      sellerChats: [
        {
          id: '4',
          foodName: 'Ev Yapımı Mantı',
          customerName: 'Ahmet Yılmaz',
          orderStatus: 'Hazırlanıyor',
          lastMessage: 'Ne zaman hazır olur?',
          timestamp: '14:25',
          unreadCount: 1,
          orderId: 'ORD-004',
          userType: 'seller',
        },
        {
          id: '5',
          foodName: 'Karnıyarık',
          customerName: 'Zeynep Kaya',
          orderStatus: 'Onay Bekliyor',
          lastMessage: 'Siparişimi onaylayabilir misiniz?',
          timestamp: '13:50',
          unreadCount: 2,
          orderId: 'ORD-005',
          userType: 'seller',
        },
        {
          id: '6',
          foodName: 'Baklava',
          customerName: 'Can Demir',
          orderStatus: 'Teslim Edildi',
          lastMessage: 'Çok lezzetliydi, teşekkürler!',
          timestamp: '12:30',
          unreadCount: 0,
          orderId: 'ORD-006',
          userType: 'seller',
        },
      ],
    };
  }

  return {
    buyerChats: [
      {
        id: '1',
        foodName: 'Homemade Manti',
        cookName: 'Ayse Hanim',
        orderStatus: 'Preparing',
        lastMessage: 'Your meal will be ready in 15 minutes.',
        timestamp: '14:30',
        unreadCount: 2,
        orderId: 'ORD-001',
        userType: 'buyer',
      },
      {
        id: '2',
        foodName: 'Stuffed Eggplant',
        cookName: 'Fatma Teyze',
        orderStatus: 'Ready',
        lastMessage: 'Your meal is ready, you can pick it up.',
        timestamp: '13:45',
        unreadCount: 1,
        orderId: 'ORD-002',
        userType: 'buyer',
      },
      {
        id: '3',
        foodName: 'Homemade Pastry',
        cookName: 'Zehra Hanim',
        orderStatus: 'Delivered',
        lastMessage: 'Thank you, it was delicious!',
        timestamp: 'Yesterday',
        unreadCount: 0,
        orderId: 'ORD-003',
        userType: 'buyer',
      },
    ],
    sellerChats: [
      {
        id: '4',
        foodName: 'Homemade Manti',
        customerName: 'Ahmet Yilmaz',
        orderStatus: 'Preparing',
        lastMessage: 'When will it be ready?',
        timestamp: '14:25',
        unreadCount: 1,
        orderId: 'ORD-004',
        userType: 'seller',
      },
      {
        id: '5',
        foodName: 'Stuffed Eggplant',
        customerName: 'Zeynep Kaya',
        orderStatus: 'Awaiting Approval',
        lastMessage: 'Could you approve my order?',
        timestamp: '13:50',
        unreadCount: 2,
        orderId: 'ORD-005',
        userType: 'seller',
      },
      {
        id: '6',
        foodName: 'Baklava',
        customerName: 'Can Demir',
        orderStatus: 'Delivered',
        lastMessage: 'Very delicious, thank you!',
        timestamp: '12:30',
        unreadCount: 0,
        orderId: 'ORD-006',
        userType: 'seller',
      },
    ],
  };
};

export const ChatList: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userData } = useAuth();
  const { t, currentLanguage } = useTranslation();
  const { buyerChats, sellerChats } = getMockChats(currentLanguage);

  // Determine which chats to show based on user type
  const getChats = () => {
    if (userData?.userType === 'seller') {
      return sellerChats;
    } else if (userData?.userType === 'both') {
      // If user is both buyer and seller, merge and sort by timestamp
      const combinedChats = [...buyerChats, ...sellerChats]
        .sort((a, b) => {
          // Sort by unread status first (unread first), then by timestamp
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          
          // Simple timestamp sorting (newer first)
          if (a.timestamp === t('chatListScreen.timestamp.yesterday')) return 1;
          if (b.timestamp === t('chatListScreen.timestamp.yesterday')) return -1;
          
          const timeA = a.timestamp.includes(':') ? 
            parseInt(a.timestamp.split(':')[0]) * 60 + parseInt(a.timestamp.split(':')[1]) : 0;
          const timeB = b.timestamp.includes(':') ? 
            parseInt(b.timestamp.split(':')[0]) * 60 + parseInt(b.timestamp.split(':')[1]) : 0;
          
          return timeB - timeA; // Newer first
        });
      return combinedChats;
    } else {
      return buyerChats;
    }
  };

  const chats = getChats();

  const handleChatPress = (chatId: string, orderId: string, foodName: string, orderStatus: string) => {
    router.push(`/(tabs)/chat-detail?chatId=${chatId}&orderId=${orderId}&foodName=${encodeURIComponent(foodName)}&orderStatus=${encodeURIComponent(orderStatus)}`);
  };

  const handleBackPress = () => {
    console.log('Back button pressed from ChatList');
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

  const getTopBarTitle = () => {
    if (userData?.userType === 'both') {
      return t('chatListScreen.titleBoth');
    } else if (userData?.userType === 'seller') {
      return t('chatListScreen.titleSeller');
    } else {
      return t('chatListScreen.titleBuyer');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={getTopBarTitle()}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              {t('chatListScreen.emptyTitle')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              {t('chatListScreen.emptyDesc')}
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
                          {chat.userType === 'seller' 
                            ? t('chatListScreen.orderInfoSeller', { name: (chat as any).customerName, orderId: chat.orderId })
                            : t('chatListScreen.orderInfoBuyer', { name: (chat as any).cookName, orderId: chat.orderId })
                          }
                        </Text>
                        {userData?.userType === 'both' && (
                          <View style={[
                            styles.userTypeBadge,
                            {
                              backgroundColor: chat.userType === 'seller' 
                                ? colors.primary 
                                : colors.secondary
                            }
                          ]}>
                            <Text variant="caption" style={[
                              styles.userTypeBadgeText,
                              { color: 'white' }
                            ]}>
                              {chat.userType === 'seller'
                                ? t('chatListScreen.userTypes.seller')
                                : t('chatListScreen.userTypes.buyer')}
                            </Text>
                          </View>
                        )}
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
                          {chat.orderStatus}
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
  userTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  userTypeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
});




