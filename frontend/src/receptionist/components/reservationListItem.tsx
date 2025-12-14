import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/utils/formatDateTime';
import type { Reservation } from '@/receptionist/components/reservationList';

type Service = {
  id: string;
  nameKey: string;
  price: number;
};

type Staff = {
  id: string;
  name: string;
  role: string;
  services: Service[];
};
type Props = {
  reservation: Reservation;
  services?: Service[];
  staff?: Staff[];
  formatPrice: (n: number) => string;
  onAction: (
    type: 'complete' | 'cancel' | 'noshow' | 'refund' | 'cancel_refund',
    reservation: Reservation,
  ) => void;
  onEdit: (reservation: Reservation) => void;
};

export default function ReservationListItem({
  reservation,
  services,
  staff,
  formatPrice,
  onAction,
  onEdit,
}: Props) {
  const { t } = useTranslation();

  const service = services?.find(s => s.id === reservation.ServiceId);
  const serviceTitle = service?.id
    ? t(`reservations.services.${service?.id}`)
    : t('reservations.notFound');
  const servicePrice = service?.price ?? 0;
  const worker = staff?.find(s => s.id === reservation.StaffId);
  const staffName = worker?.name ?? t('reservations.notFound');

  return (
    <div className="group rounded-lg bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:ring-2 hover:ring-blue-500/20">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="text-lg font-bold whitespace-nowrap text-blue-600">
              #{reservation.Id}
            </h3>
            <span className="text-sm whitespace-nowrap text-gray-500">
              {formatDateTime(reservation.Datetime)}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-medium text-gray-900">
              {reservation.CustomerName}
            </span>
            <span className="text-gray-500">•</span>
            <span className="font-mono text-gray-600">
              {reservation.CustomerPhone}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
            <span>{serviceTitle}</span>
            <span className="hidden sm:inline">•</span>
            <span className="sm:hidden">|</span>
            <span>
              {staffName === 'Anyone'
                ? t('reservations.staff.anyone')
                : staffName}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold">{formatPrice(servicePrice)}</div>
        </div>

        <div className="flex gap-2">
          {reservation.Status === 'pending' && (
            <>
              <button
                onClick={() => onAction('complete', reservation)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                {t('reservations.actions.complete')}
              </button>

              <button
                onClick={() => onEdit(reservation)}
                className="bg-white-50 text-black-700 flex items-center gap-1.5 rounded-lg border border-gray-400 px-3 py-2 text-xs transition-colors hover:bg-gray-100"
                title={t('reservations.actions.edit')}
              >
                <span>{t('reservations.actions.edit')}</span>
              </button>

              <button
                onClick={() => onAction('cancel', reservation)}
                className="rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-100"
              >
                {t('reservations.actions.cancel')}
              </button>
              <button
                onClick={() => onAction('noshow', reservation)}
                className="rounded-lg border border-orange-500 bg-orange-50 px-3 py-2 text-xs text-orange-600 transition-colors hover:bg-orange-100"
              >
                {t('reservations.actions.noShow')}
              </button>
            </>
          )}
          {reservation.Status === 'completed' && (
            <button
              onClick={() => onAction('refund', reservation)}
              className="rounded-lg border border-purple-400 bg-purple-50 px-5 py-2 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
            >
              {t('reservations.actions.refund')}
            </button>
          )}
          {reservation.Status === 'refund_pending' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-orange-600">
                {t('reservations.status.refundInProgress')}
              </span>
              <button
                onClick={() => onAction('cancel_refund', reservation)}
                className="rounded-lg border border-orange-400 bg-orange-50 px-5 py-2 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100"
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
