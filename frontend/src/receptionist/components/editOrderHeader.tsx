import { useTranslation } from 'react-i18next';

type EditOrderHeaderProps = {
  orderId: string;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditOrderHeader({ orderId, onSave, onCancel }: EditOrderHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('editOrder.title', { defaultValue: 'Edit Order' })} #{orderId}
          </h1>
          <p className="text-gray-600">
            {t('editOrder.subtitle', { defaultValue: 'Modify items, payment method, and billing' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('editOrder.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            onClick={onSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('editOrder.save', { defaultValue: 'Save Changes' })}
          </button>
        </div>
      </div>
    </div>
  );
}