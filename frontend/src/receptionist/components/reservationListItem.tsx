import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/utils/formatDateTime';
import type { Reservation } from '@/receptionist/components/reservationList';
import { servicesMap } from './reservationList';

type Props = {
  reservation: Reservation;
  formatPrice: (n: number) => string;
  onAction: (
    type: 'complete' | 'cancel' | 'noshow' | 'refund' | 'cancel_refund',
    reservation: Reservation,
  ) => void;
  onEdit: (reservation: Reservation) => void; // Separate handler for edit
};

export default function ReservationListItem({
  reservation,
  formatPrice,
  onAction,
  onEdit,
}: Props) {
  const { t } = useTranslation();
  const service = servicesMap[reservation.serviceId];
  const serviceTitle = t(`reservations.services.${reservation.serviceId}`);
  const staffName = t(`reservations.staff.${reservation.staffId}`);

  return (
    <div className="group rounded-lg bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-blue-500/20">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="text-lg font-bold whitespace-nowrap text-blue-600">
              #{reservation.id}
            </h3>
            <span className="text-sm whitespace-nowrap text-gray-500">
              {formatDateTime(reservation.datetime)}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-medium text-gray-900">
              {reservation.customerName}
            </span>
            <span className="text-gray-500">•</span>
            <span className="font-mono text-gray-600">
              {reservation.customerPhone}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            <span>{serviceTitle}</span>
            <span className="hidden sm:inline">•</span>
            <span className="sm:hidden">|</span>
            <span>{staffName}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold">{formatPrice(service.price)}</div>
        </div>

        <div className="flex gap-2">
          {reservation.status === 'pending' && (
            <>
              <button
                onClick={() => onAction('complete', reservation)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                {t('reservations.actions.complete')}
              </button>
              
              {/* EDIT BUTTON - Uses onEdit NOT onAction */}
              <button
                onClick={() => onEdit(reservation)} // Directly calls onEdit
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                title={t('reservations.actions.edit')}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3.5 w-3.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                  />
                </svg>
                <span>{t('reservations.actions.edit')}</span>
              </button>

              <button
                onClick={() => onAction('cancel', reservation)}
                className="rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100 transition-colors"
              >
                {t('reservations.actions.cancel')}
              </button>
              <button
                onClick={() => onAction('noshow', reservation)}
                className="rounded-lg border border-orange-500 bg-orange-50 px-3 py-2 text-xs text-orange-600 hover:bg-orange-100 transition-colors"
              >
                {t('reservations.actions.noShow')}
              </button>
            </>
          )}
          {reservation.status === 'completed' && (
            <button
              onClick={() => onAction('refund', reservation)}
              className="rounded-lg border border-purple-400 bg-purple-50 px-5 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              {t('reservations.actions.refund')}
            </button>
          )}
          {reservation.status === 'refund_pending' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-orange-600">
                {t('reservations.status.refundInProgress')}
              </span>
              <button
                onClick={() => onAction('cancel_refund', reservation)}
                className="rounded-lg border border-orange-400 bg-orange-50 px-5 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
              >
                {t('reservations.actions.cancelRefund')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}