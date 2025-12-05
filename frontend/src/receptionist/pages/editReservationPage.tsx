import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import { EditReservationPanel } from '@/receptionist/components/editReservation/editReservationPanel';
import type { Reservation } from '@/receptionist/components/editReservation/types';

const mapReservationForEdit = (reservationFromList: any): Reservation => {
  // Map service IDs from your list (1,2,3,4) to edit panel (haircut,color,etc)
  const serviceMap: Record<string, string> = {
    '1': 'haircut',
    '2': 'color',
    '3': 'manicure',
    '4': 'pedicure'
  };

  // Map staff IDs
  const staffMap: Record<string, string> = {
    'james': 'james',
    'sarah': 'sarah',
    'anyone': 'anyone'
  };

  // Service prices and durations
  const serviceDetails: Record<string, { price: number; duration: number }> = {
    'haircut': { price: 65, duration: 60 },
    'color': { price: 120, duration: 120 },
    'manicure': { price: 35, duration: 45 },
    'pedicure': { price: 50, duration: 60 }
  };

  const serviceId = serviceMap[reservationFromList.serviceId] || 'haircut';
  const details = serviceDetails[serviceId] || { price: 65, duration: 60 };

  return {
    id: reservationFromList.id,
    service: serviceId,
    staff: staffMap[reservationFromList.staffId] || 'anyone',
    datetime: reservationFromList.datetime, // <-- FIX: use reservationFromList.datetime
    duration: details.duration,
    customerName: reservationFromList.customerName,
    customerPhone: reservationFromList.customerPhone,
    status: reservationFromList.status,
    notes: '',
    price: details.price
  };
};

export default function EditReservationPage() {
  const { t } = useTranslation();
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [reservationData, setReservationData] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      try {
        if (reservationId) {
          const storedReservations = localStorage.getItem('reservations');
          if (storedReservations) {
            const reservations = JSON.parse(storedReservations);
            const foundReservation = reservations.find((r: any) => r.id === reservationId);
            
            if (foundReservation) {
              const mappedReservation = mapReservationForEdit(foundReservation);
              setReservationData(mappedReservation);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  const handleSave = async (updatedReservation: Reservation) => {
    try {
      console.log('Saving reservation:', updatedReservation);

      const storedReservations = localStorage.getItem('reservations');
      if (storedReservations) {
        const reservations = JSON.parse(storedReservations);
        const updatedReservations = reservations.map((r: any) => 
          r.id === updatedReservation.id ? updatedReservation : r
        );
        localStorage.setItem('reservations', JSON.stringify(updatedReservations));
      }
      
      alert(t('reservations.toast.updated', 'Reservation updated successfully!'));
      navigate('/reservations');
    } catch (error) {
      console.error('Save failed:', error);
      alert(t('common.error', 'An error occurred'));
    }
  };

  const handleCancel = () => {
    if (window.confirm(t('common.confirmCancel', 'Are you sure? Changes will be lost.'))) {
      navigate('/reservations');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">
            {t('reservations.loading', 'Loading reservation...')}
          </p>
        </div>
      </div>
    );
  }

  if (!reservationData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">
            {t('reservations.noReservations', 'Reservation not found')}
          </p>
          <button
            onClick={() => navigate('/reservations')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t('common.back', 'Back to Reservations')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 md:block">
        <SidebarCashier />
      </div>

      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
                aria-label={t('common.back')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('editReservation.title')} #{reservationData.id}
                </h1>
                <p className="text-sm text-gray-600">
                  {reservationData.customerName} • {reservationData.customerPhone}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <EditReservationPanel
                mode="edit"
                reservationId={reservationData.id}
                initialReservation={reservationData}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}