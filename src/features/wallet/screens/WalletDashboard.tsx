import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, Button, Card } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useWallet, Transaction } from '../../../context/WalletContext';
import { useAuth } from '../../../context/AuthContext';
import { useColorScheme } from '../../../../components/useColorScheme';

export const WalletDashboard: React.FC = () => {
  const { wallet, withdrawFunds, refreshWallet, loading } = useWallet();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [withdrawing, setWithdrawing] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  
  // Mock banka bilgileri - gerçek uygulamada AsyncStorage'dan gelecek
  const bankDetails = {
    bankName: 'Türkiye İş Bankası',
    iban: 'TR33 0006 4000 0011 2345 6789 01',
  };

  // Kullanıcı tipini belirle
  const isBuyer = user?.userType === 'buyer';
  const isSeller = user?.userType === 'seller';
  const isHybrid = user?.userType === 'hybrid' || (!user?.userType); // Default hibrit

  const handleBackPress = () => {
    router.back();
  };

  const showDetailedReport = () => {
    // Aylık ve yıllık istatistikleri hesapla
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    // Bu ay işlemleri
    const thisMonthTransactions = wallet.transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate.getMonth() === thisMonth && transactionDate.getFullYear() === thisYear;
    });
    
    // Bu yıl işlemleri
    const thisYearTransactions = wallet.transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate.getFullYear() === thisYear;
    });
    
    // Harcama hesaplamaları
    const monthlySpending = thisMonthTransactions
      .filter(t => t.type === 'spending')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const yearlySpending = thisYearTransactions
      .filter(t => t.type === 'spending')
      .reduce((sum, t) => sum + t.amount, 0);
      
    // Kazanç hesaplamaları (sadece satıcılar için)
    const monthlyEarnings = thisMonthTransactions
      .filter(t => t.type === 'earning')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const yearlyEarnings = thisYearTransactions
      .filter(t => t.type === 'earning')
      .reduce((sum, t) => sum + t.amount, 0);

    const reportMessage = `📊 **Detaylı Cüzdan Raporu**

📅 **Bu Ay (${now.toLocaleDateString('tr-TR', { month: 'long' })} ${thisYear}):**
${isBuyer ? `💸 Toplam Harcama: ${formatCurrency(monthlySpending)}` : ''}
${(isSeller || isHybrid) ? `💰 Toplam Kazanç: ${formatCurrency(monthlyEarnings)}` : ''}
🔄 İşlem Sayısı: ${thisMonthTransactions.length}

📅 **Bu Yıl (${thisYear}):**
${isBuyer ? `💸 Toplam Harcama: ${formatCurrency(yearlySpending)}` : ''}
${(isSeller || isHybrid) ? `💰 Toplam Kazanç: ${formatCurrency(yearlyEarnings)}` : ''}
🔄 İşlem Sayısı: ${thisYearTransactions.length}

💡 **Bu rapor şunları gösterir:**
• Aylık ve yıllık harcama/kazanç özeti
• İşlem sayısı istatistikleri
• Finansal aktivite genel bakış`;

    Alert.alert('Detaylı Rapor', reportMessage, [
      { text: 'Tamam', style: 'default' }
    ]);
  };

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
        leftComponent={
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity 
            onPress={handleRefresh}
            style={styles.refreshButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wallet Overview */}
        <Card variant="default" padding="lg" style={styles.overviewCard}>
          <View style={styles.balanceHeader}>
            <Text variant="body" weight="medium" style={styles.balanceTitle}>
              {isBuyer ? 'Cüzdan Bakiyesi' : isSeller ? 'Toplam Kazanç' : 'Kullanılabilir Bakiye'}
            </Text>
            <Text variant="heading" weight="bold" color="primary" style={styles.balanceAmount}>
              {isBuyer ? formatCurrency(wallet.balance) : 
               isSeller ? formatCurrency(wallet.availableEarnings) :
               formatCurrency(wallet.balance + wallet.availableEarnings)}
            </Text>
          </View>
          
          {/* Sadece hibrit kullanıcılar için breakdown göster */}
          {isHybrid && (
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
          )}
          
          {/* Sadece alıcılar için bakiye ekleme butonu */}
          {isBuyer && (
            <View style={styles.buyerActions}>
              <Button variant="primary" onPress={() => Alert.alert('Para Yükle', 'Para yükleme özelliği yakında gelecek')}>
                💳 Para Yükle
              </Button>
            </View>
          )}

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


        {/* Action Buttons - 4 Buton Yan Yana */}
        <View style={styles.mainActionsContainer}>
          {/* Para Çek butonu - Kazançları çek */}
          <Button
            title="💸 Para Çek
Kazançları Çek"
            onPress={() => Alert.alert('Para Çek', 'Para çekme özelliği yakında gelecek')}
            style={[styles.mainActionButton, styles.cardColorButton]}
            textStyle={styles.buttonText}
            variant="outline"
          />
          
          {/* Para Yükle butonu - Bakiye yükle */}
          <Button
            title="💳 Para Yükle
Bakiye Yükle"
            onPress={() => Alert.alert('Para Yükle', 'Para yükleme özelliği yakında gelecek')}
            style={[styles.mainActionButton, styles.cardColorButton]}
            textStyle={styles.whiteButtonText}
            variant="outline"
          />
          
          {/* Banka Bilgileri butonu - Hesap bilgileri */}
          <Button
            title={`🏦 Banka
Hesap Bilgileri ${showBankDetails ? '▲' : '▼'}`}
            onPress={() => setShowBankDetails(!showBankDetails)}
            style={[styles.mainActionButton, styles.cardColorButton]}
            textStyle={styles.buttonText}
            variant="outline"
          />
          
          {/* Detaylı Rapor butonu - Gelir gider */}
          <Button
            title="📊 Rapor
Gelir Gider"
            onPress={() => showDetailedReport()}
            style={[styles.mainActionButton, styles.cardColorButton]}
            textStyle={styles.buttonText}
            variant="outline"
          />
        </View>

        {/* Banka Detayları Dropdown - Sağdaki buton formatında */}
        {(isSeller || isHybrid) && showBankDetails && (
          <View style={styles.bankDropdownExternal}>
            {bankDetails.bankName || bankDetails.iban ? (
              <View style={styles.bankInfoExternal}>
                {bankDetails.bankName && (
                  <Text variant="body" color="textSecondary">
                    🏦 {bankDetails.bankName}
                  </Text>
                )}
                {bankDetails.iban && (
                  <Text variant="body" color="textSecondary">
                    💳 {bankDetails.iban}
                  </Text>
                )}
              </View>
            ) : (
              <Text variant="body" color="textSecondary">
                Banka bilgisi yok
              </Text>
            )}
          </View>
        )}

        {/* Monthly Summary */}
        <Card variant="default" padding="md" style={styles.summaryCard}>
          <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
            Bu Ay Özeti
          </Text>
          
          {/* Satış İstatistikleri - Sadece satıcılar ve hibrit için */}
          {(isSeller || isHybrid) && (
            <>
              <Text variant="body" weight="medium" style={styles.subsectionTitle}>
                🍽️ Satış Performansı
              </Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>📦</Text>
                  <Text variant="body" weight="bold" color="primary">
                    23
                  </Text>
                  <Text variant="caption" color="textSecondary">Satılan Yemek</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>💰</Text>
                  <Text variant="body" weight="bold" color="success">
                    {formatCurrency(340)}
                  </Text>
                  <Text variant="caption" color="textSecondary">Brüt Kazanç</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>📊</Text>
                  <Text variant="body" weight="bold" color="warning">
                    {formatCurrency(34)}
                  </Text>
                  <Text variant="caption" color="textSecondary">Komisyon (%10)</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>✅</Text>
                  <Text variant="body" weight="bold" color="success">
                    {formatCurrency(306)}
                  </Text>
                  <Text variant="caption" color="textSecondary">Net Kazanç</Text>
                </View>
              </View>
            </>
          )}
          
          {/* Genel Finansal Özet */}
          <Text variant="body" weight="medium" style={[styles.subsectionTitle, { marginTop: (isSeller || isHybrid) ? Spacing.md : 0 }]}>
            💳 Finansal Özet
          </Text>
          <View style={styles.summaryGrid}>
            {(isSeller || isHybrid) && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>📈</Text>
                <Text variant="body" weight="bold" color="success">
                  {formatCurrency(306)}
                </Text>
                <Text variant="caption" color="textSecondary">Toplam Kazanç</Text>
              </View>
            )}
            {(isBuyer || isHybrid) && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>🛒</Text>
                <Text variant="body" weight="bold" color="error">
                  {formatCurrency(120)}
                </Text>
                <Text variant="caption" color="textSecondary">Toplam Harcama</Text>
              </View>
            )}
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>💰</Text>
              <Text variant="body" weight="bold" color="primary">
                {formatCurrency(isHybrid ? 186 : isSeller ? 306 : -120)}
              </Text>
              <Text variant="caption" color="textSecondary">
                {isHybrid ? 'Net Kar' : isSeller ? 'Net Kazanç' : 'Toplam Harcama'}
              </Text>
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
  backButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  refreshButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  overviewCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    position: 'relative',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  buyerActions: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  // Yeni ana butonlar için stiller
  mainActionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
  mainActionButton: {
    flex: 1,
    minHeight: 56, // Daha büyük yükseklik
    paddingVertical: Spacing.md,
  },
  // Soldaki buton için özel stil - çok geniş (sol köşe)
  leftActionButton: {
    flex: 3, // Çok büyük buton
    minHeight: 56,
    paddingVertical: Spacing.md,
  },
  // Sağdaki küçük buton için stil
  rightActionButton: {
    flex: 1, // Normal buton
    minHeight: 56,
    paddingVertical: Spacing.md,
  },
  // Hafif açık kömür karası buton stili
  cardColorButton: {
    backgroundColor: '#444444', // Hafif açık kömür karası
    borderColor: '#444444',
    borderWidth: 1,
  },
  // Buton yazı rengi - Beyaz
  buttonText: {
    color: '#FFFFFF', // Beyaz yazı (net görünür)
  },
  // Para Yükle butonu için özel beyaz yazı
  whiteButtonText: {
    color: '#FFFFFF', // Kesin beyaz yazı
  },
  withdrawButton: {
    backgroundColor: Colors.success,
  },
  summaryCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subsectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    marginBottom: Spacing.sm,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  transactionsCard: {
    marginHorizontal: Spacing.md,
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
  bankDetailsCompact: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    maxWidth: '60%',
  },
  bankToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  bankDropdown: {
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankInfoCompact: {
    gap: Spacing.xs,
  },
  // Yeni external bank details stilleri - Action Button formatında
  bankDetailsSection: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  bankDetailsButton: {
    backgroundColor: Colors.light.surface,
    borderColor: Colors.light.primary,
  },
  bankDropdownExternal: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankInfoExternal: {
    gap: Spacing.sm,
  },
  // İyileştirilmiş banka detayları stilleri
  bankDropdownCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.primary + '20',
    backgroundColor: Colors.light.primary + '05',
  },
  bankCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  bankInfoImproved: {
    gap: Spacing.md,
  },
  bankInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  bankInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankInfoText: {
    flex: 1,
    gap: 2,
  },
  ibanText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  bankActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  editBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    backgroundColor: Colors.light.primary + '10',
  },
  noBankInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  noBankText: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  addBankButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.light.primary + '10',
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
});
