import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { Text, Card, Button } from '../../../components/ui';
import { TopBar } from '../../../components/layout';
import { Colors, Spacing } from '../../../theme';
import { useWallet, Transaction } from '../../../context/WalletContext';
import { useColorScheme } from '../../../../components/useColorScheme';

type TabKey = 'overview' | 'transactions' | 'withdraw';

export const SellerWallet: React.FC = () => {
  const { wallet, withdrawFunds, refreshWallet } = useWallet();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const bankDetails = {
    bankName: 'Garanti BBVA',
    iban: 'TR** **** **** **** ***1234',
    accountName: 'Ayşe Hanım',
  };

  const formatCurrency = (amount: number) => `₺${amount.toFixed(2)}`;
  const formatDateShort = (date: Date) => date.toLocaleDateString('tr-TR');

  const nextPaymentDate = useMemo(() => {
    const today = new Date();
    const next = new Date(today);
    const day = next.getDay();
    const daysUntilMonday = (8 - day) % 7 || 7;
    next.setDate(next.getDate() + daysUntilMonday);
    return next;
  }, []);

  const lastPaymentDate = useMemo(() => {
    const last = new Date(nextPaymentDate);
    last.setDate(last.getDate() - 7);
    return last;
  }, [nextPaymentDate]);

  const weeklyEarnings = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return wallet.transactions
      .filter(t => t.type === 'earning' && t.createdAt >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [wallet.transactions]);

  const monthlyEarnings = useMemo(() => {
    const now = new Date();
    return wallet.transactions
      .filter(t => t.type === 'earning' && t.createdAt.getMonth() === now.getMonth() && t.createdAt.getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0);
  }, [wallet.transactions]);

  const totalEarnings = wallet.totalLifetimeEarnings || wallet.availableEarnings + wallet.pendingEarnings;

  const handleWithdrawSubmit = async () => {
    const amount = parseFloat(withdrawAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin.');
      return;
    }
    if (amount < 50) {
      Alert.alert('Hata', 'Minimum çekim tutarı ₺50.00 olmalıdır.');
      return;
    }
    if (amount > wallet.availableEarnings) {
      Alert.alert('Hata', 'Çekilebilir bakiyeden fazla tutar girilemez.');
      return;
    }

    try {
      await withdrawFunds(amount, bankDetails.iban);
      setWithdrawAmount('');
      Alert.alert('Başarılı', 'Para çekme talebiniz oluşturuldu.');
      await refreshWallet();
    } catch (error) {
      Alert.alert('Hata', 'Para çekme işlemi başarısız oldu.');
    }
  };

  const quickAmounts = [100, 250, 500];

  const displayTransactions: Array<{
    id: string;
    title: string;
    description: string;
    customer: string;
    amount: number;
    status: 'completed' | 'pending';
    date: string;
  }> = wallet.transactions.length > 0
    ? wallet.transactions
        .filter(t => t.type === 'earning')
        .slice(0, 8)
        .map((t: Transaction, index) => ({
          id: t.id,
          title: 'Kazanç',
          description: `Sipariş #${t.orderId ?? `ORD-00${index + 1}`} - ${t.description}`,
          customer: 'Müşteri: Bilgi yok',
          amount: t.amount,
          status: t.status === 'completed' ? 'completed' : 'pending',
          date: formatDateShort(t.createdAt),
        }))
    : [
        {
          id: 'mock-1',
          title: 'Kazanç',
          description: 'Sipariş #ORD-001 - Mercimek Çorbası, Karnıyarık',
          customer: 'Müşteri: Ahmet Yılmaz',
          amount: 95.0,
          status: 'completed',
          date: '26.01.2026 14:30',
        },
        {
          id: 'mock-2',
          title: 'Kazanç',
          description: 'Sipariş #ORD-002 - Döner Kebap',
          customer: 'Müşteri: Fatma Demir',
          amount: 105.0,
          status: 'pending',
          date: '26.01.2026 13:05',
        },
        {
          id: 'mock-3',
          title: 'Kazanç',
          description: 'Sipariş #ORD-003 - Lahmacun, Ayran',
          customer: 'Müşteri: Mehmet Kaya',
          amount: 96.0,
          status: 'completed',
          date: '26.01.2026 12:15',
        },
        {
          id: 'mock-4',
          title: 'Kazanç',
          description: 'Sipariş #ORD-004 - Mantı',
          customer: 'Müşteri: Zeynep Acar',
          amount: 40.0,
          status: 'completed',
          date: '26.01.2026 11:30',
        },
      ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        title="Cüzdanım"
        leftComponent={(
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.7}>
            <FontAwesome name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setActiveTab('overview')}
          style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <FontAwesome name="dashboard" size={16} color={activeTab === 'overview' ? '#fff' : colors.text} />
          <Text variant="caption" weight="medium" style={activeTab === 'overview' ? styles.tabTextActive : styles.tabText}>
            Genel Bakış
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('transactions')}
          style={[styles.tabItem, activeTab === 'transactions' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <FontAwesome name="list" size={16} color={activeTab === 'transactions' ? '#fff' : colors.text} />
          <Text variant="caption" weight="medium" style={activeTab === 'transactions' ? styles.tabTextActive : styles.tabText}>
            İşlemler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('withdraw')}
          style={[styles.tabItem, activeTab === 'withdraw' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <FontAwesome name="bank" size={16} color={activeTab === 'withdraw' ? '#fff' : colors.text} />
          <Text variant="caption" weight="medium" style={activeTab === 'withdraw' ? styles.tabTextActive : styles.tabText}>
            Para Çek
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            <Card variant="default" padding="lg" style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <FontAwesome name="credit-card" size={18} color="#fff" />
                <Text variant="body" weight="medium" style={styles.balanceTitle}>
                  Mevcut Bakiye
                </Text>
              </View>
              <Text variant="heading" weight="bold" style={styles.balanceAmount}>
                {formatCurrency(wallet.availableEarnings)}
              </Text>
              <View style={styles.balanceFooter}>
                <View style={styles.pendingRow}>
                  <FontAwesome name="clock-o" size={14} color="#fff" />
                  <Text variant="caption" style={styles.pendingText}>
                    Bekleyen: {formatCurrency(wallet.pendingEarnings)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.withdrawPill}
                  onPress={() => setActiveTab('withdraw')}
                  activeOpacity={0.8}
                >
                  <Text variant="caption" weight="semibold" style={styles.withdrawPillText}>
                    Para Çek →
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              Kazanç İstatistikleri
            </Text>
            <View style={styles.statsRow}>
              <Card variant="default" padding="md" style={styles.statCard}>
                <FontAwesome name="calendar-check-o" size={18} color={colors.success} />
                <Text variant="caption" style={styles.statLabel}>Bu Hafta</Text>
                <Text variant="body" weight="bold" color="success">
                  {formatCurrency(weeklyEarnings)}
                </Text>
              </Card>
              <Card variant="default" padding="md" style={styles.statCard}>
                <FontAwesome name="calendar" size={18} color={colors.textSecondary} />
                <Text variant="caption" style={styles.statLabel}>Bu Ay</Text>
                <Text variant="body" weight="bold" color="textSecondary">
                  {formatCurrency(monthlyEarnings)}
                </Text>
              </Card>
              <Card variant="default" padding="md" style={styles.statCard}>
                <FontAwesome name="trophy" size={18} color={colors.warning} />
                <Text variant="caption" style={styles.statLabel}>Toplam Kazanç</Text>
                <Text variant="body" weight="bold" color="warning">
                  {formatCurrency(totalEarnings)}
                </Text>
              </Card>
            </View>

            <Card variant="default" padding="md" style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <FontAwesome name="info-circle" size={16} color={colors.textSecondary} />
                <Text variant="body" weight="semibold" style={styles.infoTitle}>
                  Ödeme Bilgileri
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="body" color="textSecondary">Son Ödeme:</Text>
                <Text variant="body" weight="medium">{formatDateShort(lastPaymentDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="body" color="textSecondary">Sonraki Ödeme:</Text>
                <Text variant="body" weight="medium">{formatDateShort(nextPaymentDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="body" color="textSecondary">Minimum Tutar:</Text>
                <Text variant="body" weight="medium">₺50.00</Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            <Text variant="subheading" weight="semibold" style={styles.sectionTitle}>
              İşlem Geçmişi
            </Text>
            <View style={styles.transactionList}>
              {displayTransactions.map((item) => (
                <Card key={item.id} variant="default" padding="md" style={styles.transactionCard}>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionTitle}>
                      <View style={styles.transactionIcon}>
                        <Text style={styles.transactionIconText}>+</Text>
                      </View>
                      <View>
                        <Text variant="body" weight="semibold">{item.title}</Text>
                        <Text variant="caption" color="textSecondary">{item.date}</Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text variant="body" weight="bold" style={styles.transactionAmount}>
                        +{formatCurrency(item.amount)}
                      </Text>
                      <View style={[styles.statusPill, item.status === 'completed' ? styles.statusDone : styles.statusPending]}>
                        <Text variant="caption" weight="semibold" style={styles.statusText}>
                          {item.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text variant="body" color="textSecondary" style={styles.transactionLine}>
                    {item.description}
                  </Text>
                  <Text variant="body" color="textSecondary">
                    {item.customer}
                  </Text>
                </Card>
              ))}
            </View>
          </>
        )}

        {activeTab === 'withdraw' && (
          <>
            <Card variant="default" padding="md" style={styles.balanceSummary}>
              <View style={styles.infoRow}>
                <Text variant="body" color="textSecondary">Mevcut Bakiye:</Text>
                <Text variant="body" weight="bold" color="success">{formatCurrency(wallet.availableEarnings)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="body" color="textSecondary">Bekleyen Bakiye:</Text>
                <Text variant="body" weight="bold" color="warning">{formatCurrency(wallet.pendingEarnings)}</Text>
              </View>
            </Card>

            <Card variant="default" padding="md" style={styles.withdrawCard}>
              <Text variant="body" weight="semibold" style={styles.withdrawTitle}>
                Çekmek İstediğiniz Tutar
              </Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                />
              </View>

              <View style={styles.quickRow}>
                {quickAmounts.map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={styles.quickButton}
                    onPress={() => setWithdrawAmount(value.toFixed(2))}
                    activeOpacity={0.8}
                  >
                    <Text variant="caption" weight="semibold">₺{value}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => setWithdrawAmount(wallet.availableEarnings.toFixed(2))}
                  activeOpacity={0.8}
                >
                  <Text variant="caption" weight="semibold">Tümü</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoBoxHeader}>
                  <FontAwesome name="info-circle" size={16} color={colors.textSecondary} />
                  <Text variant="body" weight="medium" style={styles.infoBoxTitle}>Bilgilendirme</Text>
                </View>
                <Text variant="body" color="textSecondary">• Minimum çekim tutarı: ₺50.00</Text>
                <Text variant="body" color="textSecondary">• İşlem süresi: 1-3 iş günü</Text>
                <Text variant="body" color="textSecondary">• Haftalık otomatik ödeme: Pazartesi günleri</Text>
                <Text variant="body" color="textSecondary">• İşlem ücreti: Ücretsiz</Text>
              </View>

              <Button
                variant="primary"
                fullWidth
                onPress={handleWithdrawSubmit}
                style={styles.withdrawSubmit}
              >
                Para Çekme Talebi Oluştur
              </Button>
            </Card>

            <Card variant="default" padding="md" style={styles.bankCard}>
              <View style={styles.bankHeader}>
                <FontAwesome name="bank" size={18} color={colors.primary} />
                <Text variant="body" weight="semibold" style={styles.bankTitle}>
                  Banka Hesap Bilgileri
                </Text>
              </View>
              <Text variant="body" color="textSecondary">{bankDetails.bankName}</Text>
              <Text variant="body" weight="semibold">{bankDetails.iban}</Text>
              <Text variant="body" color="textSecondary">{bankDetails.accountName}</Text>
              <TouchableOpacity style={styles.editBank} activeOpacity={0.8}>
                <FontAwesome name="pencil" size={14} color={colors.textSecondary} />
                <Text variant="caption" color="textSecondary">Hesap Bilgilerini Düzenle</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconButton: {
    padding: Spacing.xs,
    borderRadius: 8,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    backgroundColor: '#EAE6DD',
  },
  tabItemActive: {
    backgroundColor: '#7E8F7A',
  },
  tabText: {
    color: '#2B2B2B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  balanceCard: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    backgroundColor: '#7E8F7A',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  balanceTitle: {
    color: '#FFFFFF',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 30,
    marginTop: Spacing.sm,
  },
  balanceFooter: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pendingText: {
    color: '#FFFFFF',
  },
  withdrawPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  withdrawPillText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statLabel: {
    color: '#555',
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: Spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  transactionList: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  transactionCard: {
    borderRadius: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E7F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionIconText: {
    color: '#2F8F4E',
    fontWeight: 'bold',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  transactionAmount: {
    color: '#2F8F4E',
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statusDone: {
    backgroundColor: '#2F8F4E',
  },
  statusPending: {
    backgroundColor: '#F2B233',
  },
  statusText: {
    color: '#FFFFFF',
  },
  transactionLine: {
    marginTop: Spacing.sm,
  },
  balanceSummary: {
    marginTop: Spacing.sm,
  },
  withdrawCard: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  withdrawTitle: {
    marginBottom: Spacing.xs,
  },
  amountInputContainer: {
    backgroundColor: '#F1EDE4',
    borderRadius: 12,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#666',
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C2C2C2',
    borderRadius: 18,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    padding: Spacing.md,
    backgroundColor: '#F4F2EC',
    gap: Spacing.xs,
  },
  infoBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  infoBoxTitle: {
    color: '#555',
  },
  withdrawSubmit: {
    marginTop: Spacing.sm,
    backgroundColor: '#AEB6AA',
  },
  bankCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bankTitle: {
    color: '#333',
  },
  editBank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
});
