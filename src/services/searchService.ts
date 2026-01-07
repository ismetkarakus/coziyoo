import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Food } from './foodService';

export interface SearchFilters {
  query?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  deliveryOptions?: ('pickup' | 'delivery')[];
  maxDistance?: number;
  cookName?: string;
  isAvailable?: boolean;
  preparationTime?: {
    max: number; // minutes
  };
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popularity' | 'distance';
}

export interface SearchResult {
  foods: Food[];
  totalCount: number;
  hasMore: boolean;
}

class SearchService {
  // Ana arama fonksiyonu
  async searchFoods(
    filters: SearchFilters = {},
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<SearchResult> {
    try {
      let baseQuery = collection(db, 'foods');
      const constraints: any[] = [];

      // Temel filtreler
      if (filters.isAvailable !== false) {
        constraints.push(where('isAvailable', '==', true));
      }

      // Kategori filtresi
      if (filters.category && filters.category !== 'Tümü') {
        constraints.push(where('category', '==', filters.category));
      }

      // Satıcı adı filtresi
      if (filters.cookName) {
        constraints.push(where('cookName', '>=', filters.cookName));
        constraints.push(where('cookName', '<=', filters.cookName + '\uf8ff'));
      }

      // Rating filtresi
      if (filters.rating && filters.rating > 0) {
        constraints.push(where('rating', '>=', filters.rating));
      }

      // Teslimat seçenekleri
      if (filters.deliveryOptions && filters.deliveryOptions.length > 0) {
        if (filters.deliveryOptions.includes('pickup') && !filters.deliveryOptions.includes('delivery')) {
          constraints.push(where('hasPickup', '==', true));
        } else if (filters.deliveryOptions.includes('delivery') && !filters.deliveryOptions.includes('pickup')) {
          constraints.push(where('hasDelivery', '==', true));
        }
        // Her ikisi de seçiliyse özel filtreleme yapmıyoruz
      }

      // Sıralama
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            constraints.push(orderBy('price', 'asc'));
            break;
          case 'price_desc':
            constraints.push(orderBy('price', 'desc'));
            break;
          case 'rating_desc':
            constraints.push(orderBy('rating', 'desc'));
            break;
          case 'newest':
            constraints.push(orderBy('createdAt', 'desc'));
            break;
          case 'popularity':
            constraints.push(orderBy('reviewCount', 'desc'));
            break;
          default:
            constraints.push(orderBy('createdAt', 'desc'));
        }
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // Sayfa limiti
      constraints.push(limit(pageSize + 1)); // +1 to check if there are more results

      // Pagination
      if (lastDoc) {
        constraints.push(startAt(lastDoc));
      }

      const q = query(baseQuery, ...constraints);
      const querySnapshot = await getDocs(q);
      
      let foods: Food[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        foods.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Food);
      });

      // Client-side filtering for complex filters
      foods = this.applyClientSideFilters(foods, filters);

      const hasMore = foods.length > pageSize;
      if (hasMore) {
        foods = foods.slice(0, pageSize);
      }

      return {
        foods,
        totalCount: foods.length,
        hasMore
      };
    } catch (error) {
      console.error('Error searching foods:', error);
      throw new Error('Arama yapılırken hata oluştu');
    }
  }

  // Client-side filtering for complex conditions
  private applyClientSideFilters(foods: Food[], filters: SearchFilters): Food[] {
    let filtered = [...foods];

    // Text search in name and description
    if (filters.query && filters.query.trim()) {
      const searchTerm = filters.query.toLowerCase().trim();
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(searchTerm) ||
        food.description.toLowerCase().includes(searchTerm) ||
        food.cookName.toLowerCase().includes(searchTerm) ||
        food.category.toLowerCase().includes(searchTerm)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(food => 
        food.price >= filters.priceRange!.min && 
        food.price <= filters.priceRange!.max
      );
    }

    // Preparation time filter
    if (filters.preparationTime) {
      filtered = filtered.filter(food => 
        food.preparationTime <= filters.preparationTime!.max
      );
    }

    // Distance filter (would need user location)
    if (filters.maxDistance) {
      filtered = filtered.filter(food => 
        (food.maxDeliveryDistance || 0) <= filters.maxDistance!
      );
    }

    return filtered;
  }

  // Popüler arama terimleri
  async getPopularSearchTerms(): Promise<string[]> {
    // Bu gerçek uygulamada analytics'ten gelecek
    return [
      'köfte',
      'pilav',
      'çorba',
      'börek',
      'pasta',
      'salata',
      'kebap',
      'mantı'
    ];
  }

  // Kategorilere göre yemek sayısı
  async getFoodCountByCategory(): Promise<Record<string, number>> {
    try {
      const q = query(
        collection(db, 'foods'),
        where('isAvailable', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const categoryCounts: Record<string, number> = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const category = data.category || 'Diğer';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      return categoryCounts;
    } catch (error) {
      console.error('Error getting category counts:', error);
      return {};
    }
  }

  // Fiyat aralığı önerileri
  getPriceRanges(): Array<{ label: string; min: number; max: number }> {
    return [
      { label: '0-25 ₺', min: 0, max: 25 },
      { label: '25-50 ₺', min: 25, max: 50 },
      { label: '50-75 ₺', min: 50, max: 75 },
      { label: '75-100 ₺', min: 75, max: 100 },
      { label: '100+ ₺', min: 100, max: 1000 },
    ];
  }

  // Rating seçenekleri
  getRatingOptions(): Array<{ label: string; value: number }> {
    return [
      { label: '4+ Yıldız', value: 4 },
      { label: '3+ Yıldız', value: 3 },
      { label: '2+ Yıldız', value: 2 },
      { label: '1+ Yıldız', value: 1 },
    ];
  }

  // Hazırlık süresi seçenekleri
  getPreparationTimeOptions(): Array<{ label: string; value: number }> {
    return [
      { label: '15 dakika', value: 15 },
      { label: '30 dakika', value: 30 },
      { label: '45 dakika', value: 45 },
      { label: '1 saat', value: 60 },
      { label: '1+ saat', value: 120 },
    ];
  }

  // Sıralama seçenekleri
  getSortOptions(): Array<{ label: string; value: SearchFilters['sortBy'] }> {
    return [
      { label: 'En Yeni', value: 'newest' },
      { label: 'En Popüler', value: 'popularity' },
      { label: 'En Yüksek Puan', value: 'rating_desc' },
      { label: 'Fiyat (Düşük-Yüksek)', value: 'price_asc' },
      { label: 'Fiyat (Yüksek-Düşük)', value: 'price_desc' },
    ];
  }

  // Otomatik tamamlama önerileri
  async getAutocompleteSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
      const searchTerm = query.toLowerCase();
      
      // Food names
      const foodQuery = query(
        collection(db, 'foods'),
        where('isAvailable', '==', true),
        orderBy('name'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff'),
        limit(5)
      );
      
      const foodSnapshot = await getDocs(foodQuery);
      const suggestions: string[] = [];
      
      foodSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name && !suggestions.includes(data.name)) {
          suggestions.push(data.name);
        }
      });

      // Cook names
      const cookQuery = query(
        collection(db, 'foods'),
        where('isAvailable', '==', true),
        orderBy('cookName'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff'),
        limit(3)
      );
      
      const cookSnapshot = await getDocs(cookQuery);
      
      cookSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.cookName && !suggestions.includes(data.cookName)) {
          suggestions.push(data.cookName);
        }
      });

      return suggestions.slice(0, 8);
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      return [];
    }
  }

  // Yakındaki yemekleri bul (konum bazlı)
  async findNearbyFoods(
    userLat: number,
    userLng: number,
    radiusKm: number = 10
  ): Promise<Food[]> {
    // Bu gerçek uygulamada Geohash veya Firebase Extensions kullanılacak
    // Şimdilik basit bir implementasyon
    try {
      const q = query(
        collection(db, 'foods'),
        where('isAvailable', '==', true),
        where('hasDelivery', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const nearbyFoods: Food[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Basit mesafe kontrolü (gerçek uygulamada daha karmaşık olacak)
        const maxDistance = data.maxDeliveryDistance || 5;
        if (maxDistance >= radiusKm) {
          nearbyFoods.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Food);
        }
      });
      
      return nearbyFoods;
    } catch (error) {
      console.error('Error finding nearby foods:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();

