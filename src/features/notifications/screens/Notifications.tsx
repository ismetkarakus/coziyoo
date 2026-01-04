import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock notifications data
const MOCK_NOTIFICATIONS = [
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

export const Notifications: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📋';
      case 'delivery':
        return '🚗';
      case 'review':
        return '⭐';
      default:
        return '📱';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar title="Bildirimler" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {MOCK_NOTIFICATIONS.length === 0 ? (
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
            {MOCK_NOTIFICATIONS.map((notification) => (
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
});


