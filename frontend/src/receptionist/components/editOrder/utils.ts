import { Variation } from '@/receptionist/contexts/cartContext';
import { ExtendedProduct, OrderItem } from './types';
import { products as realProducts } from '@/locales/products';

export const realMenu: ExtendedProduct[] = realProducts.map(product => ({
  ...product,
  categories: product.categories || [],
  variations: product.variations?.map(v => ({
    ...v,
    nameKey: v.nameKey || `variationModal.variations.${v.name}`,
  })) || [],
}));

export const getVariationDisplayName = (t: any, variation: Variation): string => {
  if (!variation.nameKey) return variation.name;
  const translated = t(variation.nameKey);
  return translated !== variation.nameKey ? translated : variation.name;
};

export const createMockOrderItems = (): OrderItem[] => [
  {
    id: '1',
    product: realMenu.find(p => p.id === 'iced-coffee') || realMenu[0],
    quantity: 2,
    selectedVariations: [
      { name: 'Large', nameKey: 'variationModal.variations.Large', priceModifier: 0.8 },
      { name: 'Almond Milk', nameKey: 'variationModal.variations.Almond Milk', priceModifier: 0.5 },
    ],
    finalPrice: 4.5 + 0.8 + 0.5,
  },
  {
    id: '2',
    product: realMenu.find(p => p.id === 'croissant') || realMenu[1],
    quantity: 1,
    selectedVariations: [],
    finalPrice: 3.0,
  },
];