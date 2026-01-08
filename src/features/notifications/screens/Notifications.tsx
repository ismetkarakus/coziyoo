import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';

// Mock buyer notifications data
const BUYER_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Siparişin Alındı! 🎉',
    message: 'Ev Yapımı Mantı siparişin Ayşe Hanım tarafından alındı.',
    time: '2 dakika önce',
    type: 'order',
    read: false,
  },
  {
    id: '2',
    title: 'Satıcı Onayladı ✅',
    message: 'Siparişin onaylandı ve hazırlanmaya başlandı.',
    time: '15 dakika önce',
    type: 'order',
    read: false,
  },
  {
    id: '3',
    title: 'Hazırlanıyor 👨‍🍳',
    message: 'Yemeğin hazırlanıyor. Tahmini süre: 20 dakika.',
    time: '25 dakika önce',
    type: 'order',
    read: true,
  },
  {
    id: '4',
    title: 'Hazır! 🍽️',
    message: 'Yemeğin hazır. Gel al için bekliyor.',
    time: '1 saat önce',
    type: 'order',
    read: true,
  },
  {
    id: '5',
    title: 'Yolda 🚗',
    message: 'Siparişin teslimat için yola çıktı.',
    time: '2 saat önce',
    type: 'delivery',
    read: true,
  },
  {
    id: '6',
    title: 'Teslim Edildi ✨',
    message: 'Siparişin başarıyla teslim edildi. Afiyet olsun!',
    time: '3 saat önce',
    type: 'delivery',
    read: true,
  },
  {
    id: '7',
    title: 'Yemeği Puanla ⭐',
    message: 'Ev Yapımı Mantı deneyimini puanlamayı unutma.',
    time: '4 saat önce',
    type: 'review',
    read: true,
  },
];

// Mock seller notifications data
const SELLER_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Yeni Sipariş! 🛒',
    message: 'Ahmet Yılmaz Ev Yapımı Mantı için sipariş verdi.',
    time: '5 dakika önce',
    type: 'order',
    read: false,
  },
  {
    id: '2',
    title: 'Sipariş Onayı Bekleniyor ⏳',
    message: 'Zeynep Kaya\'dan gelen sipariş onayınızı bekliyor.',
    time: '20 dakika önce',
    type: 'order',
    read: false,
  },
  {
    id: '3',
    title: 'Ödeme Alındı 💰',
    message: 'Karnıyarık siparişi için ödeme başarıyla alındı.',
    time: '45 dakika önce',
    type: 'payment',
    read: true,
  },
  {
    id: '4',
    title: 'Teslimat Zamanı 🚗',
    message: 'Can Demir siparişi teslim almaya geliyor.',
    time: '1 saat önce',
    type: 'delivery',
    read: true,
  },
  {
    id: '5',
    title: 'Yeni Değerlendirme ⭐',
    message: 'Ayşe Hanım yemeğinize 5 yıldız verdi!',
    time: '2 saat önce',
    type: 'review',
    read: true,
  },
  {
    id: '6',
    title: 'Stok Azalıyor 📦',
    message: 'Baklava stokunuz 2 adet kaldı.',
    time: '3 saat önce',
    type: 'stock',
    read: true,
  },
  {
    id: '7',
    title: 'Günlük Kazanç 📊',
    message: 'Bugün 5 sipariş ile 245₺ kazandınız.',
    time: '5 saat önce',
    type: 'earnings',
    read: true,
  },
];

export const Notifications: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userData } = useAuth();

  // Determine which notifications to show based on user type
  const getNotifications = () => {
    if (userData?.userType === 'seller') {
      return SELLER_NOTIFICATIONS;
    } else if (userData?.userType === 'both') {
      // If user is both buyer and seller, merge and sort by time
      const combinedNotifications = [...BUYER_NOTIFICATIONS, ...SELLER_NOTIFICATIONS]
        .sort((a, b) => {
          // Sort by read status first (unread first), then by time
          if (a.read !== b.read) {
            return a.read ? 1 : -1;
          }
          // For time sorting, we'll use a simple approach based on the time string
          const timeA = a.time.includes('dakika') ? parseInt(a.time) : 
                       a.time.includes('saat') ? parseInt(a.time) * 60 : 999;
          const timeB = b.time.includes('dakika') ? parseInt(b.time) : 
                       b.time.includes('saat') ? parseInt(b.time) * 60 : 999;
          return timeA - timeB;
        });
      return combinedNotifications;
    } else {
      return BUYER_NOTIFICATIONS;
    }
  };

  const notifications = getNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📋';
      case 'delivery':
        return '🚗';
      case 'review':
        return '⭐';
      case 'payment':
        return '💰';
      case 'stock':
        return '📦';
      case 'earnings':
        return '📊';
      default:
        return '📱';
    }
  };

  const getTopBarTitle = () => {
    if (userData?.userType === 'both') {
      return 'Bildirimler (Alıcı & Satıcı)';
    } else if (userData?.userType === 'seller') {
      return 'Bildirimler (Satıcı)';
    } else {
      return 'Bildirimler (Alıcı)';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={getTopBarTitle()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              Bildirim Yok
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              Henüz hiç bildirimin yok.
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                variant="default" 
                padding="md" 
                style={[
                  styles.notificationCard,
                  !notification.read && { 
                    backgroundColor: colors.primary + '10',
                    borderLeftWidth: 3,
                    borderLeftColor: colors.primary,
                  }
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.titleContainer}>
                      <Text variant="caption" style={styles.notificationIcon}>
                        {getNotificationIcon(notification.type)}
                      </Text>
                      <Text 
                        variant="subheading" 
                        weight="semibold" 
                        style={styles.notificationTitle}
                        numberOfLines={1}
                      >
                        {notification.title}
                      </Text>
                      {userData?.userType === 'both' && (
                        <View style={[
                          styles.userTypeBadge,
                          {
                            backgroundColor: SELLER_NOTIFICATIONS.includes(notification) 
                              ? colors.primary 
                              : colors.secondary
                          }
                        ]}>
                          <Text variant="caption" style={[
                            styles.userTypeBadgeText,
                            { color: 'white' }
                          ]}>
                            {SELLER_NOTIFICATIONS.includes(notification) ? 'Satıcı' : 'Alıcı'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text variant="caption" color="textSecondary">
                      {notification.time}
                    </Text>
                  </View>
                  
                  <Text 
                    variant="body" 
                    color="textSecondary" 
                    style={styles.notificationMessage}
                  >
                    {notification.message}
                  </Text>
                  
                  {!notification.read && (
                    <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </Card>
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
  notificationsContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  notificationCard: {
    marginBottom: 0,
    position: 'relative',
  },
  notificationContent: {
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  notificationIcon: {
    marginRight: Spacing.sm,
    fontSize: 16,
  },
  notificationTitle: {
    flex: 1,
  },
  notificationMessage: {
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  userTypeBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
});















