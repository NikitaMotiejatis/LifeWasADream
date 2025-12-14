import { useTranslation } from 'react-i18next';
import {
  CartItem,
  generateKey,
  useCart,
} from '@/receptionist/contexts/cartContext';
import TrashcanIcon from '@/icons/trashcanIcon';
import { useNavigate, useParams } from 'react-router-dom';
import { SplitBillSection } from './splitBillSection';
import { useState, useEffect } from 'react';
import Toast from '@/global/components/toast';
import {
  createStripeCheckout,
  redirectToStripeCheckout,
} from '@/utils/paymentService';
import { useAuth } from '@/global/hooks/auth';
import { mutate } from 'swr';
import i18n from '@/i18n';
import { TipSection } from './orderTipSection';

type OrderSummaryProps = {
  onBack?: () => void;
  showPaymentSection?: boolean;
};

export default function OrderSummary({
  onBack,
  showPaymentSection = false,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const params = useParams();
  const { authFetch, authFetchJson } = useAuth();

  const {
    itemsList,
    formatPrice,
    clearCart,
    subtotal,
    discountTotal,
    totalWithoutTip,
    tipAmount,
    total,
    generateKey,
    isSplitMode,
    setIsSplitMode,
    individualTips,
  } = useCart();

  const hasItems = itemsList.length > 0;

  const navigate = useNavigate();

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync local split state with context
  useEffect(() => {
    // Reset split mode when cart is cleared or no items
    if (!hasItems && isSplitMode) {
      setIsSplitMode(false);
    }
  }, [hasItems, isSplitMode, setIsSplitMode]);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
  };

  const handleSave = async () => {
    const order = { 
      items: itemsList,
      tip: {
        amount: tipAmount,
        total: total
      },
      isSplit: isSplitMode,
      individualTips: isSplitMode ? individualTips : []
    };

    try {
      const orderId = params.orderId;
      if (orderId) {
        await authFetch(`order/${orderId}`, 'PATCH', JSON.stringify(order));
      } else {
        await authFetch(`order/`, 'POST', JSON.stringify(order));
      }
      await mutate('order'); // refresh orders list if cached

      showToast(t('orderSummary.saveSuccess', 'Order saved successfully'));
    } catch (e) {
      console.error(e);
      showToast(t('orderSummary.saveError', 'Failed to save order'), 'error');
      return;
    }

    navigate('/orders');
  };

  // Handle Stripe payment for both regular and split payments
  const handleStripePayment = async (payerIndex?: number, amount?: number) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      showToast(t('payment.processing', 'Processing order...'));

      // Create or update the order first
      
      const paymentAmount = amount || total;
      const individualTip = payerIndex !== undefined ? individualTips[payerIndex] || 0 : 0;
      
      const order = { 
        items: itemsList,
        tip: {
          amount: payerIndex !== undefined ? individualTip : tipAmount,
          total: paymentAmount
        },
        isSplit: isSplitMode,
        payerIndex: payerIndex,
        isIndividualPayment: payerIndex !== undefined
      };
      
      let orderId: number;

      const existingOrderId = params.orderId;
      if (existingOrderId) {
        // Update existing order
        await authFetchJson<string>(
          `order/${existingOrderId}`,
          'PATCH',
          JSON.stringify(order),
        );
        orderId = parseInt(existingOrderId);
        await mutate(`order/${existingOrderId}`);
      } else {
        // Create new order and get the order ID
        const response = await authFetchJson<{ id: number; message: string }>(
          `order/`,
          'POST',
          JSON.stringify(order),
        );
        orderId = response.id;
        await mutate(`order/${orderId}`);
      }
      await mutate('order');

      showToast(t('payment.redirecting', 'Redirecting to payment...'));
      
      const checkoutResponse = await createStripeCheckout(orderId, paymentAmount, 'eur');
      
      // Only clear cart if this is the last payment in split mode or a regular payment
      if (payerIndex === undefined || !isSplitMode) {
        clearCart();
      }
      
      redirectToStripeCheckout(checkoutResponse.session_url);
      
    } catch (error) {
      console.error('Stripe payment error:', error);
      showToast(
        t('payment.error', 'Payment failed. Please try again.'),
        'error',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = () => {
    showToast(t('payment.cashReceived', 'Cash payment received'));
    clearCart();
    setTimeout(() => navigate('/orders'), 600);
  };

  const handleGiftCardPayment = () => {
    showToast(t('payment.giftCardProcessed', 'Gift card processed'));
    clearCart();
    setTimeout(() => navigate('/orders'), 600);
  };

  const handleSplitEnabledChange = (enabled: boolean) => {
    setIsSplitMode(enabled);
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
            disabled={isProcessing}
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
                className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                onClick={handleSave}
                disabled={isProcessing}
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

            {/* Tip Display - Only show if not in split mode */}
            {tipAmount > 0 && !isSplitMode && (
              <div className="flex justify-between text-green-600">
                <span>{t('orderSummary.tip')}</span>
                <span>+ {formatPrice(tipAmount)}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1 xl:flex-row xl:justify-between xl:gap-0">
              <span className="text-xl font-bold text-gray-800 xl:text-2xl">
                {t('orderSummary.total')}
              </span>
              <span className="text-2xl font-bold text-blue-600 xl:text-2xl">
                {formatPrice(isSplitMode ? totalWithoutTip : total)}
              </span>
            </div>
          </div>

          {showPaymentSection ? (
            <>
              {!isSplitMode && <TipSection />}
              
              <SplitBillSection
                total={totalWithoutTip}
                items={itemsList}
                formatPrice={formatPrice}
                onSplitEnabledChange={handleSplitEnabledChange}
                onCompletePayment={payments => {
                  console.log('All paid with individual tips:', payments);
                  showToast(t('orderSummary.allPaid'));
                  clearCart();
                  setTimeout(() => navigate('/orders'), 600);
                }}
                onStripePayment={handleStripePayment}
                isProcessing={isProcessing}
              />
            </>
          ) : onBack ? (
            <button
              onClick={onBack}
              className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
              disabled={isProcessing}
            >
              {t('orderPanel.done')}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-700 xl:text-sm">
                  {t('orderSummary.paymentMethod')}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cash', 'Card', 'Gift card'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => {
                        if (method === 'Card') {
                          handleStripePayment();
                        } else if (method === 'Cash') {
                          handleCashPayment();
                        } else if (method === 'Gift card') {
                          handleGiftCardPayment();
                        }
                      }}
                      className={`rounded-lg py-2 text-xs font-medium transition ${
                        method === 'Card'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-gray-400 hover:bg-gray-100'
                      } disabled:opacity-50`}
                      disabled={isProcessing}
                    >
                      {t(`orderSummary.paymentMethods.${method}`)}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                  navigate('/orders');
                }}
                className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                disabled={isProcessing}
              >
                {t('orderSummary.completePayment')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  const { t } = useTranslation();
  const { product, selectedVariations, quantity } = item;
  const { formatPrice, updateQuantity, removeItem, getFinalPrice, generateKey } = useCart();

  const finalPrice = getFinalPrice(product, selectedVariations);
  const key = generateKey(product, selectedVariations);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {product.nameKey
              ? t(product.nameKey)
              : i18n.exists(`products.${product.name}`)
                ? t(`products.${product.name}`)
                : product.name}
          </p>
          {selectedVariations.length > 0 && (
            <p className="text-sm text-gray-600">
              {selectedVariations
                .map(v =>
                  v.nameKey
                    ? t(v.nameKey)
                    : i18n.exists(`variationModal.variations.${v.name}`)
                      ? t(`variationModal.variations.${v.name}`)
                      : v.name,
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
