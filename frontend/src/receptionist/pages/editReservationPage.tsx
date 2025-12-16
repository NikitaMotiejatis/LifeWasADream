import { useParams, useNavigate } from 'react-router-dom';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import { EditReservationPanel } from '@/receptionist/components/editReservation/editReservationPanel';
import type {
  Reservation,
  Service,
  Staff,
} from '@/receptionist/components/editReservation/types';
import { useAuth } from '@/global/hooks/auth';

type ApiReservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  serviceId: string;
  datetime: string;
  status: string;
};

type ApiStaff = Omit<Staff, 'nameKey'>;

export default function EditReservationPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 md:block">
        <SidebarCashier />
      </div>

      <div className="flex flex-1 flex-col md:ml-64">
        <Topbar />
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-500">{t('reservations.loading')}</p>
              </div>
            </div>
          }
        >
          <ReservationPanel />
        </Suspense>
      </div>
    </div>
  );
}

function ReservationPanel() {
  const { t } = useTranslation();
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const { authFetch, authFetchJson } = useAuth();

  const { data: staffRaw } = useSWR(
    'reservation/staff',
    url => authFetchJson<ApiStaff[]>(url, 'GET'),
    { suspense: true, revalidateOnMount: true },
  );
  const { data: services } = useSWR(
    'reservation/services',
    url => authFetchJson<Service[]>(url, 'GET'),
    { suspense: true, revalidateOnMount: true },
  );
  const { data: reservations } = useSWR(
    reservationId
      ? `reservation?search=${encodeURIComponent(reservationId)}`
      : null,
    url => authFetchJson<ApiReservation[]>(url, 'GET'),
    { suspense: true, revalidateOnMount: true },
  );

  const staffMembers: Staff[] = useMemo(
    () =>
      (staffRaw ?? []).map(s => ({
        ...s,
        nameKey: s.name,
      })),
    [staffRaw],
  );

  const reservationData = useMemo(() => {
    if (!reservationId || !reservations) return null;
    const apiReservation = reservations.find(r => r.id === reservationId);
    if (!apiReservation) return null;

    const selectedService = services?.find(s => s.id === apiReservation.serviceId);
    const datetime = new Date(apiReservation.datetime);

    return {
      id: apiReservation.id,
      service: apiReservation.serviceId,
      staff: apiReservation.staffId,
      datetime: isNaN(datetime.getTime()) ? new Date() : datetime,
      duration: selectedService?.duration ?? 60,
      customerName: apiReservation.customerName,
      customerPhone: apiReservation.customerPhone,
      status: apiReservation.status as any,
      notes: '',
      price: selectedService?.price ?? 0,
    } as Reservation;
  }, [reservationId, reservations, services]);

  const handleSave = async (updatedReservation: Reservation) => {
    try {
      const payload = {
        customerName: updatedReservation.customerName,
        customerPhone: updatedReservation.customerPhone,
        staffId: updatedReservation.staff,
        serviceId: updatedReservation.service,
        datetime: updatedReservation.datetime.toISOString(),
        status: updatedReservation.status,
      };

      const res = await authFetch(
        `reservation/${updatedReservation.id}`,
        'PUT',
        JSON.stringify(payload),
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        const msg = errBody?.error || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      alert(t('reservations.toast.updated', 'Reservation updated successfully!'));
      navigate('/reservations');
    } catch (error) {
      console.error('Save failed:', error);
      alert(t('common.error', 'An error occurred'));
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        t('common.confirmCancel', 'Are you sure? Changes will be lost.'),
      )
    ) {
      navigate('/reservations');
    }
  };

  if (!reservationId || !reservationData) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('reservations.noReservations')}</p>
          <button
            onClick={() => navigate('/reservations')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4">
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
            services={services}
            staffMembers={staffMembers}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </main>
  );
}
