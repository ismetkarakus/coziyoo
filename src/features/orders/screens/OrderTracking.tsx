import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Mock tracking data
const TRACKING_STEPS = [
  {
    id: 1,
    title: 'Sipariş Alındı',
    description: 'Siparişiniz başarıyla alındı ve onaylandı',
    time: '14:30',
    completed: true,
    active: false,
  },
  {
    id: 2,
    title: 'Hazırlanıyor',
    description: 'Yemeğiniz aşçı tarafından hazırlanıyor',
    time: '14:45',
    completed: true,
    active: true,
  },
  {
    id: 3,
    title: 'Hazır',
    description: 'Yemeğiniz hazır, teslim alınabilir',
    time: '15:15',
    completed: false,
    active: false,
  },
  {
    id: 4,
    title: 'Teslim Edildi',
    description: 'Siparişiniz başarıyla teslim edildi',
    time: '',
    completed: false,
    active: false,
  },
];

export const OrderTracking: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const [estimatedTime, setEstimatedTime] = useState('25 dk');

  // Mock order data
  const orderData = {
    orderNumber: params.orderNumber || '#ORD-2024-001',
    cookName: params.cookName || 'Ayşe Hanım',
    items: [
      { name: 'Ev Yapımı Mantı', quantity: 2, price: 35 },
      { name: 'Mercimek Çorbası', quantity: 1, price: 15 },
    ],
    total: 85,
    deliveryType: 'pickup',
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      const minutes = Math.max(0, parseInt(estimatedTime) - 1);
      setEstimatedTime(`${minutes} dk`);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [estimatedTime]);

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
        {index < TRACKING_STEPS.length - 1 && (
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
        title="Sipariş Takip" 
        leftComponent={
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
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
              Toplam: ₺{orderData.total.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Estimated Time */}
        <Card variant="default" padding="md" style={styles.timeCard}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeIcon}>⏰</Text>
            <View style={styles.timeText}>
              <Text variant="subheading" weight="semibold">
                Tahmini Süre
              </Text>
              <Text variant="body" color="primary" weight="bold">
                {estimatedTime} kaldı
              </Text>
            </View>
          </View>
        </Card>

        {/* Tracking Steps */}
        <Card variant="default" padding="md" style={styles.trackingCard}>
          <Text variant="subheading" weight="semibold" style={styles.trackingTitle}>
            Sipariş Durumu
          </Text>
          
          <View style={styles.trackingSteps}>
            {TRACKING_STEPS.map((step, index) => renderTrackingStep(step, index))}
          </View>
        </Card>

        {/* Contact Info */}
        <Card variant="default" padding="md" style={styles.contactCard}>
          <Text variant="subheading" weight="semibold" style={styles.contactTitle}>
            İletişim
          </Text>
          
          <View style={styles.contactButtons}>
            <Button variant="outline" style={styles.contactButton}>
              📞 Aşçıyı Ara
            </Button>
            <Button variant="outline" style={styles.contactButton}>
              💬 Mesaj Gönder
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
