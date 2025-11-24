import { useState } from 'react';
import { Product, useCart } from '../contexts/cartContext';
import VariationModal from './variationModal';

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
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600">
                <span className="hidden lg:inline">Customizable</span>
                <span className="lg:hidden">Custom</span>
              </p>
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
