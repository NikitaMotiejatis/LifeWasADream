import { useTranslation } from 'react-i18next';
import type { Variation } from '@/receptionist/contexts/cartContext';
import type { OrderItem } from './types';
import { EditVariationsForm } from './editVariationsForm';
import { PlusIcon } from '@/icons/plusIcon';
import { EditIcon } from '@/icons/editIcon';
import { useCurrency } from '@/global/contexts/currencyContext';
import i18n from '@/i18n';

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
  const { formatPrice } = useCurrency();

  const hasMilkVariations = item.product.variations?.some(v =>
    v.name.toLowerCase().includes('milk'),
  );

  const hasSpecialMilkSelected = item.selectedVariations.some(v =>
    v.name.toLowerCase().includes('milk'),
  );

  return (
    <div
      key={item.id}
      className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
    >
      <div className="flex gap-4">
        <div className="shrink-0">
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
                    : i18n.exists(`products.${item.product.name}`)
                      ? t(`products.${item.product.name}`)
                      : item.product.name
                }
              >
                {item.product.nameKey
                  ? t(item.product.nameKey)
                  : i18n.exists(`products.${item.product.name}`)
                    ? t(`products.${item.product.name}`)
                    : item.product.name}
              </h3>

              {item.product.variations &&
                item.product.variations.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={onStartEditVariations}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm transition-colors ${
                        item.selectedVariations.length > 0
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                      title={t('orderPanel.clickToChange')}
                    >
                      {item.selectedVariations.length > 0 ? (
                        <>
                          <span>
                            {item.selectedVariations
                              .map(v =>
                                v.nameKey
                                  ? t(v.nameKey)
                                  : i18n.exists(
                                        `variationModal.variations.${v.name}`,
                                      )
                                    ? t(`variationModal.variations.${v.name}`)
                                    : v.name,
                              )
                              .join(', ')}
                          </span>
                          <EditIcon className="h-4 w-4" />
                        </>
                      ) : hasMilkVariations ? (
                        <>
                          <span className="flex items-center gap-1">
                            {t('orderPanel.regularMilk')}
                          </span>
                          <EditIcon className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          {t('orderPanel.addOptions')}
                          <PlusIcon className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}

              {(!item.product.variations ||
                item.product.variations.length === 0) &&
                item.selectedVariations.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {item.selectedVariations
                      .map(v =>
                        v.nameKey
                          ? t(v.nameKey)
                          : i18n.exists(`variationModal.variations.${v.name}`)
                            ? t(`variationModal.variations.${v.name}`)
                            : v.name,
                      )
                      .join(', ')}
                  </div>
                )}
            </div>
            <div className="text-right">
              <div className="font-semibold">
                {formatPrice(item.finalPrice * item.quantity)}
              </div>
              <div className="text-sm text-gray-500">
                {formatPrice(item.finalPrice)} / {t('editOrder.each')}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onDecrease}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                title={t('orderSummary.decreaseQuantity')}
              >
                −
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={onIncrease}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                title={t('orderSummary.increaseQuantity')}
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onRemove}
                className="text-sm text-red-600 hover:text-red-800"
                title={t('orderSummary.removeItem')}
              >
                {t('orderPanel.remove')}
              </button>
            </div>
          </div>

          {isEditingVariations &&
            item.product.variations &&
            item.product.variations.length > 0 && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  {t('orderPanel.selectOptions')}
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
