import { foodService } from '../services/foodService';

// Örnek yemek verileri
const SAMPLE_FOODS = [
  {
    name: 'Ev Yapımı Mantı',
    description: 'Geleneksel el açması mantı. Taze malzemelerle hazırlanmış, ev yapımı yoğurt ve tereyağlı sos ile servis edilir.',
    price: 35,
    cookName: 'Ayşe Hanım',
    cookId: 'cook_1', // Bu gerçek kullanıcı ID'si olacak
    category: 'Ana Yemek',
    imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    ingredients: ['Un', 'Et', 'Soğan', 'Yoğurt', 'Tereyağı', 'Baharat'],
    preparationTime: 90,
    servingSize: 4,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 23,
  },
  {
    name: 'Karnıyarık',
    description: 'Fırında pişirilmiş patlıcan, kıymalı iç harcı ile. Geleneksel Türk mutfağının vazgeçilmez lezzeti.',
    price: 28,
    cookName: 'Mehmet Usta',
    cookId: 'cook_2',
    category: 'Ana Yemek',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    ingredients: ['Patlıcan', 'Kıyma', 'Soğan', 'Domates', 'Biber', 'Baharat'],
    preparationTime: 60,
    servingSize: 3,
    isAvailable: true,
    rating: 4.5,
    reviewCount: 18,
  },
  {
    name: 'Mercimek Çorbası',
    description: 'Kırmızı mercimekten yapılan sıcacık çorba. Limon ve baharat ile tatlandırılmış.',
    price: 15,
    cookName: 'Zeynep Hanım',
    cookId: 'cook_3',
    category: 'Çorba',
    imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    ingredients: ['Kırmızı Mercimek', 'Soğan', 'Havuç', 'Patates', 'Baharat'],
    preparationTime: 30,
    servingSize: 6,
    isAvailable: true,
    rating: 4.2,
    reviewCount: 15,
  },
  {
    name: 'Serpme Kahvaltı',
    description: 'Zengin kahvaltı tabağı. Peynir çeşitleri, zeytin, reçel, bal, yumurta ve taze ekmek.',
    price: 55,
    cookName: 'Hasan Usta',
    cookId: 'cook_4',
    category: 'Kahvaltı',
    imageUrl: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
    ingredients: ['Peynir', 'Zeytin', 'Reçel', 'Bal', 'Yumurta', 'Ekmek'],
    preparationTime: 20,
    servingSize: 2,
    isAvailable: true,
    rating: 4.7,
    reviewCount: 31,
  },
  {
    name: 'Çoban Salata',
    description: 'Taze sebzelerden yapılan geleneksel Türk salatası. Domates, salatalık, soğan ve maydanoz.',
    price: 18,
    cookName: 'Zehra Hanım',
    cookId: 'cook_5',
    category: 'Salata',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    ingredients: ['Domates', 'Salatalık', 'Soğan', 'Maydanoz', 'Zeytinyağı'],
    preparationTime: 15,
    servingSize: 4,
    isAvailable: true,
    rating: 4.3,
    reviewCount: 12,
  },
  {
    name: 'İskender Kebap',
    description: 'Döner eti, yoğurt ve tereyağlı sos ile servis edilen geleneksel İskender kebap.',
    price: 42,
    cookName: 'Ali Usta',
    cookId: 'cook_6',
    category: 'Ana Yemek',
    imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop',
    ingredients: ['Döner Eti', 'Pide', 'Yoğurt', 'Tereyağı', 'Domates Sosu'],
    preparationTime: 45,
    servingSize: 2,
    isAvailable: true,
    rating: 4.6,
    reviewCount: 27,
  },
  {
    name: 'Tarhana Çorbası',
    description: 'Ev yapımı tarhana ile hazırlanmış geleneksel çorba. Kış aylarının vazgeçilmez lezzeti.',
    price: 18,
    cookName: 'Fatma Teyze',
    cookId: 'cook_7',
    category: 'Çorba',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    ingredients: ['Tarhana', 'Tereyağı', 'Baharat', 'Limon'],
    preparationTime: 25,
    servingSize: 4,
    isAvailable: true,
    rating: 4.1,
    reviewCount: 19,
  },
  {
    name: 'Menemen',
    description: 'Domates, biber ve yumurta ile yapılan geleneksel Türk kahvaltı yemeği.',
    price: 22,
    cookName: 'Ayşe Hanım',
    cookId: 'cook_1',
    category: 'Kahvaltı',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    ingredients: ['Yumurta', 'Domates', 'Biber', 'Soğan', 'Baharat'],
    preparationTime: 15,
    servingSize: 2,
    isAvailable: true,
    rating: 4.4,
    reviewCount: 16,
  },
];

// Örnek verileri Firebase'e eklemek için fonksiyon
export const seedSampleData = async (): Promise<void> => {
  try {
    console.log('Örnek veriler ekleniyor...');
    
    for (const food of SAMPLE_FOODS) {
      try {
        const foodId = await foodService.addFood(food);
        console.log(`${food.name} eklendi (ID: ${foodId})`);
      } catch (error) {
        console.error(`${food.name} eklenirken hata:`, error);
      }
    }
    
    console.log('Tüm örnek veriler başarıyla eklendi!');
  } catch (error) {
    console.error('Örnek veri ekleme hatası:', error);
    throw error;
  }
};

// Mevcut verileri kontrol etmek için fonksiyon
export const checkExistingData = async (): Promise<boolean> => {
  try {
    const foods = await foodService.getAllFoods();
    return foods.length > 0;
  } catch (error) {
    console.error('Veri kontrol hatası:', error);
    return false;
  }
};
