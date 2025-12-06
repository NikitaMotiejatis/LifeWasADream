import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, useCart } from '@/receptionist/contexts/cartContext';
import VariationModal from '@/receptionist/components/variationModal';
import SearchIcon from '@/icons/searchIcon';
import { realMenu } from './utils';
import type { ExtendedProduct } from './types';

type ProductGridProps = {
  onProductClick?: (product: ExtendedProduct) => void;
};

export default function ProductGrid({ onProductClick }: ProductGridProps) {
  const { t } = useTranslation();
  const { addToCart, formatPrice, isPaymentStarted } = useCart();

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

  const filteredProducts = realMenu.filter(p => {
    const matchCategory =
      category === 'all' || p.categories?.includes(category);
    const displayName = p.nameKey ? t(p.nameKey) : p.name;
    const matchSearch = displayName
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">{t('menu.title')}</h2>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t('menu.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm placeholder-gray-500 transition placeholder:leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          <SearchIcon className="pointer-events-none absolute top-5 right-2.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-5 right-2 -translate-y-1/2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-300"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {(
            ['all', 'popular', 'hot drinks', 'cold drinks', 'pastries'] as const
          ).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                category === cat
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-400 hover:bg-gray-100'
              }`}
            >
              {t(`menu.categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() =>
              onProductClick
                ? onProductClick(product)
                : handleProductClick(product)
            }
            disabled={isPaymentStarted}
            className={`group relative flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all ${
              isPaymentStarted
                ? 'cursor-not-allowed opacity-65'
                : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-95'
            }`}
            title={product.nameKey ? t(product.nameKey) : product.name}
          >
            <div className="mb-3 aspect-square w-full max-w-24 rounded-lg bg-gray-200 shadow-inner" />

            <div className="w-full px-2">
              <p
                className="line-clamp-2 text-center text-sm leading-snug font-medium"
                title={product.nameKey ? t(product.nameKey) : product.name}
              >
                {product.nameKey ? t(product.nameKey) : product.name}
              </p>
            </div>
            <p className="mt-1 text-gray-600">
              {t('menu.fromPrice', { price: formatPrice(product.basePrice) })}
            </p>

            {product.variations && product.variations.length > 0 && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">
                {t('menu.customizable')}
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
