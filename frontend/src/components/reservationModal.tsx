import { Reservation } from './reservationList';
import { useCurrency } from '../contexts/currencyContext';

interface Props {
  open: boolean;
  type: 'start' | 'complete' | 'cancel' | 'noshow' | 'refund' | 'cancel_refund';
  reservation: Reservation | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReservationModal({
  open,
  type,
  reservation,
  onClose,
  onConfirm,
}: Props) {
  const { formatPrice } = useCurrency();

  if (!open || !reservation) return null;

  const titles = {
    start: 'Start Service',
    complete: 'Complete Service',
    cancel: 'Cancel Reservation',
    noshow: 'Mark as No-Show',
    refund: 'Request Refund',
    cancel_refund: 'Cancel Refund Request',
  };

  const servicesMap: Record<string, { title: string; price: number }> = {
    '1': { title: 'Haircut & Style', price: 65 },
    '2': { title: 'Hair Color', price: 120 },
    '3': { title: 'Manicure', price: 35 },
    '4': { title: 'Pedicure', price: 50 },
  };
  const servicePrice = servicesMap[reservation.serviceId]?.price || 0;

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en', { month: 'short' });
    const time = d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} ${month} • ${time}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="inset-overlay absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <h3 className="mb-5 text-xl font-bold text-gray-900">
          {titles[type]} #{reservation.id}
        </h3>

        <div className="space-y-2 text-sm text-gray-700">
          <p className="font-medium">{reservation.customerName}</p>
          <p className="text-gray-600">{reservation.customerPhone}</p>
          <p className="text-gray-600">
            {formatDateTime(reservation.datetime)}
          </p>
        </div>

        {type === 'complete' && (
          <div className="mt-6 rounded-xl bg-blue-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(servicePrice)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-400 py-2 text-xs font-medium transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2 text-xs font-medium text-white transition ${
              type === 'complete'
                ? 'bg-green-600 hover:bg-green-700'
                : type === 'refund' || type === 'cancel_refund'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : type === 'cancel' || type === 'noshow'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {type === 'start' && 'Start Service'}
            {type === 'complete' && 'Confirm Completion'}
            {type === 'cancel' && 'Confirm Cancellation'}
            {type === 'noshow' && 'Mark as No-Show'}
            {type === 'refund' && 'Request Refund'}
            {type === 'cancel_refund' && 'Cancel Refund Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
