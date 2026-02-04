import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';
const Notifications: typeof ExpoNotifications | null = isWeb ? null : require('expo-notifications');

// Configure notification behavior
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private fcmToken: string | null = null;
  private languageStorageKey = 'userLanguage';

  private async getLanguage(): Promise<'tr' | 'en'> {
    try {
      const stored = await AsyncStorage.getItem(this.languageStorageKey);
      return stored === 'en' ? 'en' : 'tr';
    } catch {
      return 'tr';
    }
  }

  // Initialize notification service
  async initialize() {
    try {
      if (!Notifications) {
        console.warn('Notifications are not supported on web');
        return false;
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Get Expo push token (works with Expo)
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      console.log('Expo Push Token:', token);

      // For Expo projects, we use Expo push token instead of FCM
      this.fcmToken = token;

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Get current push tokens
  getTokens() {
    return {
      expoPushToken: this.expoPushToken,
      fcmToken: this.fcmToken,
    };
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData) {
    try {
      if (!Notifications) {
        console.warn('Local notifications are not supported on web');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Handle foreground messages (Expo notifications)
  setupForegroundHandler() {
    if (!Notifications) {
      return { remove: () => {} };
    }

    return Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification received:', notification);
      // Notification is automatically shown by Expo
    });
  }

  // Handle background messages (Expo notifications)
  setupBackgroundHandler() {
    if (!Notifications) {
      return { remove: () => {} };
    }

    return Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Background notification response:', response);
      // Handle notification tap
    });
  }

  // Subscribe to topic (Expo push notifications)
  async subscribeToTopic(topic: string) {
    try {
      // In Expo, topics are handled differently
      // You would typically send the token to your server
      // and manage subscriptions server-side
      console.log(`Topic subscription for ${topic} would be handled server-side`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  // Unsubscribe from topic (Expo push notifications)
  async unsubscribeFromTopic(topic: string) {
    try {
      console.log(`Topic unsubscription for ${topic} would be handled server-side`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

  // Send notification for order status updates
  async sendOrderNotification(orderId: string, status: string, buyerName: string, foodName: string) {
    const language = await this.getLanguage();
    const notifications = language === 'en'
      ? {
          pending_seller_approval: {
            title: '🍽️ New Order!',
            body: `${buyerName} placed an order for "${foodName}". Awaiting your approval.`,
          },
          approved: {
            title: '✅ Order Approved!',
            body: `Your "${foodName}" order was approved. Preparing...`,
          },
          preparing: {
            title: '👨‍🍳 Preparing',
            body: `Your "${foodName}" order is being prepared.`,
          },
          ready: {
            title: '🎉 Order Ready!',
            body: `Your "${foodName}" order is ready. You can pick it up.`,
          },
          completed: {
            title: '✨ Order Completed',
            body: `Your "${foodName}" order was delivered. Enjoy!`,
          },
          cancelled: {
            title: '❌ Order Cancelled',
            body: `Your "${foodName}" order was cancelled.`,
          },
        }
      : {
          pending_seller_approval: {
            title: '🍽️ Yeni Sipariş!',
            body: `${buyerName} "${foodName}" için sipariş verdi. Onayınızı bekliyor.`,
          },
          approved: {
            title: '✅ Sipariş Onaylandı!',
            body: `"${foodName}" siparişiniz onaylandı. Hazırlanıyor...`,
          },
          preparing: {
            title: '👨‍🍳 Hazırlanıyor',
            body: `"${foodName}" siparişiniz hazırlanıyor.`,
          },
          ready: {
            title: '🎉 Sipariş Hazır!',
            body: `"${foodName}" siparişiniz hazır. Teslim alabilirsiniz.`,
          },
          completed: {
            title: '✨ Sipariş Tamamlandı',
            body: `"${foodName}" siparişiniz teslim edildi. Afiyet olsun!`,
          },
          cancelled: {
            title: '❌ Sipariş İptal Edildi',
            body: `"${foodName}" siparişiniz iptal edildi.`,
          },
        };

    const notification = notifications[status as keyof typeof notifications];
    if (notification) {
      await this.sendLocalNotification({
        ...notification,
        data: { orderId, status, type: 'order_update' },
      });
    }
  }

  // Send notification for new messages
  async sendMessageNotification(senderName: string, message: string, chatId: string) {
    await this.sendLocalNotification({
      title: `💬 ${senderName}`,
      body: message,
      data: { chatId, type: 'new_message' },
    });
  }

  // Send notification for low stock
  async sendLowStockNotification(foodName: string, currentStock: number) {
    const language = await this.getLanguage();
    await this.sendLocalNotification({
      title: language === 'en' ? '⚠️ Low Stock' : '⚠️ Stok Azalıyor',
      body: language === 'en'
        ? `Only ${currentStock} left for "${foodName}"!`
        : `"${foodName}" için sadece ${currentStock} adet kaldı!`,
      data: { type: 'low_stock', foodName, currentStock },
    });
  }
}

export const notificationService = new NotificationService();
