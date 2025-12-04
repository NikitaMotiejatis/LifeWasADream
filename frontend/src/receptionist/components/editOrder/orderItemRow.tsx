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

  const hasMilkVariations = item.product.variations?.some(
    v => v.name.toLowerCase().includes('milk')
  );


  const hasRegularMilkSelected = 
    !item.selectedVariations.some(v => v.name.toLowerCase().includes('milk'));

  const hasSpecialMilkSelected = item.selectedVariations.some(
    v => v.name.toLowerCase().includes('milk')
  );

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
            <div className="flex-1">
              <h3
                className="font-semibold text-gray-900"
                title={
                  item.product.nameKey
                    ? t(item.product.nameKey)
                    : item.product.name
                }
              >
                {item.product.nameKey
                  ? t(item.product.nameKey)
                  : item.product.name}
              </h3>
              
              {/* Edit variations button - now under the item name */}
              {item.product.variations && item.product.variations.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={onStartEditVariations}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                      item.selectedVariations.length > 0
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                    title={t('orderPanel.clickToChange', 'Click to change options')}
                  >
                    {item.selectedVariations.length > 0 ? (
                      <>
                        <span>
                          {item.selectedVariations
                            .map(v => t(`variationModal.variations.${v.name}`, v.name))
                            .join(', ')}
                        </span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </>
                    ) : hasMilkVariations ? (
                      <>
                        <span className="flex items-center gap-1">
                          {t('orderPanel.regularMilk', 'Regular Milk')}
                        </span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </>
                    ) : (
                      <>
                        {t('orderPanel.addOptions', 'Add Options')}
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {/* Show regular milk as included by default for coffee products */}
                  {hasMilkVariations && !hasSpecialMilkSelected && (
                    <p className="mt-1 text-xs text-gray-500">
                      {t('orderPanel.includesRegularMilk', '')}
                    </p>
                  )}
                </div>
              )}
              
              {/* Show variations as text if product doesn't have variations config but has variations selected */}
              {(!item.product.variations || item.product.variations.length === 0) && 
                item.selectedVariations.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  {item.selectedVariations
                    .map(v => t(`variationModal.variations.${v.name}`, v.name))
                    .join(', ')}
                </div>
              )}
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

            <div className="flex items-center gap-4">
              {/* Remove button */}
              <button
                onClick={onRemove}
                className="text-sm text-red-600 hover:text-red-800"
                title={t('orderSummary.removeItem', 'Remove item')}
              >
                {t('orderPanel.remove', 'Remove')}
              </button>
            </div>
          </div>

          {isEditingVariations &&
            item.product.variations &&
            item.product.variations.length > 0 && (
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