import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

const getMockSalesData = (t: (key: string, params?: Record<string, string | number>) => string) => ([
  {
    id: '1',
    date: '2024-01-05',
    orderNumber: 'ORD-2024-001',
    customerName: t('sellerEarningsScreen.mock.customer1'),
    items: [
      { name: t('sellerEarningsScreen.mock.items.item1'), quantity: 2, price: 35 },
      { name: t('sellerEarningsScreen.mock.items.item2'), quantity: 1, price: 15 },
    ],
    totalAmount: 85,
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-01-05',
    orderNumber: 'ORD-2024-002',
    customerName: t('sellerEarningsScreen.mock.customer2'),
    items: [
      { name: t('sellerEarningsScreen.mock.items.item3'), quantity: 1, price: 45 },
      { name: t('sellerEarningsScreen.mock.items.item4'), quantity: 1, price: 20 },
    ],
    totalAmount: 65,
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-01-04',
    orderNumber: 'ORD-2024-003',
    customerName: t('sellerEarningsScreen.mock.customer3'),
    items: [
      { name: t('sellerEarningsScreen.mock.items.item5'), quantity: 1, price: 30 },
      { name: t('sellerEarningsScreen.mock.items.item6'), quantity: 2, price: 8 },
    ],
    totalAmount: 46,
    status: 'completed',
  },
  {
    id: '4',
    date: '2024-01-04',
    orderNumber: 'ORD-2024-004',
    customerName: t('sellerEarningsScreen.mock.customer4'),
    items: [
      { name: t('sellerEarningsScreen.mock.items.item7'), quantity: 3, price: 25 },
      { name: t('sellerEarningsScreen.mock.items.item8'), quantity: 1, price: 10 },
    ],
    totalAmount: 85,
    status: 'completed',
  },
  {
    id: '5',
    date: '2024-01-03',
    orderNumber: 'ORD-2024-005',
    customerName: t('sellerEarningsScreen.mock.customer5'),
    items: [
      { name: t('sellerEarningsScreen.mock.items.item9'), quantity: 1, price: 55 },
    ],
    totalAmount: 55,
    status: 'completed',
  },
]);

const COMMISSION_RATE = 15; // %15 komisyon

export const SellerEarnings: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t, currentLanguage } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const locale = currentLanguage === 'en' ? 'en-GB' : 'tr-TR';
  const mockSalesData = getMockSalesData(t);


  // Komisyon hesaplama
  const calculateCommission = (amount: number) => {
    return (amount * COMMISSION_RATE) / 100;
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculateCommission(amount);
  };

  // Günlük satışları gruplama
  const groupSalesByDate = () => {
    const grouped: { [key: string]: typeof mockSalesData } = {};
    
    mockSalesData.forEach(sale => {
      if (!grouped[sale.date]) {
        grouped[sale.date] = [];
      }
      grouped[sale.date].push(sale);
    });
    
    return grouped;
  };

  // Günlük toplam hesaplama
  const calculateDailyTotal = (sales: typeof mockSalesData) => {
    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const commission = calculateCommission(total);
    const net = calculateNetAmount(total);
    
    return { total, commission, net };
  };

  // Genel toplam hesaplama
  const calculateOverallTotal = () => {
    const total = mockSalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const commission = calculateCommission(total);
    const net = calculateNetAmount(total);
    
    return { total, commission, net };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const groupedSales = groupSalesByDate();
  const overallTotal = calculateOverallTotal();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('sellerEarningsScreen.title')}
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Toplam Özet */}
        <Card variant="default" padding="lg" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.summaryTitle}>
            {t('sellerEarningsScreen.summaryTitle')}
          </Text>
          
          <View style={styles.summaryCenter}>
            <Text variant="display" weight="bold" color="success">
              ₺{overallTotal.net.toFixed(2)}
            </Text>
            <Text variant="body" color="textSecondary" style={styles.summarySubtext}>
              {t('sellerEarningsScreen.summarySubtext', { count: mockSalesData.length })}
            </Text>
            
            {/* Komisyon Bilgisi */}
            <View style={styles.commissionInfo}>
              <Text variant="caption" color="textSecondary" style={styles.commissionText}>
                {t('sellerEarningsScreen.grossLabel')} ₺{overallTotal.total.toFixed(2)}
              </Text>
              <Text variant="caption" color="warning" style={styles.commissionText}>
                {t('sellerEarningsScreen.commissionLabel', { rate: COMMISSION_RATE })} -₺{overallTotal.commission.toFixed(2)}
              </Text>
              <View style={styles.divider} />
              <Text variant="body" weight="semibold" color="success" style={styles.commissionText}>
                {t('sellerEarningsScreen.netLabel')} ₺{overallTotal.net.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Günlük Satışlar */}
        <View style={styles.dailySalesContainer}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            {t('sellerEarningsScreen.dailyTitle')}
          </Text>
          
          {Object.entries(groupedSales)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, sales]) => {
              const dailyTotal = calculateDailyTotal(sales);
              
              return (
                <Card key={date} variant="default" padding="md" style={styles.dailyCard}>
                  {/* Günlük Başlık */}
                  <View style={styles.dailyHeader}>
                    <Text variant="body" weight="semibold">
                      {formatDate(date)}
                    </Text>
                    <View style={styles.dailyTotals}>
                      <Text variant="body" weight="semibold" color="success">
                        ₺{dailyTotal.net.toFixed(2)}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {t('sellerEarningsScreen.dailyOrderCount', { count: sales.length })}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Günlük Siparişler */}
                  <View style={styles.ordersContainer}>
                    {sales.map((sale) => (
                      <View key={sale.id} style={[styles.orderItem, { borderColor: colors.border }]}>
                        <View style={styles.orderHeader}>
                          <Text variant="body" weight="medium">
                            {sale.orderNumber}
                          </Text>
                          <Text variant="body" weight="semibold" color="success">
                            ₺{calculateNetAmount(sale.totalAmount).toFixed(2)}
                          </Text>
                        </View>
                        
                        <Text variant="caption" color="textSecondary" style={styles.customerName}>
                          {t('sellerEarningsScreen.customerLabel')} {sale.customerName}
                        </Text>
                        
                        <View style={styles.itemsList}>
                          {sale.items.map((item, index) => (
                            <Text key={index} variant="caption" color="textSecondary">
                              {item.quantity}x {item.name} - ₺{(item.quantity * item.price).toFixed(2)}
                            </Text>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </Card>
              );
            })}
        </View>
        
        <View style={styles.bottomSpace} />
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
    padding: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  // Toplam Özet
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  summaryCenter: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summarySubtext: {
    textAlign: 'center',
  },
  commissionInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  commissionText: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    width: '80%',
    marginVertical: Spacing.sm,
  },
  // Günlük Satışlar
  dailySalesContainer: {
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  dailyCard: {
    marginBottom: Spacing.sm,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dailyTotals: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  // Siparişler
  ordersContainer: {
    gap: Spacing.sm,
  },
  orderItem: {
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  customerName: {
    marginBottom: Spacing.xs,
  },
  itemsList: {
    gap: Spacing.xs,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
