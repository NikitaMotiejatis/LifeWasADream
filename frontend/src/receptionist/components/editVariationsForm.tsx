import { useTranslation } from 'react-i18next';
import type { Variation, Product } from '@/receptionist/contexts/cartContext';
import { useCurrency } from '@/global/contexts/currencyContext';
interface EditVariationsFormProps {
  product: Product;
  currentVariations: Variation[];
  onVariationChange: (variations: Variation[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditVariationsForm({
  product,
  currentVariations,
  onVariationChange,
  onSave,
  onCancel,
}: EditVariationsFormProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  if (!product.variations) return null;

  const hasMilkVariations = product.variations.some(v =>
    v.name.toLowerCase().includes('milk'),
  );

  const allMilkVariations = hasMilkVariations
    ? [
        {
          name: 'Regular Milk',
          nameKey: 'variationModal.variations.regularMilk',
          priceModifier: 0,
        },
        ...product.variations.filter(v =>
          v.name.toLowerCase().includes('milk'),
        ),
      ]
    : [];

  const isVariationSelected = (variation: Variation) => {
    if (variation.name === 'Regular Milk') {
      const hasAnyMilkSelected = currentVariations.some(v =>
        v.name.toLowerCase().includes('milk'),
      );
      return (
        !hasAnyMilkSelected ||
        currentVariations.some(v => v.name === 'Regular Milk')
      );
    }
    return currentVariations.some(v => v.name === variation.name);
  };

  return (
    <div className="space-y-4">
      {' '}
      {product.variations.some(v =>
        ['Small', 'Medium', 'Large', 'Regular'].includes(v.name),
      ) && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            {' '}
            {t('variationModal.size')}
          </p>
          <div className="flex flex-wrap gap-2">
            {' '}
            {product.variations
              .filter(v =>
                ['Small', 'Medium', 'Large', 'Regular'].includes(v.name),
              )
              .map(variation => {
                const isSelected = isVariationSelected(variation);
                return (
                  <button
                    key={variation.name}
                    onClick={() => {
                      const newVariations = currentVariations
                        .filter(
                          v =>
                            !['Small', 'Medium', 'Large', 'Regular'].includes(
                              v.name,
                            ),
                        )
                        .concat([variation]);
                      onVariationChange(newVariations);
                    }}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {t(
                      `variationModal.variations.${variation.name}`,
                      variation.name,
                    )}
                    {variation.priceModifier !== 0 && (
                      <span className="ml-2">
                        {variation.priceModifier > 0 ? '+' : ''}
                        {formatPrice(variation.priceModifier)}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
      {hasMilkVariations && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            {' '}
            {t('orderPanel.selectMilk')}
          </p>

          <div className="flex flex-wrap gap-2">
            {' '}
            {allMilkVariations.map(variation => {
              const isSelected = isVariationSelected(variation);

              return (
                <button
                  key={variation.name}
                  onClick={() => {
                    if (variation.name === 'Regular Milk') {
                      const newVariations = currentVariations.filter(
                        v => !v.name.toLowerCase().includes('milk'),
                      );
                      onVariationChange(newVariations);
                    } else {
                      const newVariations = currentVariations
                        .filter(v => !v.name.toLowerCase().includes('milk'))
                        .concat([variation]);
                      onVariationChange(newVariations);
                    }
                  }}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {t(
                    `variationModal.variations.${variation.name}`,
                    variation.name,
                  )}
                  {variation.priceModifier !== 0 && (
                    <span className="ml-2">
                      {variation.priceModifier > 0 ? '+' : ''}
                      {formatPrice(variation.priceModifier)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-4 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          {t('orderPanel.cancel')}
        </button>
        <button
          onClick={onSave}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {t('orderPanel.done')}
        </button>
      </div>
    </div>
  );
}
