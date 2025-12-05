import { useTranslation } from 'react-i18next';
import { useCart } from '@/receptionist/contexts/cartContext';
import TrashcanIcon from '@/icons/trashcanIcon';
import { getVariationDisplayName } from './utils';
import type { PaymentMethod } from './types';

interface OrderSummaryViewProps {
  onBack?: () => void;
  showPaymentSection?: boolean;
  paymentMethod?: PaymentMethod;
  setPaymentMethod?: (method: PaymentMethod) => void;
}

export function OrderSummaryView({
  onBack,
  showPaymentSection = false,
  paymentMethod,
  setPaymentMethod,
}: OrderSummaryViewProps) {
  const { t } = useTranslation();
  const {
    itemsList,
    formatPrice,
    clearCart,
    subtotal,
    total,
    updateQuantity,
    removeItem,
    getFinalPrice,
    generateKey,
  } = useCart();

  const hasItems = itemsList.length > 0;

<<<<<<< HEAD
  function handleSave() {
    throw new Error('Function not implemented.');
  }

=======
>>>>>>> f20f1a78a72d21bfe5f94335a6650fb1b7522782
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
              <div
                key={generateKey(item.product, item.selectedVariations)}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-semibold"
                      title={
                        item.product.nameKey
                          ? t(item.product.nameKey)
                          : item.product.name
                      }
                    >
                      {item.product.nameKey
                        ? t(item.product.nameKey)
                        : item.product.name}
                    </p>
                    {item.selectedVariations.length > 0 && (
                      <p
                        className="text-sm text-gray-600"
                        title={item.selectedVariations
                          .map(variation =>
                            getVariationDisplayName(t, variation),
                          )
                          .join(', ')}
                      >
                        {item.selectedVariations
                          .map(variation =>
                            getVariationDisplayName(t, variation),
                          )
                          .join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatPrice(
                        getFinalPrice(item.product, item.selectedVariations),
                      )}{' '}
                      × {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      removeItem(
                        generateKey(item.product, item.selectedVariations),
                      )
                    }
                    aria-label={t('orderSummary.removeItem', 'Remove item')}
                  >
                    <TrashcanIcon className="h-5 w-5 text-gray-400 hover:text-red-600" />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQuantity(
                          generateKey(item.product, item.selectedVariations),
                          -1,
                        )
                      }
                      className="flex h-9 w-9 scale-70 items-center justify-center rounded-full border border-gray-400 text-sm font-light transition hover:bg-gray-200 active:scale-95 xl:scale-100"
                      aria-label={t(
                        'orderSummary.decreaseQuantity',
                        'Decrease quantity',
                      )}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-lg font-bold lg:w-12">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          generateKey(item.product, item.selectedVariations),
                          +1,
                        )
                      }
                      className="flex h-9 w-9 scale-70 items-center justify-center rounded-full bg-blue-600 font-bold text-white transition hover:bg-blue-700 active:scale-95 xl:scale-100"
                      aria-label={t(
                        'orderSummary.increaseQuantity',
                        'Increase quantity',
                      )}
                    >
                      +
                    </button>
                  </div>

                  <div className="text-lg font-bold text-gray-900 xl:ml-auto">
                    {formatPrice(
                      getFinalPrice(item.product, item.selectedVariations) *
                        item.quantity,
                    )}
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
<<<<<<< HEAD
              <button
                onClick={() => {
                  handleSave();
                  window.location.href = '/receptionist/orders';
                }}
                className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50"
              >
=======
              <button className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50">
>>>>>>> f20f1a78a72d21bfe5f94335a6650fb1b7522782
                {t('orderSummary.saveOrder', 'Save Order')}
              </button>
            </div>
          )}

          <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
            <div className="flex justify-between">
              <span>{t('orderSummary.subtotal', 'Subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

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
                      onClick={() =>
                        setPaymentMethod && setPaymentMethod(method)
                      }
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
<<<<<<< HEAD
}
=======
}
>>>>>>> f20f1a78a72d21bfe5f94335a6650fb1b7522782
