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

export type AllergenId = typeof UK_ALLERGENS[number]['id'];

export const getAllergenById = (id: AllergenId) => {
  return UK_ALLERGENS.find(allergen => allergen.id === id);
};

export const getAllergenNames = () => {
  return UK_ALLERGENS.map(allergen => allergen.name);
};

