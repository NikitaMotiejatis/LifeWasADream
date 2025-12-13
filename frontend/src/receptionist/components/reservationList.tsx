import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import ReservationFilters from '@/receptionist/components/reservationFilters';
import ReservationListItem from '@/receptionist/components/reservationListItem';
import ReservationModal from '@/receptionist/components/reservationModal';
import { EditReservationPanel } from '@/receptionist/components/editReservation/editReservationPanel';
import Toast from '@/global/components/toast';
import { useAuth } from '@/global/hooks/auth';
import { mapReservationForEdit } from '@/utils/reservationMappings';
import useSWR from 'swr';

type Service = {
  Id: string;
  NameKey: string;
  Price: number;
};

type Staff = {
  Id: string;
  Name: string;
  Role: string;
  Services: Service[];
};

export type Reservation = {
  Id: string;
  CustomerName: string;
  CustomerPhone: string;
  StaffId: string;
  ServiceId: string;
  Datetime: string;
  Status: 'pending' | 'completed' | 'cancelled' | 'no_show' | 'refund_pending';
};

export type Counts = {
  all: number;
  pending: number;
  completed: number;
  cancelled: number;
  no_show: number;
  refund_pending: number;
};

const defaultCounts: Counts = {
  all: 0,
  pending: 0,
  completed: 0,
  cancelled: 0,
  no_show: 0,
  refund_pending: 0,
};

export default function ReservationList() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { authFetch } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'completed' | 'cancelled' | 'no_show' | 'refund_pending'
  >('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'complete' | 'cancel' | 'noshow' | 'refund' | 'cancel_refund'
  >('complete');
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reservationIdToEdit, setReservationIdToEdit] = useState<string | null>(
    null,
  );

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const {
    data: reservations,
    error: reservationsError,
    isLoading,
  } = useSWR(
    `reservation?status=${statusFilter}&from=${dateFrom}&to=${dateTo}`,
    (url: string) => authFetch<Reservation[]>(url, 'GET'),
    { revalidateOnMount: true },
  );

  const { data: counts } = useSWR(
    `reservation/counts?from=${dateFrom}&to=${dateTo}`,
    (url: string) => authFetch<Counts>(url, 'GET'),
    { revalidateOnMount: true },
  );

  const { data: services } = useSWR(
    `reservation/services`,
    (url: string) => authFetch<Service[]>(url, 'GET'),
    { revalidateOnMount: true },
  );

  const { data: staff } = useSWR(
    `reservation/staff`,
    (url: string) => authFetch<Staff[]>(url, 'GET'),
    { revalidateOnMount: true },
  );

  const openModal = (type: typeof modalType, res: Reservation) => {
    setModalType(type);
    setSelectedReservation(res);
    setModalOpen(true);
  };

  const handleEditClick = (reservation: Reservation) => {
    const formattedReservation = mapReservationForEdit(reservation);

    setReservationIdToEdit(reservation.Id);
    setSelectedReservation(formattedReservation as any);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (reservationData: any) => {
    try {
      if (!reservationData) throw new Error('No reservation data received');
      await authFetch(
        `reservation/${reservationData.id}`,
        'PUT',
        reservationData,
      );
      setEditModalOpen(false);
      setToast({ message: t('reservations.toast.updated'), type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: `Error: ${err.message}`, type: 'error' });
    }
    setTimeout(() => setToast(null), 5000);
  };

  const handleCancelEdit = () => {
    setEditModalOpen(false);
    setReservationIdToEdit(null);
  };

  const showToast = (key: string) => {
    setToast({ message: t(key), type: 'success' });
    setTimeout(() => setToast(null), 5000);
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">
        {t('reservations.loading')}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-5 text-xl font-bold text-gray-800">
          {t('reservations.title')}
        </h2>
        <ReservationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          timeFrom={timeFrom}
          setTimeFrom={setTimeFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          timeTo={timeTo}
          setTimeTo={setTimeTo}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          counts={counts || defaultCounts}
        />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div>{t('reservations.loading')}</div>
        ) : reservationsError ? (
          <div className="p-10 text-center text-gray-500">
            {t('reservations.loading')}
          </div>
        ) : (reservations || []).length > 0 ? (
          reservations?.map(res => (
            <ReservationListItem
              key={res.Id}
              reservation={res}
              services={services}
              staff={staff}
              formatPrice={formatPrice}
              onAction={openModal}
              onEdit={handleEditClick}
            />
          ))
        ) : (
          <p className="py-12 text-center text-gray-400">
            {t('reservations.noReservations')}
          </p>
        )}
      </div>

      <ReservationModal
        open={modalOpen}
        type={modalType}
        reservation={selectedReservation}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          if (!selectedReservation) return;
          const actions: Record<typeof modalType, () => void> = {
            complete: () => showToast('reservations.toast.completed'),
            cancel: () => showToast('reservations.toast.cancelled'),
            noshow: () => showToast('reservations.toast.noShow'),
            refund: () => showToast('reservations.toast.refundRequested'),
            cancel_refund: () =>
              showToast('reservations.toast.refundCancelled'),
          };
          actions[modalType]();
        }}
      />

      {editModalOpen && reservationIdToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelEdit}
          />

          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
            <EditReservationPanel
              mode="edit"
              reservationId={reservationIdToEdit}
              initialReservation={selectedReservation as any}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}
      <Toast toast={toast} />
    </div>
  );
}
