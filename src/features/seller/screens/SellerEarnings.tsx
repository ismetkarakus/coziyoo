import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

// Mock satış verileri
const MOCK_SALES_DATA = [
  {
    id: '1',
    date: '2024-01-05',
    orderNumber: 'ORD-2024-001',
    customerName: 'Ahmet K.',
    items: [
      { name: 'Ev Yapımı Mantı', quantity: 2, price: 35 },
      { name: 'Mercimek Çorbası', quantity: 1, price: 15 },
    ],
    totalAmount: 85,
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-01-05',
    orderNumber: 'ORD-2024-002',
    customerName: 'Zeynep M.',
    items: [
      { name: 'Karnıyarık', quantity: 1, price: 45 },
      { name: 'Pilav', quantity: 1, price: 20 },
    ],
    totalAmount: 65,
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-01-04',
    orderNumber: 'ORD-2024-003',
    customerName: 'Can Y.',
    items: [
      { name: 'Döner', quantity: 1, price: 30 },
      { name: 'Ayran', quantity: 2, price: 8 },
    ],
    totalAmount: 46,
    status: 'completed',
  },
  {
    id: '4',
    date: '2024-01-04',
    orderNumber: 'ORD-2024-004',
    customerName: 'Elif S.',
    items: [
      { name: 'Lahmacun', quantity: 3, price: 25 },
      { name: 'Şalgam', quantity: 1, price: 10 },
    ],
    totalAmount: 85,
    status: 'completed',
  },
  {
    id: '5',
    date: '2024-01-03',
    orderNumber: 'ORD-2024-005',
    customerName: 'Murat T.',
    items: [
      { name: 'İskender', quantity: 1, price: 55 },
    ],
    totalAmount: 55,
    status: 'completed',
  },
];

const COMMISSION_RATE = 15; // %15 komisyon

export const SellerEarnings: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const handleBackPress = () => {
    router.back();
  };

  // Komisyon hesaplama
  const calculateCommission = (amount: number) => {
    return (amount * COMMISSION_RATE) / 100;
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculateCommission(amount);
  };

  // Günlük satışları gruplama
  const groupSalesByDate = () => {
    const grouped: { [key: string]: typeof MOCK_SALES_DATA } = {};
    
    MOCK_SALES_DATA.forEach(sale => {
      if (!grouped[sale.date]) {
        grouped[sale.date] = [];
      }
      grouped[sale.date].push(sale);
    });
    
    return grouped;
  };

  // Günlük toplam hesaplama
  const calculateDailyTotal = (sales: typeof MOCK_SALES_DATA) => {
    const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const commission = calculateCommission(total);
    const net = calculateNetAmount(total);
    
    return { total, commission, net };
  };

  // Genel toplam hesaplama
  const calculateOverallTotal = () => {
    const total = MOCK_SALES_DATA.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const commission = calculateCommission(total);
    const net = calculateNetAmount(total);
    
    return { total, commission, net };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const groupedSales = groupSalesByDate();
  const overallTotal = calculateOverallTotal();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Kazançlarım"
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
        {/* Toplam Özet */}
        <Card variant="default" padding="lg" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.summaryTitle}>
            Toplam Kazanç Özeti
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text variant="title" weight="bold" color="primary">
                ₺{overallTotal.total.toFixed(2)}
              </Text>
              <Text variant="caption" color="textSecondary">Brüt Satış</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text variant="title" weight="bold" color="error">
                -₺{overallTotal.commission.toFixed(2)}
              </Text>
              <Text variant="caption" color="textSecondary">Komisyon (%{COMMISSION_RATE})</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text variant="title" weight="bold" color="success">
                ₺{overallTotal.net.toFixed(2)}
              </Text>
              <Text variant="caption" color="textSecondary">Net Kazanç</Text>
            </View>
          </View>
        </Card>

        {/* Günlük Satışlar */}
        <View style={styles.dailySalesContainer}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Günlük Satış Detayları
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
                      <Text variant="caption" color="textSecondary">
                        Brüt: ₺{dailyTotal.total.toFixed(2)}
                      </Text>
                      <Text variant="caption" color="error">
                        Komisyon: -₺{dailyTotal.commission.toFixed(2)}
                      </Text>
                      <Text variant="body" weight="semibold" color="success">
                        Net: ₺{dailyTotal.net.toFixed(2)}
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
                          <Text variant="body" weight="semibold" color="primary">
                            ₺{sale.totalAmount.toFixed(2)}
                          </Text>
                        </View>
                        
                        <Text variant="caption" color="textSecondary" style={styles.customerName}>
                          Müşteri: {sale.customerName}
                        </Text>
                        
                        <View style={styles.itemsList}>
                          {sale.items.map((item, index) => (
                            <Text key={index} variant="caption" color="textSecondary">
                              {item.quantity}x {item.name} - ₺{(item.quantity * item.price).toFixed(2)}
                            </Text>
                          ))}
                        </View>
                        
                        <View style={styles.orderFooter}>
                          <Text variant="caption" color="textSecondary">
                            Komisyon: -₺{calculateCommission(sale.totalAmount).toFixed(2)}
                          </Text>
                          <Text variant="caption" weight="semibold" color="success">
                            Net: ₺{calculateNetAmount(sale.totalAmount).toFixed(2)}
                          </Text>
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
    padding: Spacing.xs,
    borderRadius: 8,
  },
  // Toplam Özet
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  summaryItem: {
    alignItems: 'center',
    gap: Spacing.xs,
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
    marginBottom: Spacing.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  bottomSpace: {
    height: Spacing.xl,
  },
});
