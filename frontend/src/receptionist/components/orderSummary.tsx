import { useTranslation } from 'react-i18next';
import {
  CartItem,
  generateKey,
  useCart,
} from '@/receptionist/contexts/cartContext';
import TrashcanIcon from '@/icons/trashcanIcon';
import { useNavigate } from 'react-router-dom';
import { SplitBillSection } from './splitBillSection';
import { useState } from 'react';
import Toast from '@/global/components/toast';
import { createStripeCheckout, redirectToStripeCheckout } from '@/utils/paymentService';

type OrderSummaryProps = {
  onBack?: () => void;
  showPaymentSection?: boolean;
};

export default function OrderSummary({
  onBack,
  showPaymentSection = false,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const {
    itemsList,
    formatPrice,
    clearCart,
    subtotal,
    discountTotal,
    total,
    generateKey,
  } = useCart();
  const hasItems = itemsList.length > 0;

  const navigate = useNavigate();

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
  };

  function handleSave(): void {
    showToast(t('orderSummary.orderSaved', 'Order saved'));
    clearCart();
    setTimeout(() => navigate('/orders'), 600);
  }

  const handleStripePayment = async () => {
    try {
      // TODO: Replace with actual order ID when order system is implemented
      const mockOrderId = Math.floor(Math.random() * 10000);
      
      showToast(t('payment.redirecting', 'Redirecting to payment...'));
      
      const response = await createStripeCheckout(mockOrderId, total, 'eur');
      
      // Clear cart before redirecting
      clearCart();
      
      // Redirect to Stripe checkout
      redirectToStripeCheckout(response.session_url);
    } catch (error) {
      showToast(
        t('payment.error', 'Payment failed. Please try again.'),
        'error'
      );
      console.error('Stripe payment error:', error);
    }
  };

  return (
    <div className="max-h-full flex-1 flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-xl xl:p-5">
      <Toast toast={toast} />
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold xl:text-xl">
          {t('orderSummary.title')}
        </h3>
        {!onBack && hasItems && (
          <button
            onClick={clearCart}
            className="text-xs font-medium text-red-600 xl:text-sm"
          >
            {t('orderSummary.clearAll')}
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2">
        {hasItems ? (
          <div className="max-h-150 flex-1 space-y-3 overflow-y-scroll">
            {itemsList.map(item => (
              <CartItemRow
                key={generateKey(item.product, item.selectedVariations)}
                item={item}
              />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-gray-400">
            {t('orderSummary.noItems')}
          </p>
        )}
      </div>

      {hasItems && (
        <div className="space-y-3">
          {!onBack && (
            <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
              <button
                className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50"
                onClick={handleSave}
              >
                {t('orderSummary.saveOrder')}
              </button>
            </div>
          )}

          <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
            <div className="flex justify-between">
              <span>{t('orderSummary.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between font-bold text-green-600">
                <span>{t('orderSummary.discounts')}</span>
                <span>- {formatPrice(discountTotal)}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1 xl:flex-row xl:justify-between xl:gap-0">
              <span className="text-xl font-bold text-gray-800 xl:text-2xl">
                {t('orderSummary.total')}
              </span>
              <span className="text-2xl font-bold text-blue-600 xl:text-2xl">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {showPaymentSection ? (
            <>
              <SplitBillSection
                total={total}
                items={itemsList}
                formatPrice={formatPrice}
                onCompletePayment={payments => {
                  console.log('All paid:', payments);
                  showToast(t('orderSummary.allPaid'));
                  clearCart();
                  setTimeout(() => navigate('/orders'), 600);
                }}
                onStripePayment={handleStripePayment}
              />
            </>
          ) : onBack ? (
            <button
              onClick={onBack}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              {t('orderPanel.done')}
            </button>
          ) : (
            <button
              onClick={() => {
                navigate('/orders');
              }}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              {t('orderSummary.completePayment')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  const { t } = useTranslation();
  const { product, selectedVariations, quantity } = item;
  const { formatPrice, updateQuantity, removeItem, getFinalPrice } = useCart();

  const finalPrice = getFinalPrice(product, selectedVariations);
  const key = generateKey(product, selectedVariations);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {product.nameKey ? t(product.nameKey) : product.name}
          </p>
          {selectedVariations.length > 0 && (
            <p className="text-sm text-gray-600">
              {selectedVariations
                .map(variation =>
                  variation.nameKey
                    ? t(`${variation.nameKey}`)
                    : variation.name,
                )
                .join(', ')}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formatPrice(finalPrice)} × {quantity}
          </p>
        </div>
        <button
          onClick={() => removeItem(key)}
          aria-label={t('orderSummary.removeItem')}
        >
          <TrashcanIcon className="h-5 w-5 text-gray-400 hover:text-red-600" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateQuantity(key, -1)}
            className="flex h-9 w-9 scale-70 items-center justify-center rounded-full border border-gray-400 text-sm font-light transition hover:bg-gray-200 active:scale-95 xl:scale-100"
            aria-label={t('orderSummary.decreaseQuantity')}
          >
            −
          </button>
          <span className="w-8 text-center text-lg font-bold lg:w-12">
            {quantity}
          </span>
          <button
            onClick={() => updateQuantity(key, +1)}
            className="flex h-9 w-9 scale-70 items-center justify-center rounded-full bg-blue-600 font-bold text-white transition hover:bg-blue-700 active:scale-95 xl:scale-100"
            aria-label={t('orderSummary.increaseQuantity')}
          >
            +
          </button>
        </div>

        <div className="text-lg font-bold text-gray-900 xl:ml-auto">
          {formatPrice(finalPrice * quantity)}
        </div>
      </div>
    </div>
  );
}
