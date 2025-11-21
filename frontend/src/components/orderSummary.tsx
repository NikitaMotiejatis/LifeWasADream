import { useCart } from '../contexts/cartContext';
import { useState } from 'react';
import type { CartItem } from '../contexts/cartContext';
import TrashcanIcon from './icons/trashcanIcon';

export default function OrderSummary() {
  const { cart, formatPrice, updateQuantity, removeItem, clearCart, total } =
    useCart();
  const [paymentMethod, setPaymentMethod] = useState<
      'Cash' | 'Card' | 'Gift card'
  >('Card');

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-xl xl:p-5">
      <Header hasItems={cart.length > 0} onClear={clearCart} />
      <ItemsList
        cart={cart}
        formatPrice={formatPrice}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
      />
      {cart.length > 0 && (
        <Footer
          total={total}
          formatPrice={formatPrice}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
      )}
    </div>
  );
}

function Header({
  hasItems,
  onClear,
}: {
  hasItems: boolean;
  onClear: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold xl:text-xl">Current Order</h3>
      {hasItems && (
        <button
          onClick={onClear}
          className="text-xs font-medium text-red-600 xl:text-sm"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

function ItemsList({
  cart,
  formatPrice,
  updateQuantity,
  removeItem,
}: {
  cart: CartItem[];
  formatPrice: (price: number) => string;
  updateQuantity: (name: string, delta: number) => void;
  removeItem: (name: string) => void;
}) {
  if (cart.length === 0) {
    return <p className="py-10 text-center text-gray-400">No items yet</p>;
  }

  return (
    <div className="flex-1 space-y-2 overflow-y-auto">
      {cart.map(item => (
        <CartItemRow
          key={item.product.name}
          item={item}
          formatPrice={formatPrice}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      ))}
    </div>
  );
}

function CartItemRow({
  item,
  formatPrice,
  updateQuantity,
  removeItem,
}: {
  item: CartItem;
  formatPrice: (price: number) => string;
  updateQuantity: (name: string, delta: number) => void;
  removeItem: (name: string) => void;
}) {
  const { product, quantity } = item;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">
            {formatPrice(product.price)} × {quantity}
          </p>
        </div>
        <button
          onClick={() => removeItem(product.name)}
          className="shrink-0 text-gray-400 transition hover:text-red-600"
          aria-label="Remove item"
        >
          <TrashcanIcon />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 xl:flex-row xl:items-center xl:justify-between">
        <QuantityControls
          quantity={quantity}
          onDecrease={() => updateQuantity(product.name, -1)}
          onIncrease={() => updateQuantity(product.name, +1)}
        />
        <div className="text-lg font-bold text-gray-900 xl:ml-auto">
          {formatPrice(product.price * quantity)}
        </div>
      </div>
    </div>
  );
}

function QuantityControls({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrease}
        className="flex h-9 w-9 scale-70 items-center justify-center rounded-full border border-gray-400 text-sm font-light transition hover:bg-gray-200 active:scale-95 xl:scale-100"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-lg font-bold lg:w-12">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className="flex h-9 w-9 scale-70 items-center justify-center rounded-full bg-blue-600 font-bold text-white transition hover:bg-blue-700 active:scale-95 xl:scale-100"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function Footer({
  total,
  formatPrice,
  paymentMethod,
  setPaymentMethod,
}: {
  total: number;
  formatPrice: (price: number) => string;
  paymentMethod: 'Cash' | 'Card' | 'Gift card';
  setPaymentMethod: (method: 'Cash' | 'Card' | 'Gift card') => void;
}) {
  return (
    <div>
      <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
        <button className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50">
          Save Order
        </button>
      </div>

      <div className="mt-4 space-y-3 border-t border-gray-300 pt-4">
        <div className="flex flex-col items-center gap-1 xl:flex-row xl:justify-between xl:gap-0">
          <span className="text-xl font-bold text-gray-800 xl:text-2xl">
            Total
          </span>
          <span className="text-2xl font-bold text-blue-600 xl:text-2xl">
            {formatPrice(total)}
          </span>
        </div>

        <button className="w-full rounded-lg border border-gray-400 py-2 text-xs font-medium hover:bg-gray-50">
          Split Bill
        </button>

        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-700 xl:text-sm">
            Payment method
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
                {method}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-700">
          Complete Payment
        </button>
      </div>
    </div>
  );
}
