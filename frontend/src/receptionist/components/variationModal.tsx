import { useState } from 'react';
import { Product, useCart, Variation } from '../contexts/cartContext';

export default function VariationModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (variations: Variation[]) => void;
}) {
  const { formatPrice, getFinalPrice } = useCart();

  const sizeOptions =
    product.variations?.filter(v =>
      ['Small', 'Medium', 'Large'].includes(v.name),
    ) || [];

  const milkOptions =
    product.variations?.filter(v =>
      ['Oat Milk', 'Almond Milk'].includes(v.name),
    ) || [];

  const [selectedSize, setSelectedSize] = useState<Variation>(
    sizeOptions.find(s => s.name === 'Small') || sizeOptions[0],
  );
  const [selectedMilk, setSelectedMilk] = useState<Variation | null>(null);

  const selectedVariations: Variation[] = [];
  if (selectedSize) selectedVariations.push(selectedSize);
  if (selectedMilk) selectedVariations.push(selectedMilk);

  const finalPrice = getFinalPrice(product, selectedVariations);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <h3 className="mb-4 text-xl font-bold">{product.name}</h3>

        {sizeOptions.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Size</h4>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map(size => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border-2 py-3 text-sm font-medium transition-all ${
                    selectedSize.name === size.name
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div>{size.name}</div>
                  {size.priceModifier > 0 && (
                    <div className="text-xs opacity-80">
                      +{formatPrice(size.priceModifier)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {milkOptions.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Milk</h4>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedMilk(null)}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                  selectedMilk === null
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Regular Milk
                <span className="float-right text-xs text-gray-500">Free</span>
              </button>

              {milkOptions.map(milk => (
                <button
                  key={milk.name}
                  onClick={() => setSelectedMilk(milk)}
                  className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                    selectedMilk?.name === milk.name
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {milk.name}
                  <span className="float-right text-xs">
                    +{formatPrice(milk.priceModifier)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5 flex justify-between border-t border-gray-200 pt-4">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(finalPrice)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd(selectedVariations)}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
