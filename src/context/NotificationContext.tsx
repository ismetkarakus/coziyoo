import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  isInitialized: boolean;
  expoPushToken: string | null;
  fcmToken: string | null;
  sendOrderNotification: (orderId: string, status: string, buyerName: string, foodName: string) => Promise<void>;
  sendMessageNotification: (senderName: string, message: string, chatId: string) => Promise<void>;
  sendLowStockNotification: (foodName: string, currentStock: number) => Promise<void>;
  subscribeToTopic: (topic: string) => Promise<void>;
  unsubscribeFromTopic: (topic: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('🔕 Notifications temporarily disabled for testing');
      // Geçici olarak notification'ları devre dışı bırak
      setIsInitialized(true); // UI'nin çalışması için true yap
      return;
      
      // const success = await notificationService.initialize();
      // if (success) {
      //   const tokens = notificationService.getTokens();
      //   setExpoPushToken(tokens.expoPushToken);
      //   setFcmToken(tokens.fcmToken);
      //   setIsInitialized(true);

      //   // Setup message handlers
      //   const unsubscribeForeground = notificationService.setupForegroundHandler();
      //   notificationService.setupBackgroundHandler();

      //   // Subscribe to user-specific topics if logged in
      //   if (user) {
      //     await notificationService.subscribeToTopic(`user_${user.uid}`);
      //     // Subscribe to role-specific topics
      //     await notificationService.subscribeToTopic('all_users');
      //   }

      //   return () => {
      //     unsubscribeForeground();
      //   };
      // }
    };

    initializeNotifications();
  }, [user]);

  // Handle notification taps
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'order_update' && data?.orderId) {
        // Navigate to order details
        router.push(`/order-detail?id=${data.orderId}`);
      } else if (data?.type === 'new_message' && data?.chatId) {
        // Navigate to chat
        router.push(`/chat?id=${data.chatId}`);
      } else if (data?.type === 'low_stock') {
        // Navigate to seller dashboard
        router.push('/(seller)/dashboard');
      }
    });

    return () => subscription.remove();
  }, []);

  const sendOrderNotification = async (orderId: string, status: string, buyerName: string, foodName: string) => {
    await notificationService.sendOrderNotification(orderId, status, buyerName, foodName);
  };

  const sendMessageNotification = async (senderName: string, message: string, chatId: string) => {
    await notificationService.sendMessageNotification(senderName, message, chatId);
  };

  const sendLowStockNotification = async (foodName: string, currentStock: number) => {
    await notificationService.sendLowStockNotification(foodName, currentStock);
  };

  const subscribeToTopic = async (topic: string) => {
    await notificationService.subscribeToTopic(topic);
  };

  const unsubscribeFromTopic = async (topic: string) => {
    await notificationService.unsubscribeFromTopic(topic);
  };

  return (
    <NotificationContext.Provider
      value={{
        isInitialized,
        expoPushToken,
        fcmToken,
        sendOrderNotification,
        sendMessageNotification,
        sendLowStockNotification,
        subscribeToTopic,
        unsubscribeFromTopic,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
