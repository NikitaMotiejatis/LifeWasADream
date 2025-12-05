import { useTranslation } from 'react-i18next';
import type { Reservation } from './types';

type CustomerInfoSectionProps = {
  reservation: Reservation;
  handleChange: (field: keyof Reservation, value: any) => void;
};

export function CustomerInfoSection({ reservation, handleChange }: CustomerInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">
        {t('reservation.customerInfo', 'Customer Information')}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.customerName', 'Customer Name')}
          </label>
          <input
            type="text"
            value={reservation.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder={t('reservation.customerNamePlaceholder', 'Customer name')}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.customerPhone', 'Phone Number')}
          </label>
          <input
            type="tel"
            value={reservation.customerPhone}
            onChange={(e) => handleChange('customerPhone', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder={t('reservation.customerPhonePlaceholder', 'Phone number')}
          />
        </div>
      </div>
    </div>
  );
}