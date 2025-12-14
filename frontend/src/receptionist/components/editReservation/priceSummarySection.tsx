import { useTranslation } from 'react-i18next';
import type { Reservation } from './types';
import { useCurrency } from '@/global/contexts/currencyContext';

interface PriceSummarySectionProps {
  reservation: Reservation;
}

export function PriceSummarySection({ reservation }: PriceSummarySectionProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">
        {t('reservation.bookingSummary')}
      </h3>
      <div className="flex justify-between">
        <span className="text-gray-600">
          {t('reservations.modal.totalAmount')}
        </span>
        <span className="text-xl font-bold">
          {formatPrice(reservation.price || 0)}
        </span>
      </div>
    </div>
  );
}
