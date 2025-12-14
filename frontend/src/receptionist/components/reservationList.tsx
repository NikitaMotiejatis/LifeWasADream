import { useState, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import ReservationFilters from '@/receptionist/components/reservationFilters';
import ReservationListItem from '@/receptionist/components/reservationListItem';
import ReservationModal from '@/receptionist/components/reservationModal';
import { EditReservationPanel } from '@/receptionist/components/editReservation/editReservationPanel';
import Toast from '@/global/components/toast';
import { useAuth } from '@/global/hooks/auth';
import useSWR from 'swr';
import type { Cents } from '@/receptionist/contexts/cartContext';

type Service = {
  id: string;
  nameKey: string;
  price: Cents;
};

type Staff = {
  id: string;
  name: string;
  role: string;
  services: Service[];
};

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  serviceId: string;
  datetime: string;
  status: 'pending' | 'completed' | 'cancelled' | 'no_show' | 'refund_pending';
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

function buildISOString(
  date: string,
  time: string,
  isEnd = false,
): string | undefined {
  if (!date) return undefined;
  const localDate = new Date(
    `${date}T${time || (isEnd ? '23:59:59' : '00:00:00')}`,
  );
  if (!time) {
    isEnd
      ? localDate.setHours(23, 59, 59, 999)
      : localDate.setHours(0, 0, 0, 0);
  }
  return localDate.toISOString();
}

function buildQuery(
  status: string,
  from?: string,
  to?: string,
  search?: string,
) {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (search) params.set('search', search);
  return params.toString();
}

type ReservationFiltersState = {
  searchTerm: string;
  dateFrom: string;
  timeFrom: string;
  dateTo: string;
  timeTo: string;
  statusFilter: string;
};

export default function ReservationList() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { authFetch } = useAuth();

  const [filters, setFilters] = useState<ReservationFiltersState>({
    searchTerm: '',
    dateFrom: '',
    timeFrom: '',
    dateTo: '',
    timeTo: '',
    statusFilter: 'all',
  });

  const fromISO = useMemo(
    () =>
      filters.dateFrom
        ? buildISOString(filters.dateFrom, filters.timeFrom)
        : undefined,
    [filters.dateFrom, filters.timeFrom],
  );

  const toISO = useMemo(
    () =>
      filters.dateTo
        ? buildISOString(filters.dateTo, filters.timeTo, true)
        : undefined,
    [filters.dateTo, filters.timeTo],
  );

  const query = useMemo(
    () => buildQuery(filters.statusFilter, fromISO, toISO, filters.searchTerm),
    [filters.statusFilter, fromISO, toISO, filters.searchTerm],
  );

  const { data: staff } = useSWR(
    'reservation/staff',
    url => authFetch<Staff[]>(url, 'GET'),
    { revalidateOnMount: true },
  );
  const { data: services } = useSWR(
    'reservation/services',
    url => authFetch<Service[]>(url, 'GET'),
    { revalidateOnMount: true },
  );

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

  const openModal = (type: typeof modalType, res: Reservation) => {
    setModalType(type);
    setSelectedReservation(res);
    setModalOpen(true);
  };

  const handleEditClick = (reservation: Reservation) => {
    setReservationIdToEdit(reservation.id);
    setSelectedReservation(reservation as any);
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

  const showToast = (key: string) => {
    setToast({ message: t(key), type: 'success' });
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-5 text-xl font-bold text-gray-800">
          {t('reservations.title')}
        </h2>
        <ReservationFilters
          searchTerm={filters.searchTerm}
          setSearchTerm={v => setFilters(prev => ({ ...prev, searchTerm: v }))}
          dateFrom={filters.dateFrom}
          setDateFrom={v => setFilters(prev => ({ ...prev, dateFrom: v }))}
          timeFrom={filters.timeFrom}
          setTimeFrom={v => setFilters(prev => ({ ...prev, timeFrom: v }))}
          dateTo={filters.dateTo}
          setDateTo={v => setFilters(prev => ({ ...prev, dateTo: v }))}
          timeTo={filters.timeTo}
          setTimeTo={v => setFilters(prev => ({ ...prev, timeTo: v }))}
          statusFilter={filters.statusFilter}
          setStatusFilter={v =>
            setFilters(prev => ({ ...prev, statusFilter: v }))
          }
          counts={defaultCounts} // counts will be fetched in SWR below
        />
      </div>

      <div className="mt-6 space-y-3">
        <Suspense
          fallback={
            <div className="p-10 text-center text-gray-500">
              {t('reservations.loading')}
            </div>
          }
        >
          <Reservations
            ordersQuery={query}
            openModal={openModal}
            formatPrice={formatPrice}
            onEdit={handleEditClick}
            staff={staff || []}
            services={services || []}
          />
        </Suspense>
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
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
            <EditReservationPanel
              mode="edit"
              reservationId={reservationIdToEdit}
              services={services as any}
              staffMembers={staff as any}
              initialReservation={selectedReservation as any}
              onSave={handleSaveEdit}
              onCancel={() => setEditModalOpen(false)}
            />
          </div>
        </div>
      )}
      <Toast toast={toast} />
    </div>
  );
}

type ReservationsProps = {
  ordersQuery: string;
  openModal: (
    type: 'complete' | 'cancel' | 'noshow' | 'refund' | 'cancel_refund',
    res: Reservation,
  ) => void;
  formatPrice: (amount: number) => string;
  onEdit: (res: Reservation) => void;
  staff: Staff[];
  services: Service[];
};

function Reservations({
  ordersQuery,
  openModal,
  formatPrice,
  onEdit,
  staff,
  services,
}: ReservationsProps) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();

  const { data: reservations, error } = useSWR(
    `reservation?${ordersQuery}`,
    (url: string) => authFetch<Reservation[]>(url, 'GET'),
    { suspense: true, revalidateOnMount: true },
  );

  if (error) {
    return (
      <p className="py-12 text-center text-gray-400">
        {t('somethingWentWrong')}
      </p>
    );
  }

  if (!reservations || reservations.length === 0) {
    return (
      <p className="py-12 text-center text-gray-400">
        {t('reservations.noReservations')}
      </p>
    );
  }

  return (
    <>
      {reservations.map(res => {
        const resStaff = staff.find(s => s.id === res.staffId);
        const resService = services.find(s => s.id === res.serviceId);
        return (
          <ReservationListItem
            key={res.id}
            reservation={res}
            staff={resStaff ? [resStaff] : []}
            services={resService ? [resService] : []}
            formatPrice={formatPrice}
            onAction={openModal}
            onEdit={onEdit}
          />
        );
      })}
    </>
  );
}
