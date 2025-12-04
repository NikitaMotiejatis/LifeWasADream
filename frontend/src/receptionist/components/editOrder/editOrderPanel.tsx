import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCart,
  type Variation,
  type Product,
} from '@/receptionist/contexts/cartContext';
import VariationModal from '@/receptionist/components/variationModal';
import { ProductGridView } from './productGridView';  
import { OrderSummaryView } from './orderSummaryView';
import { OrderItemRow } from './orderItemRow';  
import { PaymentSection } from './paymentSection';
import { SplitBillSection } from './splitBillSection';
import type { EditOrderPanelProps, OrderItem, PaymentMethod } from './types';
import { createMockOrderItems } from './utils';

export function EditOrderPanel({
  orderId,
  onSave,
  onCancel,
  onAddMoreItems,
}: EditOrderPanelProps) {
  const { t } = useTranslation();
  const { addToCart, clearCart, itemsList } = useCart();

  const [items, setItems] = useState<OrderItem[]>(createMockOrderItems()); 
  const [editingVariationsId, setEditingVariationsId] = useState<string | null>(null);
  const [tempVariations, setTempVariations] = useState<Variation[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [splitBill, setSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [showProductGrid, setShowProductGrid] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const total = items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );

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
      nameKey: v.nameKey || `variationModal.variations.${v.name}`
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

  const handleAddItemFromGrid = (product: Product) => {
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

  const handlePayment = () => {
    alert(
      t('processingPayment', 'Processing payment') +
        ` ${paymentMethod} - $${total.toFixed(2)}`,
    );
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
          <div className="flex-1">
            <ProductGridView onProductClick={handleAddItemFromGrid} />
          </div>

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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {t('editOrder.title', 'Edit Order')} #{orderId}
        </h1>
        <p className="text-sm text-gray-600">
          {t('editOrder.subtitle', 'Modify items and quantities')}
        </p>
      </div>

      <div className="mb-6 max-h-[50vh] overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
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
            <p className="mb-4 text-gray-400">
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
            <span className="font-medium">{t('addItem', 'Add Items')}</span>
          </button>
        </div>
      )}

      <div className="mb-6 border-t border-gray-300 pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>{t('orderSummary.total', 'Total')}</span>
          <span className="text-blue-700">${total.toFixed(2)}</span>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          {t('orderPanel.totalNote', 'Total amount for order')} #{orderId}
        </div>
      </div>

      {/* CORRECT ORDER STARTS HERE */}

      {/* 1. Payment Method Selection */}
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

      {/* 2. Split Bill Section */}
<SplitBillSection
  splitBill={splitBill}
  setSplitBill={setSplitBill}
  splitCount={splitCount}
  setSplitCount={setSplitCount}
  total={total}  // Add this prop
/>

      {/* 3. Save/Cancel Buttons */}
      <div className="flex gap-3 border-t border-gray-300 pt-4 mb-6">
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

      {/* 4. Complete Payment Button (at the bottom) */}
      <div className="border-t border-gray-300 pt-6">
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