import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Mock buyer chat data (as a buyer, chatting with sellers)
const BUYER_CHATS = [
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
];

// Mock seller chat data (as a seller, chatting with buyers)
const SELLER_CHATS = [
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
];

export const ChatList: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userData } = useAuth();

  // Determine which chats to show based on user type
  const getChats = () => {
    if (userData?.userType === 'seller') {
      return SELLER_CHATS;
    } else if (userData?.userType === 'both') {
      // If user is both buyer and seller, merge and sort by timestamp
      const combinedChats = [...BUYER_CHATS, ...SELLER_CHATS]
        .sort((a, b) => {
          // Sort by unread status first (unread first), then by timestamp
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          
          // Simple timestamp sorting (newer first)
          if (a.timestamp === 'Dün') return 1;
          if (b.timestamp === 'Dün') return -1;
          
          const timeA = a.timestamp.includes(':') ? 
            parseInt(a.timestamp.split(':')[0]) * 60 + parseInt(a.timestamp.split(':')[1]) : 0;
          const timeB = b.timestamp.includes(':') ? 
            parseInt(b.timestamp.split(':')[0]) * 60 + parseInt(b.timestamp.split(':')[1]) : 0;
          
          return timeB - timeA; // Newer first
        });
      return combinedChats;
    } else {
      return BUYER_CHATS;
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

  const getTopBarTitle = () => {
    if (userData?.userType === 'both') {
      return 'Mesajlar (Alıcı & Satıcı)';
    } else if (userData?.userType === 'seller') {
      return 'Mesajlar (Satıcı)';
    } else {
      return 'Mesajlar (Alıcı)';
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
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {chats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              Mesaj Yok
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              Sipariş verdiğinde satıcılarla buradan mesajlaşabilirsin.
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
                            ? `${(chat as any).customerName} • Sipariş: ${chat.orderId}`
                            : `${(chat as any).cookName} • Sipariş: ${chat.orderId}`
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
                              {chat.userType === 'seller' ? 'Satıcı' : 'Alıcı'}
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







