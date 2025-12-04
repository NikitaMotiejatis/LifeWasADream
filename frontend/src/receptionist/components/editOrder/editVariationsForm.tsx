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
                const isSelected = currentVariations.some(
                  v => v.name === variation.name,
                );
                return (
                  <button
                    key={variation.name}
                    onClick={() => {
                      const newVariations = currentVariations
                        .filter(
                          v =>
                            !['Small', 'Medium', 'Large', 'Regular'].includes(v.name),
                        )
                        .concat([variation]);
                      onVariationChange(newVariations);
                    }}
                    className={`rounded border px-2 py-1 text-xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {t(`variationModal.variations.${variation.name}`, variation.name)}
                    {variation.priceModifier !== 0 && (
                      <span className="ml-1">
                        {variation.priceModifier > 0 ? '+' : ''}
                        ${variation.priceModifier.toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {product.variations.some(v => v.name.toLowerCase().includes('milk')) && (
        <div>
          <p className="mb-1 text-xs font-medium text-gray-600">
            {t('orderPanel.selectMilk', 'Select Milk')}
          </p>
          <div className="flex flex-wrap gap-1">
            {product.variations
              .filter(v => v.name.toLowerCase().includes('milk'))
              .map(variation => {
                const isSelected = currentVariations.some(
                  v => v.name === variation.name,
                );
                return (
                  <button
                    key={variation.name}
                    onClick={() => {
                      const newVariations = currentVariations
                        .filter(v => !v.name.toLowerCase().includes('milk'))
                        .concat([variation]);
                      onVariationChange(newVariations);
                    }}
                    className={`rounded border px-2 py-1 text-xs ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {t(`variationModal.variations.${variation.name}`, variation.name)}
                    {variation.priceModifier !== 0 && (
                      <span className="ml-1">
                        {variation.priceModifier > 0 ? '+' : ''}
                        ${variation.priceModifier.toFixed(2)}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {t('orderPanel.cancel', 'Cancel')}
        </button>
        <button
          onClick={onSave}
          className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
        >
          {t('orderPanel.done', 'Done')}
        </button>
      </div>
    </div>
  );
}