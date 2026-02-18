export interface CategoryItem {
  id: string;
  tr: string;
  en: string;
  icon: string;
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  { id: 'all', tr: 'Tümü', en: 'All', icon: '✨' },
  { id: 'main', tr: 'Ana Yemek', en: 'Main Dish', icon: '🍱' },
  { id: 'soup', tr: 'Çorba', en: 'Soup', icon: '🍲' },
  { id: 'appetizer', tr: 'Meze', en: 'Appetizer', icon: '🥗' },
  { id: 'salad', tr: 'Salata', en: 'Salad', icon: '🥗' },
  { id: 'breakfast', tr: 'Kahvaltı', en: 'Breakfast', icon: '🥐' },
  { id: 'dessert', tr: 'Tatlı/Kek', en: 'Dessert/Cake', icon: '🍰' },
  { id: 'drinks', tr: 'İçecekler', en: 'Drinks', icon: '🥤' },
  { id: 'vegetarian', tr: 'Vejetaryen', en: 'Vegetarian', icon: '🥬' },
  { id: 'gluten_free', tr: 'Glutensiz', en: 'Gluten Free', icon: '🌾' },
];

export const categoriesData = {
  items: CATEGORY_ITEMS,
};
