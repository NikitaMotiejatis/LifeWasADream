import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, useCart } from '@/receptionist/contexts/cartContext';
import VariationModal from '@/receptionist/components/variationModal';
import SearchIcon from '@/icons/searchIcon';
import { useAuth } from '@/global/hooks/auth';
import useSWR from 'swr';
import i18n from '@/i18n';

type ProductGridProps = {
  onProductClick?: (product: Product) => void;
};

export default function ProductGrid({ onProductClick }: ProductGridProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  // TODO: load from backend
  const [category, setCategory] = useState<
    'all' | 'hot drinks' | 'cold drinks' | 'pastries' | 'popular'
  >('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  const handleProductClick = (product: Product) => {
    if (!product.variations || product.variations.length === 0) {
      addToCart(product, []);
      return;
    }
    setSelectedProduct(product);
  };

  return (
    <div>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">{t('menu.title')}</h2>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t('menu.searchPlaceholder')}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm placeholder-gray-500 transition placeholder:leading-tight focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          <SearchIcon className="pointer-events-none absolute top-5 right-2.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(0); }}
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
              onClick={() => { setCategory(cat); setPage(0); }}
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
        <Suspense
          fallback={
            <div className="p-10 text-center text-gray-500">
              {t('orders.loadingProducts')}
            </div>
          }
        >
          <Items
            includes={search}
            category={category}
            page={page}
            pageSize={pageSize}
            onProductClick={onProductClick}
            handleProductClick={handleProductClick}
          ></Items>
        </Suspense>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('common.page')}</span>
          <span className="rounded bg-gray-100 px-2 py-1 text-sm font-semibold">{page + 1}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">
            {t('common.pageSize')}
            <select
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
              value={pageSize}
              onChange={e => { setPageSize(parseInt(e.target.value) || 12); setPage(0); }}
            >
              {[6, 12, 24].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <button
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page <= 0}
          >
            {t('common.prev')}
          </button>
          <button
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
            onClick={() => setPage(page + 1)}
          >
            {t('common.next')}
          </button>
        </div>
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

type ItemProps = {
  includes: string;
  category: string;
  page: number;
  pageSize: number;
  onProductClick?: (product: Product) => void;
  handleProductClick: (product: Product) => void;
};

function Items({
  includes,
  category,
  page,
  pageSize,
  onProductClick,
  handleProductClick,
}: ItemProps) {
  const { t } = useTranslation();
  const { formatPrice, isPaymentStarted } = useCart();
  const { authFetchJson } = useAuth();

  const { data: filteredProducts } = useSWR(
    `order/products?category=${category}`,
    (url: string) => authFetchJson<Product[]>(url, 'GET'),
    {
      suspense: true,
      revalidateOnMount: true,
    },
  );

  if (!filteredProducts) {
    return (
      <div className="text-center text-gray-500">
        {t('orders.notFoundProducts')}
      </div>
    );
  }

  const normalizedIncludes = includes.trim().toLowerCase();
  const searched = normalizedIncludes
    ? filteredProducts.filter(p =>
        (p.nameKey ? t(p.nameKey) : p.name).toLowerCase().includes(normalizedIncludes),
      )
    : filteredProducts;

  const start = page * pageSize;
  const end = start + pageSize;
  const paginated = searched.slice(start, end);

  return (
    <>
      {paginated &&
        paginated.map(product => (
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
            title={
              product.nameKey
                ? t(product.nameKey)
                : i18n.exists(`products.${product.name}`)
                  ? t(`products.${product.name}`)
                  : product.name
            }
          >
            <div className="mb-3 aspect-square w-full max-w-24 rounded-lg bg-gray-200 shadow-inner" />

            <div className="w-full px-2">
              <p
                className="line-clamp-2 text-center text-sm leading-snug font-medium"
                title={
                  product.nameKey
                    ? t(product.nameKey)
                    : i18n.exists(`products.${product.name}`)
                      ? t(`products.${product.name}`)
                      : product.name
                }
              >
                {product.nameKey
                  ? t(product.nameKey)
                  : i18n.exists(`products.${product.name}`)
                    ? t(`products.${product.name}`)
                    : product.name}
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
    </>
  );
}
