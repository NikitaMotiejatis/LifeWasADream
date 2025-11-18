import { useCart } from './cartContext';
import { useState } from 'react';

export default function OrderSummary() {
  const { cart, formatPrice, updateQuantity, removeItem, clearCart, total } =
    useCart();
  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'card' | 'gift-card'
  >('card');

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-xl md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold md:text-xl">Current Order</h3>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-medium text-red-600 hover:underline md:text-sm"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="py-10 text-center text-gray-400">No items yet</p>
        ) : (
          cart.map(item => (
            <div
              key={item.product.name}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatPrice(item.product.price)} × {item.quantity}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.product.name)}
                  className="shrink-0 text-gray-400 transition hover:text-red-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2.175 2.175 0 0116 21H8a2.175 2.175 0 01-2.133-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product.name, -1)}
                    className="flex h-9 w-9 scale-70 items-center justify-center rounded-full border border-gray-400 text-sm font-light transition hover:bg-gray-200 active:scale-95 lg:scale-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-lg font-bold lg:w-12">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.name, +1)}
                    className="flex h-9 w-9 scale-70 items-center justify-center rounded-full bg-blue-600 font-bold text-white transition hover:bg-blue-700 active:scale-95 lg:scale-100"
                  >
                    +
                  </button>
                </div>

                <div className="text-lg font-bold text-gray-900 lg:ml-auto">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50">
              Split Bill
            </button>
            <button className="rounded-lg border border-red-400 py-2 text-xs font-medium text-red-600 hover:bg-red-50">
              Refund
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 lg:flex-row lg:justify-between lg:gap-0">
            <span className="text-xl font-bold text-gray-800 lg:text-2xl">
              Total
            </span>
            <span className="text-2xl font-bold text-blue-600 lg:text-2xl">
              {formatPrice(total)}
            </span>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-700 md:text-sm">
              Payment method
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {(['cash', 'card', 'gift-card'] as const).map(method => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg py-2 text-xs font-medium transition ${
                    paymentMethod === method
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {method === 'gift-card'
                    ? 'Gift Card'
                    : method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700">
            Complete Payment
          </button>
        </div>
      )}
    </div>
  );
}
