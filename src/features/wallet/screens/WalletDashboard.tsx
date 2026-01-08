import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { TopBar, Text, Button, Card } from '../../../components/ui';
import { Colors, Spacing } from '../../../theme';
import { useWallet, Transaction } from '../../../context/WalletContext';

export const WalletDashboard: React.FC = () => {
  const router = useRouter();
  const { wallet, withdrawFunds, refreshWallet, loading } = useWallet();
  const [withdrawing, setWithdrawing] = useState(false);

  const formatCurrency = (amount: number) => `₺${amount.toFixed(2)}`;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Az önce';
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'earning':
        return '💰';
      case 'spending':
        return '🛒';
      case 'withdrawal':
        return '💸';
      case 'refund':
        return '↩️';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'earning':
      case 'refund':
        return Colors.success;
      case 'spending':
      case 'withdrawal':
        return Colors.error;
      default:
        return Colors.textPrimary;
    }
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const prefix = ['earning', 'refund'].includes(transaction.type) ? '+' : '-';
    return `${prefix}${formatCurrency(transaction.amount)}`;
  };

  const handleWithdraw = () => {
    if (wallet.availableEarnings <= 0) {
      Alert.alert('Uyarı', 'Çekilebilir bakiyeniz bulunmuyor');
      return;
    }

    Alert.prompt(
      'Para Çek',
      `Çekilebilir bakiye: ${formatCurrency(wallet.availableEarnings)}\n\nÇekmek istediğiniz tutarı girin:`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çek',
          onPress: async (amount) => {
            if (!amount) return;
            
            const withdrawAmount = parseFloat(amount);
            if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
              Alert.alert('Hata', 'Geçerli bir tutar girin');
              return;
            }
            
            if (withdrawAmount > wallet.availableEarnings) {
              Alert.alert('Hata', 'Çekilebilir bakiyenizden fazla tutar giremezsiniz');
              return;
            }

            try {
              setWithdrawing(true);
              await withdrawFunds(withdrawAmount, 'TR12 3456 7890 1234 5678 90'); // Mock IBAN
              Alert.alert(
                'Para Çekme Talebi Alındı',
                `${formatCurrency(withdrawAmount)} tutarındaki para çekme talebiniz alındı. 1-2 iş günü içinde hesabınıza aktarılacak.`
              );
            } catch (error) {
              Alert.alert('Hata', 'Para çekme işlemi başarısız oldu');
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleRefresh = async () => {
    try {
      await refreshWallet();
    } catch (error) {
      Alert.alert('Hata', 'Cüzdan bilgileri güncellenemedi');
    }
  };

  // Recent transactions (last 10)
  const recentTransactions = wallet.transactions
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return (
    <View style={styles.container}>
      <TopBar 
        title="Cüzdanım" 
        showBack 
        rightComponent={
          <TouchableOpacity onPress={handleRefresh}>
            <Text variant="body" color="primary">🔄</Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wallet Overview */}
        <Card variant="default" padding="lg" style={styles.overviewCard}>
          <Text variant="title" weight="bold" center style={styles.balanceTitle}>
            Kullanılabilir Bakiye
          </Text>
          <Text variant="display" weight="bold" center color="primary" style={styles.balanceAmount}>
            {formatCurrency(wallet.balance + wallet.availableEarnings)}
          </Text>
          
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <Text variant="caption" color="textSecondary">Cüzdan Bakiyesi</Text>
              <Text variant="body" weight="medium" color="success">
                {formatCurrency(wallet.balance)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text variant="caption" color="textSecondary">Çekilebilir Kazanç</Text>
              <Text variant="body" weight="medium" color="success">
                {formatCurrency(wallet.availableEarnings)}
              </Text>
            </View>
          </View>

          {wallet.pendingEarnings > 0 && (
            <View style={styles.pendingEarnings}>
              <Text variant="caption" color="textSecondary">⏳ Bekleyen Kazanç</Text>
              <Text variant="body" weight="medium" color="warning">
                {formatCurrency(wallet.pendingEarnings)}
              </Text>
              <Text variant="caption" color="textSecondary" style={styles.pendingNote}>
                7 gün sonra çekilebilir duruma geçecek
              </Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="💸 Para Çek"
            onPress={handleWithdraw}
            disabled={wallet.availableEarnings <= 0 || withdrawing}
            style={[styles.actionButton, styles.withdrawButton]}
          />
          <Button
            title="📊 Detaylı Rapor"
            onPress={() => {
              // TODO: Navigate to detailed report
              Alert.alert('Yakında', 'Detaylı rapor özelliği yakında eklenecek');
            }}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        {/* Monthly Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Bu Ay
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>📈</Text>
              <Text variant="body" weight="bold" color="success">
                {formatCurrency(340)} {/* Mock data */}
              </Text>
              <Text variant="caption" color="textSecondary">Kazanç</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🛒</Text>
              <Text variant="body" weight="bold" color="error">
                {formatCurrency(120)} {/* Mock data */}
              </Text>
              <Text variant="caption" color="textSecondary">Harcama</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>💰</Text>
              <Text variant="body" weight="bold" color="primary">
                {formatCurrency(220)} {/* Mock data */}
              </Text>
              <Text variant="caption" color="textSecondary">Net</Text>
            </View>
          </View>
        </Card>

        {/* Recent Transactions */}
        <Card variant="default" padding="md" style={styles.transactionsCard}>
          <View style={styles.transactionsHeader}>
            <Text variant="subheading" weight="semibold">
              Son İşlemler
            </Text>
            <TouchableOpacity
              onPress={() => {
                // TODO: Navigate to full transaction history
                Alert.alert('Yakında', 'Tüm işlemler sayfası yakında eklenecek');
              }}
            >
              <Text variant="caption" color="primary">Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text variant="body" color="textSecondary" center>
                Henüz işlem geçmişiniz yok
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionIcon}>
                      {getTransactionIcon(transaction)}
                    </Text>
                    <View style={styles.transactionInfo}>
                      <Text variant="body" weight="medium" numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text variant="caption" color="textSecondary">
                        {formatDate(transaction.createdAt)}
                        {transaction.status === 'pending' && ' • Beklemede'}
                      </Text>
                    </View>
                  </View>
                  <Text 
                    variant="body" 
                    weight="medium"
                    style={{ color: getTransactionColor(transaction) }}
                  >
                    {getTransactionAmount(transaction)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  overviewCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  balanceTitle: {
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    fontSize: 36,
    marginBottom: Spacing.lg,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  balanceItem: {
    alignItems: 'center',
  },
  pendingEarnings: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pendingNote: {
    marginTop: Spacing.xs,
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
  withdrawButton: {
    backgroundColor: Colors.success,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  transactionsCard: {
    marginBottom: Spacing.xl,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
});
