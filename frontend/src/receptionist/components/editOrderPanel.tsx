import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart, type Variation, type Product } from '@/receptionist/contexts/cartContext';
import { products as realProducts } from '@/locales/products';
import TrashcanIcon from '@/icons/trashcanIcon';
import SearchIcon from '@/icons/searchIcon';
import VariationModal from '@/receptionist/components/variationModal';

// Define types
export type OrderItem = {
  id: string;
  product: ExtendedProduct;
  quantity: number;
  selectedVariations: Variation[];
  finalPrice: number;
};

export type ExtendedProduct = Product & {
  categories?: string[];
  variations?: Variation[];
};

export type EditOrderPanelProps = {
  mode: 'edit';
  orderId: string;
  onSave?: (items: OrderItem[]) => void;
  onCancel?: () => void;
  onAddMoreItems?: (items: OrderItem[]) => void;
};

const realMenu: ExtendedProduct[] = realProducts.map(product => ({
  ...product,
  categories: product.categories || [],
}));

const getVariationDisplayName = (t: any, variation: Variation): string => {
  if (!variation.nameKey) return variation.name;
  
  try {
    const translated = t(variation.nameKey, { defaultValue: variation.name });
    return translated;
  } catch (error) {
    console.error('Translation error for:', variation.nameKey, error);
    return variation.name;
  }
};

// Initial mock data
const createMockOrderItems = (): OrderItem[] => [
  {
    id: '1',
    product: realMenu.find(p => p.id === 'iced-coffee') || realMenu[0],
    quantity: 2,
    selectedVariations: [
      { name: 'Large', nameKey: 'variations.large', priceModifier: 0.8 },
      { name: 'Almond Milk', nameKey: 'variations.almondMilk', priceModifier: 0.5 },
    ],
    finalPrice: 4.5 + 0.8 + 0.5, // Base price + large + almond milk
  },
  {
    id: '2',
    product: realMenu.find(p => p.id === 'croissant') || realMenu[1],
    quantity: 1,
    selectedVariations: [],
    finalPrice: 3.0,
  },
];

// Product Grid Component
function ProductGridView({ onProductClick }: { onProductClick: (product: Product) => void }) {
  const { t } = useTranslation();
  const { formatPrice } = useCart();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<
    'all' | 'hot drinks' | 'cold drinks' | 'pastries' | 'popular'
  >('all');

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
              {t(`menu.categories.${cat}`, cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <button
            key={product.id}
            onClick={() => onProductClick(product)}
            className="group relative flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
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
                {t('menu.customizable', 'Customizable')}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummaryView({ 
  onBack, 
  showPaymentSection = false,
  paymentMethod,
  setPaymentMethod 
}: { 
  onBack?: () => void;
  showPaymentSection?: boolean;
  paymentMethod?: 'Cash' | 'Card' | 'Gift card';
  setPaymentMethod?: (method: 'Cash' | 'Card' | 'Gift card') => void;
}) {
  const { t } = useTranslation();
  const { 
    itemsList, 
    formatPrice, 
    clearCart, 
    subtotal, 
    discountTotal, 
    total,
    updateQuantity,
    removeItem,
    getFinalPrice,
    generateKey
  } = useCart();

  const hasItems = itemsList.length > 0;

  return (
    <div className="max-h-full flex-1 flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-xl xl:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold xl:text-xl">
          {t('orderSummary.title')}
        </h3>
        {!onBack && hasItems ? (
          <button
            onClick={clearCart}
            className="text-xs font-medium text-red-600 xl:text-sm"
          >
            {t('orderSummary.clearAll', 'Clear All')}
          </button>
        ) : null}
      </div>

      <div className="flex-1 space-y-2">
        {hasItems ? (
          <div className="max-h-150 flex-1 space-y-3 overflow-y-scroll">
            {itemsList.map(item => (
              <div key={generateKey(item.product, item.selectedVariations)} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p 
                      className="font-semibold"
                      title={item.product.nameKey ? t(item.product.nameKey) : item.product.name}
                    >
                      {item.product.nameKey ? t(item.product.nameKey) : item.product.name}
                    </p>
                    {item.selectedVariations.length > 0 && (
                      <p 
                        className="text-sm text-gray-600"
                        title={item.selectedVariations
                          .map(variation => getVariationDisplayName(t, variation))
                          .join(', ')}
                      >
                        {item.selectedVariations
                          .map(variation => getVariationDisplayName(t, variation))
                          .join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatPrice(getFinalPrice(item.product, item.selectedVariations))} × {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(generateKey(item.product, item.selectedVariations))}
                    aria-label={t('orderSummary.removeItem', 'Remove item')}
                  >
                    <TrashcanIcon className="h-5 w-5 text-gray-400 hover:text-red-600" />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(generateKey(item.product, item.selectedVariations), -1)}
                      className="flex h-9 w-9 scale-70 items-center justify-center rounded-full border border-gray-400 text-sm font-light transition hover:bg-gray-200 active:scale-95 xl:scale-100"
                      aria-label={t('orderSummary.decreaseQuantity', 'Decrease quantity')}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-lg font-bold lg:w-12">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(generateKey(item.product, item.selectedVariations), +1)}
                      className="flex h-9 w-9 scale-70 items-center justify-center rounded-full bg-blue-600 font-bold text-white transition hover:bg-blue-700 active:scale-95 xl:scale-100"
                      aria-label={t('orderSummary.increaseQuantity', 'Increase quantity')}
                    >
                      +
                    </button>
                  </div>

                  <div className="text-lg font-bold text-gray-900 xl:ml-auto">
                    {formatPrice(getFinalPrice(item.product, item.selectedVariations) * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-gray-400">
            {t('orderSummary.noItems', 'No items in order')}
          </p>
        )}
      </div>

      {hasItems && (
        <div className="space-y-3">
          {!showPaymentSection && !onBack && (
            <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
              <button className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50">
                {t('orderSummary.saveOrder', 'Save Order')}
              </button>
            </div>
          )}

          <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
            <div className="flex justify-between">
              <span>{t('orderSummary.subtotal', 'Subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between font-bold text-green-600">
                <span>{t('orderSummary.discounts', 'Discounts')}</span>
                <span>- {formatPrice(discountTotal)}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1 xl:flex-row xl:justify-between xl:gap-0">
              <span className="text-xl font-bold text-gray-800 xl:text-2xl">
                {t('orderSummary.total', 'Total')}
              </span>
              <span className="text-2xl font-bold text-blue-600 xl:text-2xl">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {showPaymentSection ? (
            <>
              <button className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50">
                {t('orderSummary.splitBill', 'Split Bill')}
              </button>

              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-700 xl:text-sm">
                  {t('orderSummary.paymentMethod', 'Payment Method')}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cash', 'Card', 'Gift card'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod && setPaymentMethod(method)}
                      className={`rounded-lg py-2 text-xs font-medium transition ${
                        paymentMethod === method
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {t(`orderSummary.paymentMethods.${method}`, method)}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700">
                {t('orderSummary.completePayment', 'Complete Payment')}
              </button>
            </>
          ) : onBack ? (
            <button
              onClick={onBack}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              {t('orderPanel.done', 'Done')}
            </button>
          ) : (
            <button className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700">
              {t('orderSummary.completePayment', 'Complete Payment')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function EditOrderPanel({
  orderId,
  onSave,
  onCancel,
  onAddMoreItems,
}: EditOrderPanelProps) {
  const { t } = useTranslation();
  const { addToCart, clearCart, itemsList } = useCart();

  const [items, setItems] = useState<OrderItem[]>(createMockOrderItems()); // Initialize directly
  const [editingVariationsId, setEditingVariationsId] = useState<string | null>(null);
  const [tempVariations, setTempVariations] = useState<Variation[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Gift card'>('Card');
  const [splitBill, setSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [showProductGrid, setShowProductGrid] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);



  const total = items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);

  const handleIncreaseQuantity = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecreaseQuantity = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity - 1;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const handleRemoveItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));

  const startEditingVariations = (id: string, current: Variation[]) => {
    setEditingVariationsId(id);
    setTempVariations([...current]);
  };

  const confirmEditVariations = () => {
    if (editingVariationsId) {
      setItems(prev => prev.map(item => {
        if (item.id === editingVariationsId) {
          const price = item.product.basePrice + tempVariations.reduce((a, v) => a + (v.priceModifier || 0), 0);
          return { ...item, selectedVariations: tempVariations, finalPrice: price };
        }
        return item;
      }));
      setEditingVariationsId(null);
    }
  };

  const handleAddItemFromGrid = (product: Product) => {
    if (!product.variations || product.variations.length === 0) {
      addToCart(product, []);
      return;
    }
    setSelectedProduct(product);
  };

  const handleStartAddingItems = () => {
    // Clear current cart and add existing items
    clearCart();
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product, item.selectedVariations);
      }
    });
    setShowProductGrid(true);
  };

  const handleDoneAddingItems = () => {
    // Convert cart items to order items format
    const newItems: OrderItem[] = itemsList.map(cartItem => ({
      id: `cart_${Date.now()}_${Math.random()}`,
      product: cartItem.product as ExtendedProduct,
      quantity: cartItem.quantity,
      selectedVariations: cartItem.selectedVariations,
      finalPrice: cartItem.product.basePrice + cartItem.selectedVariations.reduce((a, v) => a + (v.priceModifier || 0), 0),
    }));
    
    setItems(newItems);
    setShowProductGrid(false);
  };

  const handlePayment = () => {
    alert(t('processingPayment', 'Processing payment') + ` ${paymentMethod} - $${total.toFixed(2)}`);
    onSave?.(items);
  };

  if (showProductGrid) {
    return (
      <div className="flex-1 flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {t('editOrder.title', 'Edit Order')} #{orderId}
          </h1>
          <p className="text-sm text-gray-600">
            {t('editOrder.subtitle', 'Add more items to the order')}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Left: Products */}
          <div className="flex-1">
            <ProductGridView onProductClick={handleAddItemFromGrid} />
          </div>

          {/* Right: Order summary */}
          <div className="w-1/3 max-w-md">
            <OrderSummaryView 
              onBack={handleDoneAddingItems}
              showPaymentSection={false}
            />
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

  return (
    <div className="flex-1 flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {t('editOrder.title', 'Edit Order')} #{orderId}
        </h1>
        <p className="text-sm text-gray-600">
          {t('editOrder.subtitle', 'Modify items and quantities')}
        </p>
      </div>

      {/* Order Items List */}
      <div className="mb-6 max-h-[50vh] overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="h-8 w-8 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
            </div>
            <p className="text-gray-400 mb-4">
              {t('orderSummary.noItems', 'No items in order')}
            </p>
            <button
              onClick={handleStartAddingItems}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t('addItem', 'Add Items')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isEditingVariations = editingVariationsId === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-lg bg-gray-200 shadow-inner" />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 
                            className="font-semibold text-gray-900"
                            title={item.product.nameKey ? t(item.product.nameKey) : item.product.name}
                          >
                            {item.product.nameKey ? t(item.product.nameKey) : item.product.name}
                          </h3>
                          <p 
                            className="text-sm text-gray-500"
                            title={item.selectedVariations
                              .map(v => getVariationDisplayName(t, v))
                              .join(', ') || t('orderPanel.noOptions', 'No options')}
                          >
                            {item.selectedVariations
                              .map(v => getVariationDisplayName(t, v))
                              .join(', ') || t('orderPanel.noOptions', 'No options')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${(item.finalPrice * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${item.finalPrice.toFixed(2)} {t('each', 'each')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecreaseQuantity(item.id)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                            title={t('orderSummary.decreaseQuantity', 'Decrease quantity')}
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncreaseQuantity(item.id)}
                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center hover:bg-blue-200"
                            title={t('orderSummary.increaseQuantity', 'Increase quantity')}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="flex gap-2">
                          {/* Change Variations Button */}
                             {!isEditingVariations && item.product.variations && item.product.variations.length > 0 && (
                                  <button
                                    onClick={() => startEditingVariations(item.id, item.selectedVariations)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    {t('orderPanel.change', 'Change')}
                                  </button>
                                )}
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                            title={t('orderSummary.removeItem', 'Remove item')}
                          >
                            {t('orderPanel.remove', 'Remove')}
                          </button>
                        </div>
                      </div>
                      
                      {/* Variations Edit - Old Design */}
{isEditingVariations && item.product.variations && item.product.variations.length > 0 && (
  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
    <p className="text-sm font-medium text-gray-700 mb-2">
      {t('orderPanel.selectOptions', 'Select options')}
    </p>
    <div className="space-y-3">
      {/* Size Variations - Show only if product has size variations */}
      {item.product.variations.some(v => 
        ['Small', 'Medium', 'Large', 'Regular'].includes(v.name)
      ) && (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            {t('variationModal.size', 'Size')}
          </p>
          <div className="flex flex-wrap gap-1">
            {item.product.variations
              .filter(v => ['Small', 'Medium', 'Large', 'Regular'].includes(v.name))
              .map((variation) => {
                const isSelected = tempVariations.some(v => v.name === variation.name);
                return (
                  <button
                    key={variation.name}
                    onClick={() => {
                      // Remove any existing size variation before adding new one
                      const newVariations = tempVariations
                        .filter(v => !['Small', 'Medium', 'Large', 'Regular'].includes(v.name))
                        .concat([variation]);
                      setTempVariations(newVariations);
                    }}
                    className={`px-2 py-1 text-xs rounded border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                    title={getVariationDisplayName(t, variation)}
                  >
                    {getVariationDisplayName(t, variation)}
                    {variation.priceModifier !== 0 && (
                      <span className="ml-1">
                        {variation.priceModifier > 0 ? '+' : ''}
                        ${variation.priceModifier.toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
      
      {/* Milk Variations - Old Design */}
      {item.product.variations.some(v => 
        v.name.toLowerCase().includes('milk') || 
        (v.nameKey && v.nameKey.toLowerCase().includes('milk'))
      ) ? (
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">
            {t('orderPanel.selectMilk', 'Select Milk')}
          </p>
          <div className="flex flex-wrap gap-1">
            {item.product.variations
              .filter(v => 
                v.name.toLowerCase().includes('milk') || 
                (v.nameKey && v.nameKey.toLowerCase().includes('milk'))
              )
              .map((variation) => {
                const isSelected = tempVariations.some(v => v.name === variation.name);
                return (
                  <button
                    key={variation.name}
                    onClick={() => {
                      // Remove any existing milk variation before adding new one
                      const newVariations = tempVariations
                        .filter(v => 
                          !v.name.toLowerCase().includes('milk') && 
                          !(v.nameKey && v.nameKey.toLowerCase().includes('milk'))
                        )
                        .concat([variation]);
                      setTempVariations(newVariations);
                    }}
                    className={`px-2 py-1 text-xs rounded border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                    title={getVariationDisplayName(t, variation)}
                  >
                    {getVariationDisplayName(t, variation)}
                    {variation.priceModifier !== 0 && (
                      <span className="ml-1">
                        {variation.priceModifier > 0 ? '+' : ''}
                        ${variation.priceModifier.toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => setEditingVariationsId(null)}
        className="text-sm text-gray-600 hover:text-gray-800"
      >
        {t('orderPanel.cancel', 'Cancel')}
      </button>
      <button
        onClick={confirmEditVariations}
        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
      >
        {t('orderPanel.done', 'Done')}
      </button>
    </div>
  </div>
)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Items Button */}
      {items.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleStartAddingItems}
            className="w-full rounded-lg border-2 border-blue-300 bg-blue-50 py-3 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <span className="font-medium">
              {t('addItem', 'Add Items')}
            </span>
          </button>
        </div>
      )}
{/* Total Section */}
<div className="mb-6 border-t border-gray-300 pt-4">
  <div className="flex justify-between text-xl font-bold">
    <span>{t('orderSummary.total', 'Total')}</span>
    <span className="text-blue-700">
      ${total.toFixed(2)}
    </span>
  </div>
  
  <div className="text-xs text-gray-500 text-center mt-2">
    {t('orderPanel.totalNote', 'Total amount for order')} #{orderId}
  </div>
</div>


{/* Payment Method Section */}
<div className="mb-6">
  <div>
    <p className="mb-1.5 text-xs font-medium text-gray-700 xl:text-sm">
      {t('orderSummary.paymentMethod', 'Payment Method')}
    </p>
    <div className="grid grid-cols-3 gap-1.5">
      {(['Cash', 'Card', 'Gift card'] as const).map(method => (
        <button
          key={method}
          onClick={() => setPaymentMethod(method)}
          className={`rounded-lg py-2 text-xs font-medium transition ${
            paymentMethod === method
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-gray-400 hover:bg-gray-100'
          }`}
        >
          {t(`orderSummary.paymentMethods.${method}`, method)}
        </button>
      ))}
    </div>
  </div>
</div>

      {/* Split Bill */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            {t('orderSummary.splitBill', 'Split Bill')}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={splitBill}
              onChange={(e) => setSplitBill(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {splitBill && (
          <div className="mt-3">
            <label className="block text-sm text-gray-600 mb-2">
              {t('orderPanel.splitCount', 'Split between')}:
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                −
              </button>
              <span className="text-lg font-medium">{splitCount}</span>
              <button
                onClick={() => setSplitCount(splitCount + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-300">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50"
        >
          {t('orderPanel.cancel', 'Cancel')}
        </button>
        <button
          onClick={() => onSave?.(items)}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t('editOrder.saveChanges', 'Save Changes')}
        </button>
      </div>
      {/* Payment Section */}
<div className="mt-6 pt-6 border-t border-gray-300">
  <button
    onClick={handlePayment}
    className="w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700"
  >
    {t('orderSummary.completePayment', 'Complete Payment')}
  </button>
</div>
    </div>
  );
}

// Simple wrapper component for the page
export default function EditOrderPage() {
  return (
    <div className="p-6">
      <EditOrderPanel 
        orderId="123" 
        mode="edit"
        onSave={(items) => console.log('Save:', items)}
        onCancel={() => console.log('Cancel')}
      />
    </div>
  );
}