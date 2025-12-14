import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCart,
  type Variation,
  type Cents,
} from '@/receptionist/contexts/cartContext';
import VariationModal from '@/receptionist/components/variationModal';
import ProductGrid from './productGrid';
import OrderSummary from './orderSummary';
import { OrderItemRow } from './orderItemRow';
import type { EditOrderPanelProps, OrderItem, ExtendedProduct } from './types';
import { createMockOrderItems } from './utils';
import { ShoppingCartIcon } from '@/icons/shoppingCartItemIcon';
import { PlusIcon } from '@/icons/plusIcon';
import { useCurrency } from '@/global/contexts/currencyContext';

const clampToCents = (value: number): Cents =>
  Math.max(0, Math.round(value));

export function EditOrderPanel({
  orderId,
  onSave,
  onCancel,
}: EditOrderPanelProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const {
    addToCart,
    clearCart,
    itemsList,
    promotions,
    cartDiscount,
    getFinalPrice,
  } = useCart();

  const [items, setItems] = useState<OrderItem[]>(createMockOrderItems());
  const [editingVariationsId, setEditingVariationsId] = useState<string | null>(
    null,
  );
  const [tempVariations, setTempVariations] = useState<Variation[]>([]);
  const [showProductGrid, setShowProductGrid] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ExtendedProduct | null>(null);

  const { subtotal, itemDiscountsTotal, cartDiscountAmount, total } = useMemo(
    () => {
      let subtotal = 0;
      let itemDiscountsTotal = 0;
      let afterItemsTotal = 0;

      items.forEach(item => {
        const basePrice = getFinalPrice(item.product, item.selectedVariations);
        const promo = promotions[item.product.id];

        let priceAfterPromo = basePrice;

        if (promo) {
          if (promo.type === 'percent') {
            priceAfterPromo = clampToCents(
              basePrice * (1 - promo.value / 100),
            );
          } else if (promo.type === 'fixed') {
            priceAfterPromo = clampToCents(priceAfterPromo - promo.value);
          } else if (promo.type === 'price') {
            priceAfterPromo = clampToCents(promo.value);
          }
        }

        const itemDiscount = basePrice - priceAfterPromo;

        subtotal += basePrice * item.quantity;
        itemDiscountsTotal += itemDiscount * item.quantity;
        afterItemsTotal += priceAfterPromo * item.quantity;
      });

      let cartDiscountAmount = 0;
      if (cartDiscount && afterItemsTotal > 0) {
        if (cartDiscount.type === 'percent') {
          cartDiscountAmount = clampToCents(
            afterItemsTotal * (cartDiscount.value / 100),
          );
        } else if (cartDiscount.type === 'fixed') {
          cartDiscountAmount = Math.min(afterItemsTotal, cartDiscount.value);
        }
      }

      const total = Math.max(0, afterItemsTotal - cartDiscountAmount);

      return { subtotal, itemDiscountsTotal, cartDiscountAmount, total };
    },
    [items, promotions, cartDiscount, getFinalPrice],
  );

  const discountTotal = itemDiscountsTotal + cartDiscountAmount;

  const handleIncreaseQuantity = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const handleDecreaseQuantity = (id: string) => {
    setItems(
      prev =>
        prev
          .map(item => {
            if (item.id === id) {
              const newQty = item.quantity - 1;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as OrderItem[],
    );
  };

  const handleRemoveItem = (id: string) =>
    setItems(prev => prev.filter(item => item.id !== id));

  const startEditingVariations = (id: string, current: Variation[]) => {
    setEditingVariationsId(id);

    const variationsWithKeys = current.map(v => ({
      ...v,
      nameKey: v.nameKey || `variationModal.variations.${v.name}`,
    }));

    setTempVariations(variationsWithKeys);
  };

  const confirmEditVariations = () => {
    if (editingVariationsId) {
      setItems(prev =>
        prev.map(item => {
          if (item.id === editingVariationsId) {
            const price =
              item.product.basePrice +
              tempVariations.reduce((a, v) => a + (v.priceModifier || 0), 0);
            return {
              ...item,
              selectedVariations: tempVariations,
              finalPrice: price,
            };
          }
          return item;
        }),
      );
      setEditingVariationsId(null);
    }
  };

  const handleAddItemFromGrid = (product: ExtendedProduct) => {
    console.log('Adding product:', {
      name: product.name,
      nameKey: product.nameKey,
      hasNameKey: !!product.nameKey,
    });

    if (!product.variations || product.variations.length === 0) {
      addToCart(product, []);
      return;
    }
    setSelectedProduct(product);
  };

  const handleStartAddingItems = () => {
    clearCart();
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item.product, item.selectedVariations);
      }
    });
    setShowProductGrid(true);
  };

  const handleDoneAddingItems = () => {
    const newItems: OrderItem[] = itemsList.map(cartItem => ({
      id: `cart_${Date.now()}_${Math.random()}`,
      product: cartItem.product,
      quantity: cartItem.quantity,
      selectedVariations: cartItem.selectedVariations,
      finalPrice:
        cartItem.product.basePrice +
        cartItem.selectedVariations.reduce(
          (a, v) => a + (v.priceModifier || 0),
          0,
        ),
    }));

    setItems(newItems);
    setShowProductGrid(false);
  };

  if (showProductGrid) {
    return (
      <div className="flex-1 flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex gap-6">
          <div className="flex-1">
            <ProductGrid onProductClick={handleAddItemFromGrid} />
          </div>

          <div className="w-1/3 max-w-md">
            <OrderSummary onBack={handleDoneAddingItems} />
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
      <div className="mb-6 max-h-[50vh] overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mb-4 text-gray-400">
              {t('orderSummary.noItems', 'No items in order')}
            </p>
            <button
              onClick={handleStartAddingItems}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t('orderPanel.addItem', 'Add Item')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <OrderItemRow
                key={item.id}
                item={item}
                isEditingVariations={editingVariationsId === item.id}
                tempVariations={tempVariations}
                onIncrease={() => handleIncreaseQuantity(item.id)}
                onDecrease={() => handleDecreaseQuantity(item.id)}
                onRemove={() => handleRemoveItem(item.id)}
                onStartEditVariations={() =>
                  startEditingVariations(item.id, item.selectedVariations)
                }
                onConfirmEditVariations={confirmEditVariations}
                onCancelEditVariations={() => setEditingVariationsId(null)}
                onVariationChange={setTempVariations}
              />
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleStartAddingItems}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-blue-300 bg-blue-50 py-3 text-blue-600 transition-colors hover:bg-blue-100"
          >
            <PlusIcon className="h-6 w-6 text-blue-600" />
            <span className="font-medium">{t('orderPanel.addItem')}</span>
          </button>
        </div>
      )}

      <div className="mb-6 border-t border-gray-300 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('orderSummary.subtotal')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-sm font-bold text-green-600">
              <span>{t('orderSummary.discounts')}</span>
              <span>- {formatPrice(discountTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold">
            <span>{t('orderSummary.total')}</span>
            <span className="text-blue-700">{formatPrice(total)}</span>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          {t('orderPanel.totalNote')} {orderId}
        </div>
      </div>

      <div className="flex gap-3 border-t border-gray-300 pt-6">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50"
        >
          {t('orderPanel.cancel')}
        </button>
        <button
          onClick={() => onSave?.(items)}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t('editOrder.saveChanges')}
        </button>
      </div>
    </div>
  );
}
