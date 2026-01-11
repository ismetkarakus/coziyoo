export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  language: string;
  dateFormat: string;
  phoneFormat: string;
  businessCompliance: {
    required: boolean;
    items: string[];
  };
  deliveryOptions: string[];
  paymentMethods: string[];
  legalRequirements: string[];
}

export const COUNTRIES: Record<string, CountryConfig> = {
  TR: {
    code: 'TR',
    name: 'Türkiye',
    currency: 'TRY',
    currencySymbol: '₺',
    language: 'tr',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: '+90 XXX XXX XX XX',
    businessCompliance: {
      required: false,
      items: [
        'Gıda İşletme Belgesi',
        'Vergi Levhası',
        'KVKK Uyumluluk'
      ]
    },
    deliveryOptions: ['Kapıda Teslim', 'Gel Al', 'Kargo'],
    paymentMethods: ['Nakit', 'Kart', 'Havale', 'Papara', 'İyzico'],
    legalRequirements: ['KVKK', 'Gıda Güvenliği Kanunu']
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: '+44 XXXX XXX XXX',
    businessCompliance: {
      required: true,
      items: [
        'Council Registration',
        'Food Hygiene Certificate',
        'Hygiene Rating',
        'Allergen Declaration',
        'Public Liability Insurance'
      ]
    },
    deliveryOptions: ['Delivery', 'Collection', 'Royal Mail'],
    paymentMethods: ['Cash', 'Card', 'PayPal', 'Stripe', 'Bank Transfer'],
    legalRequirements: ['GDPR', 'Food Safety Act', 'Trading Standards']
  }
};

export const DEFAULT_COUNTRY = 'TR'; // Test için Türkiye sabit