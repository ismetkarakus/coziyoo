import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useColorScheme } from '../../../../components/useColorScheme';
import { useTranslation } from '../../../hooks/useTranslation';

export const BuyerWallet: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const [balance, setBalance] = useState(75.50); // Mock balance

  const formatCurrency = (amount: number) => `₺${amount.toFixed(2)}`;

  const handleBackPress = () => {
    router.back();
  };

  const handleAddMoney = () => {
    Alert.alert(
      t('buyerWalletScreen.addMoneySheet.title'),
      t('buyerWalletScreen.addMoneySheet.message'),
      [
        { text: t('buyerWalletScreen.addMoneySheet.cancel'), style: 'cancel' },
        { text: t('buyerWalletScreen.addMoneySheet.card'), onPress: () => showAddMoneyForm('card') },
        { text: t('buyerWalletScreen.addMoneySheet.bank'), onPress: () => showAddMoneyForm('bank') },
      ]
    );
  };

  const showAddMoneyForm = (method: string) => {
    Alert.prompt(
      t('buyerWalletScreen.addMoneySheet.promptTitle'),
      method === 'card'
        ? t('buyerWalletScreen.addMoneySheet.promptMessageCard')
        : t('buyerWalletScreen.addMoneySheet.promptMessageBank'),
      [
        { text: t('buyerWalletScreen.addMoneySheet.cancel'), style: 'cancel' },
        {
          text: t('buyerWalletScreen.addMoneySheet.load'),
          onPress: (amount) => {
            if (!amount) return;
            
            const addAmount = parseFloat(amount);
            if (isNaN(addAmount) || addAmount <= 0) {
              Alert.alert(t('buyerWalletScreen.amountErrorTitle'), t('buyerWalletScreen.amountErrorMessage'));
              return;
            }
            
            setBalance(prev => prev + addAmount);
            Alert.alert(
              t('buyerWalletScreen.addSuccessTitle'),
              t('buyerWalletScreen.addSuccessMessage', { amount: formatCurrency(addAmount), balance: formatCurrency(balance + addAmount) })
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
      { id: 1, description: t('buyerWalletScreen.transactions.foodManti'), amount: -25.00, date: t('buyerWalletScreen.transactions.today'), type: 'spending' },
      { id: 2, description: t('buyerWalletScreen.transactions.deposit'), amount: +50.00, date: t('buyerWalletScreen.transactions.yesterday'), type: 'deposit' },
      { id: 3, description: t('buyerWalletScreen.transactions.foodKarniyarik'), amount: -18.00, date: t('buyerWalletScreen.transactions.twoDays'), type: 'spending' },
      { id: 4, description: t('buyerWalletScreen.transactions.deposit'), amount: +100.00, date: t('buyerWalletScreen.transactions.weekAgo'), type: 'deposit' },
    ];

    const transactionList = mockTransactions
      .map(t => `${t.description}: ${t.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(t.amount))} (${t.date})`)
      .join('\n\n');

    Alert.alert(
      t('buyerWalletScreen.historyTitle'),
      t('buyerWalletScreen.historyMessage', { list: transactionList }),
      [{ text: t('buyerWalletScreen.ok') }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar 
        title={t('buyerWalletScreen.title')} 
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
              {t('buyerWalletScreen.balanceTitle')}
            </Text>
            <Text variant="heading" weight="bold" color="primary" style={styles.balanceAmount}>
              {formatCurrency(balance)}
            </Text>
          </View>
          
          <Text variant="caption" color="textSecondary" style={styles.balanceNote}>
            {t('buyerWalletScreen.balanceNote')}
          </Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title={t('buyerWalletScreen.addMoney')}
            onPress={handleAddMoney}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
          />
          
          <Button
            title={t('buyerWalletScreen.history')}
            onPress={showTransactionHistory}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        {/* Info Card */}
        <Card variant="default" padding="md" style={styles.infoCard}>
          <Text variant="subheading" weight="semibold" style={styles.infoTitle}>
            {t('buyerWalletScreen.infoTitle')}
          </Text>
          
          <View style={styles.infoList}>
            <Text variant="body" style={styles.infoItem}>
              {t('buyerWalletScreen.infoItems.one')}
            </Text>
            <Text variant="body" style={styles.infoItem}>
              {t('buyerWalletScreen.infoItems.two')}
            </Text>
            <Text variant="body" style={styles.infoItem}>
              {t('buyerWalletScreen.infoItems.three')}
            </Text>
            <Text variant="body" style={styles.infoItem}>
              {t('buyerWalletScreen.infoItems.four')}
            </Text>
          </View>
        </Card>

        {/* Security Note */}
        <Card variant="default" padding="md" style={[styles.securityCard, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
          <View style={styles.securityHeader}>
            <FontAwesome name="shield" size={20} color={colors.success} />
            <Text variant="body" weight="semibold" color="success" style={styles.securityTitle}>
              {t('buyerWalletScreen.securityTitle')}
            </Text>
          </View>
          <Text variant="caption" color="textSecondary">
            {t('buyerWalletScreen.securityDesc')}
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
