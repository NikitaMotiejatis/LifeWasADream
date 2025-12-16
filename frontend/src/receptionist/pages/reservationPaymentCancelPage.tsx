import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ErrorIcon from '@/icons/errorIcon';
import Topbar from '@/global/components/topbar';

export default function ReservationPaymentCancelPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reservationId = searchParams.get('reservation_id');

  return (
    <div className="flex h-screen flex-col">
      <Topbar />
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
          <div className="mb-4">
            <ErrorIcon className="mx-auto h-16 w-16 text-orange-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            {t('payment.cancelled', 'Payment Cancelled')}
          </h2>
          <p className="mb-2 text-gray-600">
            {t(
              'payment.cancelledMessage',
              'Your payment was cancelled. No charges were made.',
            )}
          </p>
          {reservationId && (
            <p className="mb-6 text-sm text-gray-500">
              {t('payment.reservationId', 'Reservation ID')}: #{reservationId}
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/reservations')}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              {t('payment.backToReservations', 'Back to Reservations')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
