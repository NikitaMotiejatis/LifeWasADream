import { useCart } from './cartContext';

const products = [
  { name: 'Iced Coffee', price: 4.5 },
  { name: 'Iced Latte', price: 5.0 },
  { name: 'Smoothie - Berry Blast', price: 5.5 },
  { name: 'Smoothie - Mango Paradise', price: 5.5 },
  { name: 'Iced Tea', price: 3.5 },
  { name: 'Fresh Lemonade', price: 4.0 },
  { name: 'Orange Juice', price: 4.25 },
  { name: 'Chocolate Milkshake', price: 5.75 },
  { name: 'Caramel Frappuccino', price: 5.5 },
];

export default function ProductGrid() {
  const { addToCart, formatPrice } = useCart();

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Checkout</h2>

      <div className="grid grid-cols-3 gap-4">
        {products.map(p => (
          <button
            key={p.name}
            onClick={() => addToCart(p)}
            className="group relative flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <div className="mb-3 aspect-square w-full max-w-24 rounded-lg bg-gray-200 shadow-inner" />

            <div className="w-full px-2">
              <p
                className="line-clamp-2 text-center text-sm leading-snug font-medium hyphens-auto group-hover:line-clamp-none"
                title={p.name}
              >
                {p.name}
              </p>
            </div>

            <p className="mt-2 font-medium text-gray-600">
              {formatPrice(p.price)}
            </p>

            <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded bg-gray-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              {p.name}
              <svg
                className="absolute top-full left-1/2 -translate-x-1/2 text-gray-900"
                width="16"
                height="8"
                viewBox="0 0 16 8"
                fill="currentColor"
              >
                <path d="M0 0L8 8L16 0H0Z" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
