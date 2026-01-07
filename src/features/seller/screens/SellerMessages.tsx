import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Mock seller chat data - satıcı perspektifinden mesajlar
const MOCK_SELLER_CHATS = [
  {
    id: '1',
    foodName: 'Ev Yapımı Mantı',
    customerName: 'Ahmet Y.',
    orderStatus: 'Hazırlanıyor',
    lastMessage: 'Ne zaman hazır olur?',
    timestamp: '14:30',
    unreadCount: 1,
    orderId: 'ORD-001',
  },
  {
    id: '2',
    foodName: 'Karnıyarık',
    customerName: 'Zeynep M.',
    orderStatus: 'Hazır',
    lastMessage: 'Teşekkür ederim, geliyorum.',
    timestamp: '13:45',
    unreadCount: 0,
    orderId: 'ORD-002',
  },
  {
    id: '3',
    foodName: 'Ev Böreği',
    customerName: 'Can K.',
    orderStatus: 'Teslim Edildi',
    lastMessage: 'Çok lezzetliydi, teşekkürler!',
    timestamp: 'Dün',
    unreadCount: 0,
    orderId: 'ORD-003',
  },
];

export const SellerMessages: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleBackPress = () => {
    console.log('Back button pressed from SellerMessages');
    router.back();
  };

  const handleChatPress = (chatId: string, orderId: string, foodName: string, orderStatus: string) => {
    router.push(`/(tabs)/chat-detail?chatId=${chatId}&orderId=${orderId}&foodName=${encodeURIComponent(foodName)}&orderStatus=${encodeURIComponent(orderStatus)}`);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Müşteri Mesajları"
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
        {MOCK_SELLER_CHATS.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              Mesaj Yok
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              Müşterilerden gelen mesajlar burada görünecek.
            </Text>
          </View>
        ) : (
          <View style={styles.chatsContainer}>
            {MOCK_SELLER_CHATS.map((chat) => (
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
                          {chat.customerName} • Sipariş: {chat.orderId}
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


