import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Card, Text, Button } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { getSyncedOrderStatus, SyncedOrderStatusKey } from '../../../utils/orderStatusSync';

export const OrderTracking: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [statusKey, setStatusKey] = useState<SyncedOrderStatusKey>('preparing');

  const orderNumberParam = Array.isArray(params.orderNumber)
    ? params.orderNumber[0]
    : params.orderNumber;
  const cookNameParam = Array.isArray(params.cookName)
    ? params.cookName[0]
    : params.cookName;
  const orderIdParam = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const getEstimatedFromStatus = (key: SyncedOrderStatusKey) => {
    if (key === 'preparing') {
      return t('orderTrackingScreen.estimatedDefault');
    }
    if (key === 'ready') {
      return t('chatListScreen.statuses.ready');
    }
    if (key === 'onTheWay') {
      return t('chatListScreen.statuses.onTheWay');
    }
    return t('chatListScreen.statuses.delivered');
  };

  const estimatedTime = getEstimatedFromStatus(statusKey);

  const trackingSteps = [
    {
      id: 1,
      title: t('orderTrackingScreen.steps.received.title'),
      description: t('orderTrackingScreen.steps.received.desc'),
      time: t('orderTrackingScreen.steps.received.time'),
      completed: true,
      active: statusKey === 'preparing',
    },
    {
      id: 2,
      title: t('orderTrackingScreen.steps.preparing.title'),
      description: t('orderTrackingScreen.steps.preparing.desc'),
      time: t('orderTrackingScreen.steps.preparing.time'),
      completed: statusKey !== 'preparing',
      active: statusKey === 'preparing',
    },
    {
      id: 3,
      title: t('orderTrackingScreen.steps.ready.title'),
      description: t('orderTrackingScreen.steps.ready.desc'),
      time: t('orderTrackingScreen.steps.ready.time'),
      completed: statusKey === 'onTheWay' || statusKey === 'delivered',
      active: statusKey === 'ready',
    },
    {
      id: 4,
      title: t('orderTrackingScreen.steps.delivered.title'),
      description: t('orderTrackingScreen.steps.delivered.desc'),
      time: t('orderTrackingScreen.steps.delivered.time'),
      completed: statusKey === 'delivered',
      active: statusKey === 'onTheWay',
    },
  ];

  // Mock order data
  const orderData = {
    orderNumber: orderNumberParam || t('orderTrackingScreen.fallbackOrderNumber'),
    cookName: cookNameParam || t('orderTrackingScreen.fallbackCookName'),
    items: [
      { name: t('orderTrackingScreen.mockItems.manti'), quantity: 2, price: 35 },
      { name: t('orderTrackingScreen.mockItems.lentilSoup'), quantity: 1, price: 15 },
    ],
    total: 85,
    deliveryType: 'pickup',
  };

  const loadStatus = React.useCallback(async () => {
    if (!orderIdParam) return;
    try {
      const synced = await getSyncedOrderStatus(orderIdParam);
      if (synced?.statusKey) {
        setStatusKey(synced.statusKey);
      }
    } catch (error) {
      console.error('Failed to load tracked order status:', error);
    }
  }, [orderIdParam]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useFocusEffect(
    React.useCallback(() => {
      loadStatus();
    }, [loadStatus])
  );

  const getStepIcon = (step: any) => {
    if (step.completed) {
      return '✅';
    } else if (step.active) {
      return '🔄';
    } else {
      return '⏳';
    }
  };

  const getStepColor = (step: any) => {
    if (step.completed) {
      return colors.success || '#10B981';
    } else if (step.active) {
      return colors.warning || '#F59E0B';
    } else {
      return colors.textSecondary;
    }
  };

  const renderTrackingStep = (step: any, index: number) => (
    <View key={step.id} style={styles.stepContainer}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepIcon, { backgroundColor: getStepColor(step) }]}>
          <Text style={styles.stepIconText}>{getStepIcon(step)}</Text>
        </View>
        {index < trackingSteps.length - 1 && (
          <View style={[styles.stepLine, { 
            backgroundColor: step.completed ? getStepColor(step) : colors.border 
          }]} />
        )}
      </View>
      
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text 
            variant="body" 
            weight="semibold"
            style={{ color: getStepColor(step) }}
          >
            {step.title}
          </Text>
          {step.time && (
            <Text variant="caption" color="textSecondary">
              {step.time}
            </Text>
          )}
        </View>
        <Text variant="caption" color="textSecondary" style={styles.stepDescription}>
          {step.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('orderTrackingScreen.title')} 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <Card variant="default" padding="md" style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text variant="subheading" weight="semibold">
              {orderData.orderNumber}
            </Text>
            <Text variant="caption" color="textSecondary">
              {orderData.cookName}
            </Text>
          </View>
          
          <View style={styles.orderItems}>
            {orderData.items.map((item, index) => (
              <Text key={index} variant="body" style={styles.orderItem}>
                {item.quantity}x {item.name}
              </Text>
            ))}
          </View>
          
          <View style={styles.orderTotal}>
            <Text variant="body" weight="semibold">
              {t('orderTrackingScreen.total')} ₺{orderData.total.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Estimated Time */}
        <Card variant="default" padding="md" style={styles.timeCard}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeIcon}>⏰</Text>
            <View style={styles.timeText}>
              <Text variant="subheading" weight="semibold">
                {t('orderTrackingScreen.estimatedTitle')}
              </Text>
              <Text variant="body" color="primary" weight="bold">
                {t('orderTrackingScreen.estimatedSuffix', { time: estimatedTime })}
              </Text>
            </View>
          </View>
        </Card>

        {/* Tracking Steps */}
        <Card variant="default" padding="md" style={styles.trackingCard}>
          <Text variant="subheading" weight="semibold" style={styles.trackingTitle}>
            {t('orderTrackingScreen.statusTitle')}
          </Text>
          
          <View style={styles.trackingSteps}>
            {trackingSteps.map((step, index) => renderTrackingStep(step, index))}
          </View>
        </Card>

        {/* Contact Info */}
        <Card variant="default" padding="md" style={styles.contactCard}>
          <Text variant="subheading" weight="semibold" style={styles.contactTitle}>
            {t('orderTrackingScreen.contactTitle')}
          </Text>
          
          <View style={styles.contactButtons}>
            <Button variant="outline" style={styles.contactButton}>
              {t('orderTrackingScreen.callCook')}
            </Button>
            <Button variant="outline" style={styles.contactButton}>
              {t('orderTrackingScreen.sendMessage')}
            </Button>
          </View>
        </Card>
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
  orderCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  orderHeader: {
    marginBottom: Spacing.md,
  },
  orderItems: {
    marginBottom: Spacing.md,
  },
  orderItem: {
    marginBottom: Spacing.xs,
  },
  orderTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: Spacing.md,
  },
  timeCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  timeIcon: {
    fontSize: 32,
  },
  timeText: {
    flex: 1,
  },
  trackingCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  trackingTitle: {
    marginBottom: Spacing.md,
  },
  trackingSteps: {
    gap: Spacing.md,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconText: {
    fontSize: 16,
  },
  stepLine: {
    width: 2,
    height: 40,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    lineHeight: 18,
  },
  contactCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  contactTitle: {
    marginBottom: Spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactButton: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
