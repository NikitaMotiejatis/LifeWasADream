import { useTranslation } from 'react-i18next';
import type { Variation, Product } from '@/receptionist/contexts/cartContext';

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
    <div className="space-y-3">
      {product.variations.some(v =>
        ['Small', 'Medium', 'Large', 'Regular'].includes(v.name),
      ) && (
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">
            {t('variationModal.size', 'Size')}
          </p>
          <div className="flex flex-wrap gap-1">
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
                    className={`rounded border px-2 py-1 text-xs transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(
                      `variationModal.variations.${variation.name}`,
                      variation.name,
                    )}
                    {variation.priceModifier !== 0 && (
                      <span className="ml-1">
                        {variation.priceModifier > 0 ? '+' : ''}$
                        {variation.priceModifier.toFixed(2)}
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
          <p className="mb-1 text-xs font-medium text-gray-600">
            {t('orderPanel.selectMilk', 'Select Milk')}
          </p>

          <div className="flex flex-wrap gap-1">
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
                  className={`rounded border px-2 py-1 text-xs transition-colors ${
                    isSelected
                      ? variation.name === 'Regular Milk'
                        ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                        : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t(
                    `variationModal.variations.${variation.name}`,
                    variation.name,
                  )}
                  {variation.priceModifier !== 0 && (
                    <span className="ml-1">
                      {variation.priceModifier > 0 ? '+' : ''}$
                      {variation.priceModifier.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <div className="mt-3 flex gap-2">
          <button
            onClick={onSave}
            className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
          >
            {t('orderPanel.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
}
