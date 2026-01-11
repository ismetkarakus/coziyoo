export const translations = {
  tr: {
    // Genel
    welcome: 'Hoş Geldiniz',
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    cancel: 'İptal',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    back: 'Geri',
    next: 'İleri',
    
    // Ana Sayfa
    home: 'Ana Sayfa',
    categories: 'Kategoriler',
    searchPlaceholder: 'Bugün ne yemek istersin?',
    nearMe: 'yakınımda',
    locationLoading: 'konum alınıyor...',
    
    // Yemek
    addToCart: 'Sepete Ekle',
    price: 'Fiyat',
    rating: 'Puan',
    distance: 'Mesafe',
    pickup: 'Gel Al',
    delivery: 'Teslimat',
    
    // Satıcı
    sellerPanel: 'Satıcı Paneli',
    addMeal: 'Yemek Ekle',
    manageMeals: 'Yemeklerimi Yönet',
    earnings: 'Kazançlar',
    wallet: 'Cüzdanım',
    messages: 'Mesajlar',
    profile: 'Profil',
    
    // Kategoriler
    allCategories: 'Tümü',
    mainDish: 'Ana Yemek',
    soup: 'Çorba',
    appetizer: 'Meze',
    salad: 'Salata',
    breakfast: 'Kahvaltı',
    dessert: 'Tatlı/Kek',
    drinks: 'İçecekler',
    vegetarian: 'Vejetaryen',
    glutenFree: 'Gluten Free',
    
    // Business Compliance (TR)
    businessCompliance: 'İş Yeri Belgeleri',
    foodLicense: 'Gıda İşletme Belgesi',
    taxDocument: 'Vergi Levhası',
    kvkkCompliance: 'KVKK Uyumluluk',
    
    // Ödeme
    paymentMethods: 'Ödeme Yöntemleri',
    cash: 'Nakit',
    card: 'Kart',
    bankTransfer: 'Havale',
  },
  en: {
    // General
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    
    // Home
    home: 'Home',
    categories: 'Categories',
    searchPlaceholder: 'What would you like to eat today?',
    nearMe: 'near me',
    locationLoading: 'getting location...',
    
    // Food
    addToCart: 'Add to Cart',
    price: 'Price',
    rating: 'Rating',
    distance: 'Distance',
    pickup: 'Collection',
    delivery: 'Delivery',
    
    // Seller
    sellerPanel: 'Seller Dashboard',
    addMeal: 'Add Food',
    manageMeals: 'Manage Foods',
    earnings: 'Earnings',
    wallet: 'Wallet',
    
    // Business Compliance (UK)
    businessCompliance: 'UK Food Business Compliance',
    councilRegistration: 'Council Registration',
    hygieneRating: 'Hygiene Rating',
    allergenDeclaration: 'Allergen Declaration',
    publicLiabilityInsurance: 'Public Liability Insurance',
    
    // Payment
    paymentMethods: 'Payment Methods',
    cash: 'Cash',
    card: 'Card',
    bankTransfer: 'Bank Transfer',
  }
};

export type TranslationKey = keyof typeof translations.tr;