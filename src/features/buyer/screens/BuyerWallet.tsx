import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';

export const BuyerWallet: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [balance, setBalance] = useState(75.50); // Mock balance

  const formatCurrency = (amount: number) => `₺${amount.toFixed(2)}`;

  const handleBackPress = () => {
    router.back();
  };

  const handleAddMoney = () => {
    Alert.alert(
      'Para Yükle',
      'Cüzdanınıza para yüklemek için ödeme yöntemi seçin:',
      [
        { text: 'İptal', style: 'cancel' },
        { text: '💳 Kredi Kartı', onPress: () => showAddMoneyForm('card') },
        { text: '🏦 Banka Transferi', onPress: () => showAddMoneyForm('bank') },
      ]
    );
  };

  const showAddMoneyForm = (method: string) => {
    Alert.prompt(
      'Para Yükle',
      `${method === 'card' ? 'Kredi kartı ile' : 'Banka transferi ile'} ne kadar para yüklemek istiyorsunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Yükle',
          onPress: (amount) => {
            if (!amount) return;
            
            const addAmount = parseFloat(amount);
            if (isNaN(addAmount) || addAmount <= 0) {
              Alert.alert('Hata', 'Geçerli bir tutar girin');
              return;
            }
            
            setBalance(prev => prev + addAmount);
            Alert.alert(
              'Para Yüklendi',
              `${formatCurrency(addAmount)} cüzdanınıza eklendi.\nYeni bakiye: ${formatCurrency(balance + addAmount)}`
            );
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const showTransactionHistory = () => {
    const mockTransactions = [
      { id: 1, description: 'Ev Yapımı Mantı', amount: -25.00, date: 'Bugün 14:30', type: 'spending' },
      { id: 2, description: 'Para Yükleme', amount: +50.00, date: 'Dün 16:45', type: 'deposit' },
      { id: 3, description: 'Karnıyarık', amount: -18.00, date: '2 gün önce', type: 'spending' },
      { id: 4, description: 'Para Yükleme', amount: +100.00, date: '1 hafta önce', type: 'deposit' },
    ];

    const transactionList = mockTransactions
      .map(t => `${t.description}: ${t.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(t.amount))} (${t.date})`)
      .join('\n\n');

    Alert.alert(
      'İşlem Geçmişi',
      `Son işlemleriniz:\n\n${transactionList}`,
      [{ text: 'Tamam' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title="Cüzdanım" 
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
        {/* Balance Card */}
        <Card variant="default" padding="lg" style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text variant="body" weight="medium" style={styles.balanceTitle}>
              Mevcut Bakiye
            </Text>
            <Text variant="heading" weight="bold" color="primary" style={styles.balanceAmount}>
              {formatCurrency(balance)}
            </Text>
          </View>
          
          <Text variant="caption" color="textSecondary" style={styles.balanceNote}>
            💡 Bu bakiye ile sipariş verebilir ve ödeme yapabilirsiniz
          </Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="💳 Para Yükle"
            onPress={handleAddMoney}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          />
          
          <Button
            title="📋 İşlem Geçmişi"
            onPress={showTransactionHistory}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        {/* Info Card */}
        <Card variant="default" padding="md" style={styles.infoCard}>
          <Text variant="subheading" weight="semibold" style={styles.infoTitle}>
            💰 Cüzdan Hakkında
          </Text>
          
          <View style={styles.infoList}>
            <Text variant="body" style={styles.infoItem}>
              • Cüzdanınıza para yükleyerek hızlı ödeme yapabilirsiniz
            </Text>
            <Text variant="body" style={styles.infoItem}>
              • Kredi kartı veya banka transferi ile para yükleyebilirsiniz
            </Text>
            <Text variant="body" style={styles.infoItem}>
              • Sipariş verirken önce cüzdan bakiyeniz kullanılır
            </Text>
            <Text variant="body" style={styles.infoItem}>
              • Yetersiz bakiye durumunda kart ile ödeme yapabilirsiniz
            </Text>
          </View>
        </Card>

        {/* Security Note */}
        <Card variant="default" padding="md" style={[styles.securityCard, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
          <View style={styles.securityHeader}>
            <FontAwesome name="shield" size={20} color={colors.success} />
            <Text variant="body" weight="semibold" color="success" style={styles.securityTitle}>
              Güvenli Ödeme
            </Text>
          </View>
          <Text variant="caption" color="textSecondary">
            Tüm ödeme işlemleriniz SSL şifreleme ile korunmaktadır. Kart bilgileriniz saklanmaz.
          </Text>
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
    padding: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  balanceCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.light.primary + '10',
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceTitle: {
    opacity: 0.8,
    flex: 1,
  },
  balanceAmount: {
    fontSize: 24,
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  balanceNote: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    marginBottom: Spacing.md,
    color: Colors.light.primary,
  },
  infoList: {
    gap: Spacing.sm,
  },
  infoItem: {
    lineHeight: 20,
  },
  securityCard: {
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  securityTitle: {
    flex: 1,
  },
});