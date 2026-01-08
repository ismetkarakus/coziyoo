import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Transaction {
  id: string;
  type: 'earning' | 'spending' | 'withdrawal' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  orderId?: string;
  description: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface WalletData {
  balance: number;                    // Anlık kullanılabilir bakiye
  pendingEarnings: number;           // Bekleyen satış kazançları (7 gün)
  availableEarnings: number;         // Çekilebilir kazançlar
  totalLifetimeEarnings: number;     // Toplam kazanç
  totalLifetimeSpent: number;        // Toplam harcama
  transactions: Transaction[];        // İşlem geçmişi
  paymentMethods: PaymentMethod[];   // Kayıtlı ödeme yöntemleri
  defaultPaymentMethod?: string;     // Varsayılan ödeme yöntemi ID
  lastUpdated: Date;
}

export interface PaymentBreakdown {
  wallet: number;      // Cüzdandan ödenecek
  earnings: number;    // Kazançlardan ödenecek
  card: number;        // Karttan ödenecek
  total: number;       // Toplam tutar
}

interface WalletContextType {
  wallet: WalletData;
  loading: boolean;
  
  // Wallet Operations
  addEarning: (amount: number, orderId: string, description: string) => Promise<void>;
  processPayment: (amount: number, orderId: string, description: string) => Promise<PaymentBreakdown>;
  withdrawFunds: (amount: number, bankAccount: string) => Promise<boolean>;
  
  // Payment Calculations
  calculatePaymentBreakdown: (amount: number) => PaymentBreakdown;
  
  // Payment Methods
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
  
  // Utility
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Default wallet data
const DEFAULT_WALLET: WalletData = {
  balance: 0,
  pendingEarnings: 0,
  availableEarnings: 0,
  totalLifetimeEarnings: 0,
  totalLifetimeSpent: 0,
  transactions: [],
  paymentMethods: [],
  lastUpdated: new Date(),
};

// Mock data for development
const MOCK_WALLET: WalletData = {
  balance: 150.00,
  pendingEarnings: 85.00,
  availableEarnings: 240.00,
  totalLifetimeEarnings: 1250.00,
  totalLifetimeSpent: 380.00,
  transactions: [
    {
      id: 'txn_001',
      type: 'earning',
      amount: 25.00,
      status: 'completed',
      orderId: 'order_123',
      description: 'Mantı siparişi kazancı',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'txn_002',
      type: 'spending',
      amount: 12.00,
      status: 'completed',
      orderId: 'order_124',
      description: 'Börek siparişi',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 saat önce
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      id: 'txn_003',
      type: 'earning',
      amount: 18.00,
      status: 'pending',
      orderId: 'order_125',
      description: 'Dolma siparişi kazancı',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 saat önce
    },
  ],
  paymentMethods: [
    {
      id: 'pm_001',
      type: 'card',
      last4: '1234',
      brand: 'visa',
      isDefault: true,
      expiryMonth: 12,
      expiryYear: 2025,
    },
    {
      id: 'pm_002',
      type: 'card',
      last4: '5678',
      brand: 'mastercard',
      isDefault: false,
      expiryMonth: 8,
      expiryYear: 2026,
    },
  ],
  defaultPaymentMethod: 'pm_001',
  lastUpdated: new Date(),
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletData>(DEFAULT_WALLET);
  const [loading, setLoading] = useState(true);

  // Load wallet data on mount
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const storedWallet = await AsyncStorage.getItem('wallet_data');
      
      if (storedWallet) {
        const parsedWallet = JSON.parse(storedWallet);
        // Convert date strings back to Date objects
        parsedWallet.lastUpdated = new Date(parsedWallet.lastUpdated);
        parsedWallet.transactions = parsedWallet.transactions.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        }));
        setWallet(parsedWallet);
      } else {
        // Use mock data for development
        setWallet(MOCK_WALLET);
        await saveWalletData(MOCK_WALLET);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setWallet(MOCK_WALLET);
    } finally {
      setLoading(false);
    }
  };

  const saveWalletData = async (walletData: WalletData) => {
    try {
      await AsyncStorage.setItem('wallet_data', JSON.stringify(walletData));
    } catch (error) {
      console.error('Error saving wallet data:', error);
    }
  };

  const calculatePaymentBreakdown = (amount: number): PaymentBreakdown => {
    let remaining = amount;
    const breakdown: PaymentBreakdown = {
      wallet: 0,
      earnings: 0,
      card: 0,
      total: amount,
    };

    // 1. Cüzdan bakiyesi kullan
    if (wallet.balance > 0 && remaining > 0) {
      const walletUse = Math.min(remaining, wallet.balance);
      breakdown.wallet = walletUse;
      remaining -= walletUse;
    }

    // 2. Çekilebilir kazançları kullan
    if (wallet.availableEarnings > 0 && remaining > 0) {
      const earningsUse = Math.min(remaining, wallet.availableEarnings);
      breakdown.earnings = earningsUse;
      remaining -= earningsUse;
    }

    // 3. Kalan tutarı karttan öde
    if (remaining > 0) {
      breakdown.card = remaining;
    }

    return breakdown;
  };

  const addEarning = async (amount: number, orderId: string, description: string) => {
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'earning',
      amount,
      status: 'pending', // 7 gün beklemede
      orderId,
      description,
      createdAt: new Date(),
    };

    const updatedWallet = {
      ...wallet,
      pendingEarnings: wallet.pendingEarnings + amount,
      totalLifetimeEarnings: wallet.totalLifetimeEarnings + amount,
      transactions: [newTransaction, ...wallet.transactions],
      lastUpdated: new Date(),
    };

    setWallet(updatedWallet);
    await saveWalletData(updatedWallet);

    // Simulate 7-day delay (for demo, we'll make it instant)
    setTimeout(async () => {
      const completedTransaction = {
        ...newTransaction,
        status: 'completed' as const,
        completedAt: new Date(),
      };

      const finalWallet = {
        ...updatedWallet,
        pendingEarnings: updatedWallet.pendingEarnings - amount,
        availableEarnings: updatedWallet.availableEarnings + amount,
        transactions: updatedWallet.transactions.map(t => 
          t.id === newTransaction.id ? completedTransaction : t
        ),
        lastUpdated: new Date(),
      };

      setWallet(finalWallet);
      await saveWalletData(finalWallet);
    }, 5000); // 5 seconds for demo
  };

  const processPayment = async (amount: number, orderId: string, description: string): Promise<PaymentBreakdown> => {
    const breakdown = calculatePaymentBreakdown(amount);

    // Create spending transaction
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'spending',
      amount,
      status: 'completed',
      orderId,
      description,
      createdAt: new Date(),
      completedAt: new Date(),
    };

    // Update wallet balances
    const updatedWallet = {
      ...wallet,
      balance: wallet.balance - breakdown.wallet,
      availableEarnings: wallet.availableEarnings - breakdown.earnings,
      totalLifetimeSpent: wallet.totalLifetimeSpent + amount,
      transactions: [newTransaction, ...wallet.transactions],
      lastUpdated: new Date(),
    };

    setWallet(updatedWallet);
    await saveWalletData(updatedWallet);

    // TODO: Process card payment for breakdown.card amount
    if (breakdown.card > 0) {
      console.log(`Processing card payment: ₺${breakdown.card}`);
      // Stripe/PayPal integration will go here
    }

    return breakdown;
  };

  const withdrawFunds = async (amount: number, bankAccount: string): Promise<boolean> => {
    if (amount > wallet.availableEarnings) {
      throw new Error('Insufficient available earnings');
    }

    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'withdrawal',
      amount,
      status: 'pending',
      description: `Para çekme - ${bankAccount}`,
      createdAt: new Date(),
    };

    const updatedWallet = {
      ...wallet,
      availableEarnings: wallet.availableEarnings - amount,
      transactions: [newTransaction, ...wallet.transactions],
      lastUpdated: new Date(),
    };

    setWallet(updatedWallet);
    await saveWalletData(updatedWallet);

    // Simulate bank transfer (1-2 days)
    setTimeout(async () => {
      const completedTransaction = {
        ...newTransaction,
        status: 'completed' as const,
        completedAt: new Date(),
      };

      const finalWallet = {
        ...updatedWallet,
        transactions: updatedWallet.transactions.map(t => 
          t.id === newTransaction.id ? completedTransaction : t
        ),
        lastUpdated: new Date(),
      };

      setWallet(finalWallet);
      await saveWalletData(finalWallet);
    }, 10000); // 10 seconds for demo

    return true;
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
    };

    const updatedWallet = {
      ...wallet,
      paymentMethods: [...wallet.paymentMethods, newMethod],
      defaultPaymentMethod: method.isDefault ? newMethod.id : wallet.defaultPaymentMethod,
      lastUpdated: new Date(),
    };

    setWallet(updatedWallet);
    await saveWalletData(updatedWallet);
  };

  const removePaymentMethod = async (methodId: string) => {
    const updatedWallet = {
      ...wallet,
      paymentMethods: wallet.paymentMethods.filter(m => m.id !== methodId),
      defaultPaymentMethod: wallet.defaultPaymentMethod === methodId ? 
        wallet.paymentMethods.find(m => m.id !== methodId)?.id : 
        wallet.defaultPaymentMethod,
      lastUpdated: new Date(),
    };

    setWallet(updatedWallet);
    await saveWalletData(updatedWallet);
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    const updatedWallet = {
      ...wallet,
      paymentMethods: wallet.paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === methodId,
      })),
      defaultPaymentMethod: methodId,
      lastUpdated: new Date(),
    };

    setWallet(updatedWallet);
    await saveWalletData(updatedWallet);
  };

  const refreshWallet = async () => {
    await loadWalletData();
  };

  const value: WalletContextType = {
    wallet,
    loading,
    addEarning,
    processPayment,
    withdrawFunds,
    calculatePaymentBreakdown,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    refreshWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

