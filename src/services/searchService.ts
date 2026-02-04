import { foodService, Food } from './foodService';

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
  async searchFoods(
    filters: SearchFilters = {},
    pageSize: number = 20
  ): Promise<SearchResult> {
    try {
      const allFoods = await foodService.getAllFoods();
      let filtered = this.applyClientSideFilters(allFoods, filters);

      // Apply Sort
      if (filters.sortBy) {
          filtered = this.applySort(filtered, filters.sortBy);
      }

      const hasMore = filtered.length > pageSize;
      const foods = filtered.slice(0, pageSize);

      return {
        foods,
        totalCount: filtered.length,
        hasMore
      };
    } catch (error) {
      console.error('Error searching foods:', error);
      throw new Error('SEARCH_ERROR');
    }
  }

  private applySort(foods: Food[], sortBy: SearchFilters['sortBy']): Food[] {
      const sorted = [...foods];
      switch (sortBy) {
          case 'price_asc': return sorted.sort((a, b) => a.price - b.price);
          case 'price_desc': return sorted.sort((a, b) => b.price - a.price);
          case 'rating_desc': return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          case 'newest': return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          case 'popularity': return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
          default: return sorted;
      }
  }

  private applyClientSideFilters(foods: Food[], filters: SearchFilters): Food[] {
    let filtered = foods.filter(f => filters.isAvailable !== false ? f.isAvailable : true);

    if (filters.query && filters.query.trim()) {
      const searchTerm = filters.query.toLowerCase().trim();
      filtered = filtered.filter(food => 
        food.name.toLowerCase().includes(searchTerm) ||
        food.description.toLowerCase().includes(searchTerm) ||
        food.cookName.toLowerCase().includes(searchTerm) ||
        food.category.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category && filters.category !== 'Tümü' && filters.category !== 'All') {
      filtered = filtered.filter(f => f.category === filters.category);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(food => 
        food.price >= filters.priceRange!.min && 
        food.price <= filters.priceRange!.max
      );
    }

    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter(f => (f.rating || 0) >= filters.rating!);
    }

    return filtered;
  }

  getPriceRanges() {
    return [
      { label: '0-25 ₺', min: 0, max: 25 },
      { label: '25-50 ₺', min: 25, max: 50 },
      { label: '50-75 ₺', min: 50, max: 75 },
      { label: '75-100 ₺', min: 75, max: 100 },
      { label: '100+ ₺', min: 100, max: 1000 },
    ];
  }

  getSortOptions(): Array<{ label: string; value: SearchFilters['sortBy'] }> {
    return [
      { label: 'En Yeni', value: 'newest' },
      { label: 'En Popüler', value: 'popularity' },
      { label: 'En Yüksek Puan', value: 'rating_desc' },
      { label: 'Fiyat (Düşük-Yüksek)', value: 'price_asc' },
      { label: 'Fiyat (Yüksek-Düşük)', value: 'price_desc' },
    ];
  }
}

export const searchService = new SearchService();
