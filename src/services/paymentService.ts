import { Alert } from 'react-native';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer';
  name: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  paymentMethodId: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  paymentMethod?: PaymentMethod;
}

class PaymentService {
  private apiKey: string = 'demo_api_key'; // Gerçek uygulamada environment variable'dan alınacak
  private baseUrl: string = 'https://api.demo-payment.com'; // Demo URL

  // Ödeme yöntemlerini getir
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      // Şimdilik mock data döndürüyoruz
      return [
        {
          id: '1',
          type: 'credit_card',
          name: 'Visa ****1234',
          last4: '1234',
          expiryMonth: 12,
          expiryYear: 2025,
          brand: 'visa',
          isDefault: true,
        },
        {
          id: '2',
          type: 'credit_card',
          name: 'MasterCard ****5678',
          last4: '5678',
          expiryMonth: 8,
          expiryYear: 2026,
          brand: 'mastercard',
          isDefault: false,
        },
        {
          id: '3',
          type: 'digital_wallet',
          name: 'Apple Pay',
          isDefault: false,
        },
      ];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error('Ödeme yöntemleri alınamadı');
    }
  }

  // Yeni ödeme yöntemi ekle
  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      const newMethod: PaymentMethod = {
        ...paymentMethod,
        id: Date.now().toString(),
      };
      
      return newMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw new Error('Ödeme yöntemi eklenemedi');
    }
  }

  // Ödeme yöntemini sil
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      console.log('Removing payment method:', paymentMethodId);
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw new Error('Ödeme yöntemi silinemedi');
    }
  }

  // Varsayılan ödeme yöntemini ayarla
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      console.log('Setting default payment method:', paymentMethodId);
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Varsayılan ödeme yöntemi ayarlanamadı');
    }
  }

  // Ödeme işlemi yap
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    try {
      // Gerçek uygulamada ödeme sağlayıcısının API'si kullanılacak
      // Şimdilik demo ödeme simülasyonu
      
      console.log('Processing payment:', paymentRequest);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        return {
          success: true,
          transactionId: `txn_${Date.now()}`,
        };
      } else {
        return {
          success: false,
          error: 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.',
        };
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: 'Ödeme işlemi sırasında bir hata oluştu.',
      };
    }
  }

  // Ödeme durumunu kontrol et
  async checkPaymentStatus(transactionId: string): Promise<'pending' | 'completed' | 'failed' | 'refunded'> {
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      console.log('Checking payment status for:', transactionId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return 'completed';
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new Error('Ödeme durumu kontrol edilemedi');
    }
  }

  // İade işlemi
  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      console.log('Processing refund for:', transactionId, 'amount:', amount);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        transactionId: `refund_${Date.now()}`,
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: 'İade işlemi başarısız oldu.',
      };
    }
  }

  // Kart bilgilerini doğrula
  validateCardNumber(cardNumber: string): boolean {
    // Luhn algoritması ile kart numarası doğrulama
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // CVV doğrula
  validateCVV(cvv: string, cardType: string = 'visa'): boolean {
    const cleanCVV = cvv.replace(/\s/g, '');
    
    if (cardType === 'amex') {
      return /^\d{4}$/.test(cleanCVV);
    } else {
      return /^\d{3}$/.test(cleanCVV);
    }
  }

  // Son kullanma tarihi doğrula
  validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    if (year < currentYear) {
      return false;
    }
    
    if (year === currentYear && month < currentMonth) {
      return false;
    }
    
    return month >= 1 && month <= 12;
  }

  // Kart türünü belirle
  getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'amex';
    } else if (/^6/.test(cleanNumber)) {
      return 'discover';
    }
    
    return 'unknown';
  }

  // Kart numarasını formatla
  formatCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const groups = cleanNumber.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19); // Max 16 digits + 3 spaces
  }

  // Güvenli ödeme için 3D Secure kontrolü
  async check3DSecure(paymentMethodId: string, amount: number): Promise<boolean> {
    try {
      // Gerçek uygulamada 3D Secure API çağrısı yapılacak
      console.log('Checking 3D Secure for:', paymentMethodId, amount);
      
      // Simulate 3D Secure check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Yüksek tutarlar için 3D Secure gerekli
      return amount > 100;
    } catch (error) {
      console.error('Error checking 3D Secure:', error);
      return true; // Güvenlik için varsayılan olarak gerekli kabul et
    }
  }

  // Ödeme geçmişini getir
  async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      // Gerçek uygulamada API çağrısı yapılacak
      return [
        {
          id: '1',
          orderId: 'order_123',
          amount: 45.50,
          currency: 'TRY',
          status: 'completed',
          paymentMethod: 'Visa ****1234',
          date: new Date('2024-01-15'),
          description: 'Ev Yapımı Mantı - Ayşe Hanım',
        },
        {
          id: '2',
          orderId: 'order_124',
          amount: 32.00,
          currency: 'TRY',
          status: 'completed',
          paymentMethod: 'MasterCard ****5678',
          date: new Date('2024-01-10'),
          description: 'Karnıyarık - Mehmet Usta',
        },
      ];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw new Error('Ödeme geçmişi alınamadı');
    }
  }
}

export const paymentService = new PaymentService();









