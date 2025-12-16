import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { verifyStripePayment } from '@/utils/paymentService';
import SuccessIcon from '@/icons/successIcon';
import Topbar from '@/global/components/topbar';

export default function ReservationPaymentSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const reservationId = searchParams.get('reservation_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsVerifying(false);
        return;
      }

      try {
        await verifyStripePayment(sessionId);
        setIsVerifying(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment verification failed');
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="flex h-screen flex-col">
        <Topbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-lg text-gray-600">
              {t('payment.verifying', 'Verifying payment...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col">
        <Topbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
            <div className="mb-4 text-red-600">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              {t('payment.verificationFailed', 'Verification Failed')}
            </h2>
            <p className="mb-6 text-gray-600">{error}</p>
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

  return (
    <div className="flex h-screen flex-col">
      <Topbar />
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
          <div className="mb-4">
            <SuccessIcon className="mx-auto h-16 w-16 text-green-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            {t('payment.success', 'Payment Successful!')}
          </h2>
          <p className="mb-2 text-gray-600">
            {t('payment.reservationSuccessMessage', 'Your reservation payment has been processed successfully.')}
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
              {t('payment.viewReservations', 'View Reservations')}
            </button>
            <button
              onClick={() => navigate('/newReservation')}
              className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('payment.newReservation', 'Create New Reservation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
