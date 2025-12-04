import { useTranslation } from 'react-i18next';
import type { Variation } from '@/receptionist/contexts/cartContext';
import type { OrderItem } from './types';
import { EditVariationsForm } from './editVariationsForm';

interface OrderItemRowProps {
  item: OrderItem;
  isEditingVariations: boolean;
  tempVariations: Variation[];
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  onStartEditVariations: () => void;
  onConfirmEditVariations: () => void;
  onCancelEditVariations: () => void;
  onVariationChange: (variations: Variation[]) => void;
}

export function OrderItemRow({
  item,
  isEditingVariations,
  tempVariations,
  onIncrease,
  onDecrease,
  onRemove,
  onStartEditVariations,
  onConfirmEditVariations,
  onCancelEditVariations,
  onVariationChange,
}: OrderItemRowProps) {
  const { t } = useTranslation();

  return (
    <div
      key={item.id}
      className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="h-24 w-24 rounded-lg bg-gray-200 shadow-inner" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 
                className="font-semibold text-gray-900"
                title={item.product.nameKey ? t(item.product.nameKey) : item.product.name}
              >
                {item.product.nameKey ? t(item.product.nameKey) : item.product.name}
              </h3>
              <p 
                className="text-sm text-gray-500"
                title={item.selectedVariations
                  .map(v => t(`variationModal.variations.${v.name}`, v.name))
                  .join(', ') || t('orderPanel.noOptions', 'No options')}
              >
                {item.selectedVariations
                  .map(v => t(`variationModal.variations.${v.name}`, v.name))
                  .join(', ') || t('orderPanel.noOptions', 'No options')}
              </p>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                ${(item.finalPrice * item.quantity).toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">
                ${item.finalPrice.toFixed(2)} {t('each', 'each')}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onDecrease}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                title={t('orderSummary.decreaseQuantity', 'Decrease quantity')}
              >
                −
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={onIncrease}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                title={t('orderSummary.increaseQuantity', 'Increase quantity')}
              >
                +
              </button>
            </div>

            <div className="flex gap-2">
              {!isEditingVariations &&
                item.product.variations &&
                item.product.variations.length > 0 && (
                  <button
                    onClick={onStartEditVariations}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {t('orderPanel.change', 'Change')}
                  </button>
                )}

              <button
                onClick={onRemove}
                className="text-sm text-red-600 hover:text-red-800"
                title={t('orderSummary.removeItem', 'Remove item')}
              >
                {t('orderPanel.remove', 'Remove')}
              </button>
            </div>
          </div>

          {isEditingVariations && item.product.variations && item.product.variations.length > 0 && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3">
              <p className="mb-2 text-sm font-medium text-gray-700">
                {t('orderPanel.selectOptions', 'Select options')}
              </p>
              <EditVariationsForm
                product={item.product}
                currentVariations={tempVariations}
                onVariationChange={onVariationChange}
                onSave={onConfirmEditVariations}
                onCancel={onCancelEditVariations}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}