import { useState } from 'react';
import { Product, useCart, Variation } from '../contexts/cartContext';

const products = [
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    basePrice: 4.5,
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Medium', priceModifier: 0.5 },
      { name: 'Large', priceModifier: 1.0 },
      { name: 'Oat Milk', priceModifier: 0.6 },
      { name: 'Almond Milk', priceModifier: 0.7 },
    ],
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte',
    basePrice: 5.0,
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Medium', priceModifier: 0.5 },
      { name: 'Large', priceModifier: 1.0 },
      { name: 'Oat Milk', priceModifier: 0.6 },
      { name: 'Almond Milk', priceModifier: 0.7 },
    ],
  },
  {
    id: 'smoothie-berry',
    name: 'Smoothie - Berry Blast',
    basePrice: 5.5,
  },
  {
    id: 'smoothie-mango',
    name: 'Smoothie - Mango Paradise',
    basePrice: 5.5,
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    basePrice: 3.5,
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
  {
    id: 'lemonade',
    name: 'Fresh Lemonade',
    basePrice: 4.0,
  },
  {
    id: 'orange-juice',
    name: 'Orange Juice',
    basePrice: 4.25,
  },
  {
    id: 'chocolate-milkshake',
    name: 'Chocolate Milkshake',
    basePrice: 5.75,
  },
  {
    id: 'caramel-frappuccino',
    name: 'Caramel Frappuccino',
    basePrice: 5.5,
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
  {
    id: 'hot-coffee',
    name: 'Hot Coffee',
    basePrice: 3.5,
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    basePrice: 4.5,
    variations: [
      { name: 'Small', priceModifier: 0 },
      { name: 'Large', priceModifier: 0.8 },
    ],
  },
];

export default function ProductGrid() {
  const { addToCart, formatPrice } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    if (!product.variations || product.variations.length === 0) {
      addToCart(product, []);
      return;
    }

    setSelectedProduct(product);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Checkout</h2>

      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <button
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="group relative flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <div className="mb-3 aspect-square w-full max-w-24 rounded-lg bg-gray-200 shadow-inner" />

            <div className="w-full px-2">
              <p
                className="line-clamp-2 text-center text-sm leading-snug font-medium hyphens-auto"
                title={product.name}
              >
                {product.name}
              </p>
            </div>
            <p className="mt-1 text-gray-600">
              from {formatPrice(product.basePrice)}
            </p>
            {product.variations && (
              <p className="mt-2 text-sm text-blue-600">Customizable</p>
            )}
          </button>
        ))}
      </div>

      {selectedProduct &&
        selectedProduct.variations &&
        selectedProduct.variations.length > 0 && (
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

function VariationModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (variations: any[]) => void;
}) {
  const { formatPrice, getFinalPrice } = useCart();
  const [selected, setSelected] = useState<Variation[]>(
    product.variations ? [product.variations[0]] : [],
  );

  const toggleVariation = (v: Variation) => {
    setSelected(prev => {
      if (prev.includes(v)) return prev.filter(x => x !== v);
      return [...prev, v];
    });
  };

  const finalPrice = getFinalPrice(product, selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <h3 className="mb-4 text-2xl font-bold">{product.name}</h3>

        {product.variations && product.variations.length > 0 && (
          <div className="mb-6 space-y-3">
            {product.variations.map(v => (
              <label
                key={v.name}
                className="flex cursor-pointer items-center justify-between py-2"
              >
                <span className="text-lg">{v.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">
                    {v.priceModifier > 0
                      ? `+${formatPrice(v.priceModifier)}`
                      : v.priceModifier < 0
                        ? `−${formatPrice(-v.priceModifier)}`
                        : 'Free'}
                  </span>
                  <input
                    type="checkbox"
                    checked={selected.includes(v)}
                    onChange={() => toggleVariation(v)}
                    className="h-5 w-5 rounded text-blue-600"
                  />
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="mb-6 flex justify-between text-xl font-bold">
          <span>Total</span>
          <span className="text-blue-600">{formatPrice(finalPrice)}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 py-3"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(selected)}
            className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
