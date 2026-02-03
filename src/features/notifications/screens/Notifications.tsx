import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';

export const Notifications: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { userData } = useAuth();
  const { t } = useTranslation();

  const BUYER_NOTIFICATIONS = [
    {
      id: '1',
      title: t('notificationsScreen.buyer.n1Title'),
      message: t('notificationsScreen.buyer.n1Message'),
      time: t('notificationsScreen.buyer.n1Time'),
      type: 'order',
      read: false,
    },
    {
      id: '2',
      title: t('notificationsScreen.buyer.n2Title'),
      message: t('notificationsScreen.buyer.n2Message'),
      time: t('notificationsScreen.buyer.n2Time'),
      type: 'order',
      read: false,
    },
    {
      id: '3',
      title: t('notificationsScreen.buyer.n3Title'),
      message: t('notificationsScreen.buyer.n3Message'),
      time: t('notificationsScreen.buyer.n3Time'),
      type: 'order',
      read: true,
    },
    {
      id: '4',
      title: t('notificationsScreen.buyer.n4Title'),
      message: t('notificationsScreen.buyer.n4Message'),
      time: t('notificationsScreen.buyer.n4Time'),
      type: 'order',
      read: true,
    },
    {
      id: '5',
      title: t('notificationsScreen.buyer.n5Title'),
      message: t('notificationsScreen.buyer.n5Message'),
      time: t('notificationsScreen.buyer.n5Time'),
      type: 'delivery',
      read: true,
    },
    {
      id: '6',
      title: t('notificationsScreen.buyer.n6Title'),
      message: t('notificationsScreen.buyer.n6Message'),
      time: t('notificationsScreen.buyer.n6Time'),
      type: 'delivery',
      read: true,
    },
    {
      id: '7',
      title: t('notificationsScreen.buyer.n7Title'),
      message: t('notificationsScreen.buyer.n7Message'),
      time: t('notificationsScreen.buyer.n7Time'),
      type: 'review',
      read: true,
    },
  ];

  const SELLER_NOTIFICATIONS = [
    {
      id: '1',
      title: t('notificationsScreen.seller.n1Title'),
      message: t('notificationsScreen.seller.n1Message'),
      time: t('notificationsScreen.seller.n1Time'),
      type: 'order',
      read: false,
    },
    {
      id: '2',
      title: t('notificationsScreen.seller.n2Title'),
      message: t('notificationsScreen.seller.n2Message'),
      time: t('notificationsScreen.seller.n2Time'),
      type: 'order',
      read: false,
    },
    {
      id: '3',
      title: t('notificationsScreen.seller.n3Title'),
      message: t('notificationsScreen.seller.n3Message'),
      time: t('notificationsScreen.seller.n3Time'),
      type: 'payment',
      read: true,
    },
    {
      id: '4',
      title: t('notificationsScreen.seller.n4Title'),
      message: t('notificationsScreen.seller.n4Message'),
      time: t('notificationsScreen.seller.n4Time'),
      type: 'delivery',
      read: true,
    },
    {
      id: '5',
      title: t('notificationsScreen.seller.n5Title'),
      message: t('notificationsScreen.seller.n5Message'),
      time: t('notificationsScreen.seller.n5Time'),
      type: 'review',
      read: true,
    },
    {
      id: '6',
      title: t('notificationsScreen.seller.n6Title'),
      message: t('notificationsScreen.seller.n6Message'),
      time: t('notificationsScreen.seller.n6Time'),
      type: 'stock',
      read: true,
    },
    {
      id: '7',
      title: t('notificationsScreen.seller.n7Title'),
      message: t('notificationsScreen.seller.n7Message'),
      time: t('notificationsScreen.seller.n7Time'),
      type: 'earnings',
      read: true,
    },
  ];

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
      return t('notificationsScreen.titleBoth');
    } else if (userData?.userType === 'seller') {
      return t('notificationsScreen.titleSeller');
    } else {
      return t('notificationsScreen.titleBuyer');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title={getTopBarTitle()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="heading" center>
              {t('notificationsScreen.emptyTitle')}
            </Text>
            <Text variant="body" center color="textSecondary" style={styles.emptyText}>
              {t('notificationsScreen.emptyDesc')}
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
                            {SELLER_NOTIFICATIONS.includes(notification) ? t('notificationsScreen.badgeSeller') : t('notificationsScreen.badgeBuyer')}
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














