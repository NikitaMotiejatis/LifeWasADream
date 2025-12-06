import { useTranslation } from 'react-i18next';

interface ActionButtonsProps {
  onCancel?: () => void;
  onSave?: () => void;
}

export function ActionButtons({ onCancel, onSave }: ActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-8 flex gap-3 border-t border-gray-300 pt-6">
      <button
        onClick={onCancel}
        className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50"
      >
        {t('common.cancel')}
      </button>
      <button
        onClick={onSave}
        className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
      >
        {t('editReservation.saveChanges')}
      </button>
    </div>
  );
}   