// UK's 14 Major Allergens (Natasha's Law)
export const UK_ALLERGENS = [
  {
    id: 'cereals',
    name: 'Cereals containing gluten',
    description: 'Wheat, rye, barley, oats, spelt, kamut',
    icon: '🌾',
  },
  {
    id: 'crustaceans',
    name: 'Crustaceans',
    description: 'Prawns, crabs, lobster, crayfish',
    icon: '🦐',
  },
  {
    id: 'eggs',
    name: 'Eggs',
    description: 'All egg products',
    icon: '🥚',
  },
  {
    id: 'fish',
    name: 'Fish',
    description: 'All fish and fish products',
    icon: '🐟',
  },
  {
    id: 'peanuts',
    name: 'Peanuts',
    description: 'Groundnuts and peanut products',
    icon: '🥜',
  },
  {
    id: 'soybeans',
    name: 'Soybeans',
    description: 'Soya and soy products',
    icon: '🫘',
  },
  {
    id: 'milk',
    name: 'Milk',
    description: 'Dairy products including lactose',
    icon: '🥛',
  },
  {
    id: 'nuts',
    name: 'Tree nuts',
    description: 'Almonds, hazelnuts, walnuts, cashews, pecans, pistachios, Brazil nuts, macadamia nuts',
    icon: '🌰',
  },
  {
    id: 'celery',
    name: 'Celery',
    description: 'Celery and celeriac',
    icon: '🥬',
  },
  {
    id: 'mustard',
    name: 'Mustard',
    description: 'Mustard seeds and products',
    icon: '🌿',
  },
  {
    id: 'sesame',
    name: 'Sesame seeds',
    description: 'Sesame seeds and products',
    icon: '🌱',
  },
  {
    id: 'sulphites',
    name: 'Sulphur dioxide and sulphites',
    description: 'Preservatives in wine, dried fruit, etc.',
    icon: '🧪',
  },
  {
    id: 'lupin',
    name: 'Lupin',
    description: 'Lupin beans and flour',
    icon: '🫛',
  },
  {
    id: 'molluscs',
    name: 'Molluscs',
    description: 'Mussels, oysters, snails, squid',
    icon: '🦪',
  },
] as const;

// Türkiye'nin 14 Temel Alerjeni (Gıda Güvenliği Kanunu)
export const TR_ALLERGENS = [
  {
    id: 'cereals',
    name: 'Gluten İçeren Tahıllar',
    description: 'Buğday, çavdar, arpa, yulaf, spelt, kamut',
    icon: '🌾',
  },
  {
    id: 'crustaceans',
    name: 'Kabuklu Deniz Ürünleri',
    description: 'Karides, yengeç, ıstakoz, kerevit',
    icon: '🦐',
  },
  {
    id: 'eggs',
    name: 'Yumurta',
    description: 'Tüm yumurta ürünleri',
    icon: '🥚',
  },
  {
    id: 'fish',
    name: 'Balık',
    description: 'Tüm balık ve balık ürünleri',
    icon: '🐟',
  },
  {
    id: 'peanuts',
    name: 'Yer Fıstığı',
    description: 'Yer fıstığı ve ürünleri',
    icon: '🥜',
  },
  {
    id: 'soybeans',
    name: 'Soya',
    description: 'Soya ve soya ürünleri',
    icon: '🫘',
  },
  {
    id: 'milk',
    name: 'Süt',
    description: 'Laktoz dahil süt ürünleri',
    icon: '🥛',
  },
  {
    id: 'nuts',
    name: 'Sert Kabuklu Meyveler',
    description: 'Badem, fındık, ceviz, kaju, pekan, antep fıstığı, Brezilya fıstığı, makadamya',
    icon: '🌰',
  },
  {
    id: 'celery',
    name: 'Kereviz',
    description: 'Kereviz ve kereviz kökü',
    icon: '🥬',
  },
  {
    id: 'mustard',
    name: 'Hardal',
    description: 'Hardal tohumu ve ürünleri',
    icon: '🌿',
  },
  {
    id: 'sesame',
    name: 'Susam',
    description: 'Susam tohumu ve ürünleri',
    icon: '🌱',
  },
  {
    id: 'sulphites',
    name: 'Kükürt Dioksit ve Sülfitler',
    description: 'Şarap, kurutulmuş meyve vb. koruyucular',
    icon: '🧪',
  },
  {
    id: 'lupin',
    name: 'Acı Bakla',
    description: 'Acı bakla ve unu',
    icon: '🫛',
  },
  {
    id: 'molluscs',
    name: 'Yumuşakçalar',
    description: 'Midye, istiridye, salyangoz, kalamar',
    icon: '🦪',
  },
] as const;

export type AllergenId = typeof UK_ALLERGENS[number]['id'];

export const getAllergenById = (id: AllergenId) => {
  return UK_ALLERGENS.find(allergen => allergen.id === id);
};

export const getAllergenNames = () => {
  return UK_ALLERGENS.map(allergen => allergen.name);
};

