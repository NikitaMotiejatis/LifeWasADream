import type { Reservation } from './reservationList';

interface Props {
  reservation: Reservation;
  formatPrice: (n: number) => string;
  staffMap: Record<string, string>;
  servicesMap: Record<string, { title: string; price: number }>;
  onAction: (
    type:
      | 'start'
      | 'complete'
      | 'cancel'
      | 'noshow'
      | 'refund'
      | 'cancel_refund',
    reservation: Reservation,
  ) => void;
  formatDateTime: (date: Date) => string;
}

export default function ReservationListItem({
  reservation,
  formatPrice,
  staffMap,
  servicesMap,
  onAction,
  formatDateTime,
}: Props) {
  const service = servicesMap[reservation.serviceId];
  const staff = staffMap[reservation.staffId] || 'Any Staff';

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
            <span>{service.title}</span>
            <span className="hidden sm:inline">•</span>
            <span className="sm:hidden">|</span>
            <span>{staff}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold">{formatPrice(service.price)}</div>
        </div>

        <div className="flex gap-2">
          {reservation.status === 'pending' && (
            <>
              <button
                onClick={() => onAction('start', reservation)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Start
              </button>
              <button
                onClick={() => onAction('cancel', reservation)}
                className="rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                Cancel
              </button>
            </>
          )}
          {reservation.status === 'in_service' && (
            <button
              onClick={() => onAction('complete', reservation)}
              className="rounded-lg bg-green-600 px-5 py-2 text-xs font-medium text-white hover:bg-green-700"
            >
              Complete
            </button>
          )}
          {(reservation.status === 'pending' ||
            reservation.status === 'in_service') && (
            <button
              onClick={() => onAction('noshow', reservation)}
              className="rounded-lg border border-orange-500 bg-orange-50 px-3 py-2 text-xs text-orange-600 hover:bg-orange-50"
            >
              No-Show
            </button>
          )}
          {reservation.status === 'completed' && (
            <>
              <button
                onClick={() => onAction('refund', reservation)}
                className="rounded-lg border border-purple-400 bg-purple-50 px-5 py-2 text-xs font-medium text-purple-700 hover:bg-purple-100"
              >
                Refund
              </button>
            </>
          )}
          {reservation.status === 'refund_pending' && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-orange-600">
                Refund in progress
              </span>
              <button
                onClick={() => onAction('cancel_refund', reservation)}
                className="rounded-lg border border-orange-400 bg-orange-50 px-5 py-2 text-xs font-medium text-orange-700 hover:bg-orange-100"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
