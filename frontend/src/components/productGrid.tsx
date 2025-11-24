import { useState } from 'react';
import { Product, useCart } from '../contexts/cartContext';
import VariationModal from './variationModal';
import SearchIcon from './icons/searchIcon';

const products: Product[] = [
  {
    id: 'hot-coffee',
    name: 'Hot Coffee',
    basePrice: 3.5,
    categories: ['hot drinks', 'popular'],
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    basePrice: 4.5,
    categories: ['hot drinks'],
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    basePrice: 4.5,
    categories: ['cold drinks', 'popular'],
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Medium', priceModifier: 0.5 },
      { name: 'Large', priceModifier: 1.0 },
      { name: 'Oat Milk', priceModifier: 0.6 },
      { name: 'Almond Milk', priceModifier: 0.7 },
    ],
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte',
    basePrice: 5.0,
    categories: ['cold drinks'],
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Medium', priceModifier: 0.5 },
      { name: 'Large', priceModifier: 1.0 },
      { name: 'Oat Milk', priceModifier: 0.6 },
      { name: 'Almond Milk', priceModifier: 0.7 },
    ],
  },
  {
    id: 'smoothie-berry',
    name: 'Smoothie – Berry Blast',
    basePrice: 5.5,
    categories: ['cold drinks'],
  },
  {
    id: 'smoothie-mango',
    name: 'Smoothie – Mango Paradise',
    basePrice: 5.5,
    categories: ['cold drinks'],
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    basePrice: 3.5,
    categories: ['cold drinks'],
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
  {
    id: 'lemonade',
    name: 'Fresh Lemonade',
    basePrice: 4.0,
    categories: ['cold drinks'],
  },
  {
    id: 'orange-juice',
    name: 'Orange Juice',
    basePrice: 4.25,
    categories: ['cold drinks'],
  },
  {
    id: 'chocolate-milkshake',
    name: 'Chocolate Milkshake',
    basePrice: 5.75,
    categories: ['cold drinks', 'popular'],
  },
  {
    id: 'caramel-frappuccino',
    name: 'Caramel Frappuccino',
    basePrice: 5.5,
    categories: ['cold drinks'],
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
  {
    id: 'croissant',
    name: 'Butter Croissant',
    basePrice: 3.0,
    categories: ['pastries', 'popular'],
  },
  {
    id: 'chocolate-croissant',
    name: 'Chocolate Croissant',
    basePrice: 3.4,
    categories: ['pastries'],
  },
  {
    id: 'muffin-blueberry',
    name: 'Blueberry Muffin',
    basePrice: 2.8,
    categories: ['pastries'],
  },
  {
    id: 'cinnamon-roll',
    name: 'Cinnamon Roll',
    basePrice: 3.6,
    categories: ['pastries'],
  },
];

export default function ProductGrid() {
  const { addToCart, formatPrice } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<
    'all' | 'hot drinks' | 'cold drinks' | 'pastries' | 'popular'
  >('all');

  const handleProductClick = (product: Product) => {
    if (!product.variations || product.variations.length === 0) {
      addToCart(product, []);
      return;
    }
    setSelectedProduct(product);
  };

  const filteredProducts = products.filter(p => {
    const matchCategory =
      category === 'all' || p.categories?.includes(category);

    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Menu</h2>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm placeholder-gray-500 shadow-sm transition placeholder:leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            title="Search items..."
          />

          {search.length === 0 && (
            <SearchIcon className="pointer-events-none absolute top-5 right-2.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
          )}

          {search.length > 0 && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-5 right-2 -translate-y-1/2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-300"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {['all', 'popular', 'hot drinks', 'cold drinks', 'pastries'].map(
            cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat as any)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                  category === cat
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-400 hover:bg-gray-100'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="group relative flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <div className="mb-3 aspect-square w-full max-w-24 rounded-lg bg-gray-200 shadow-inner" />

            <div className="w-full px-2">
              <p
                className="line-clamp-2 text-center text-sm leading-snug font-medium"
                title={product.name}
              >
                {product.name}
              </p>
            </div>
            <p className="mt-1 text-gray-600">
              from {formatPrice(product.basePrice)}
            </p>
            {product.variations && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">
                <span className="hidden lg:inline">Customizable</span>
                <span className="lg:hidden">Custom</span>
              </p>
            )}
          </button>
        ))}
      </div>

      {selectedProduct && selectedProduct.variations && (
        <VariationModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={selectedVariations => {
            addToCart(selectedProduct, selectedVariations);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
