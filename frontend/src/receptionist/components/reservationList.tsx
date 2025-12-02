import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import ReservationFilters from '@/receptionist/components/reservationFilters';
import ReservationListItem from '@/receptionist/components/reservationListItem';
import ReservationModal from '@/receptionist/components/reservationModal';
import Toast from '@/global/components/toast';

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  serviceId: string;
  datetime: Date;
<<<<<<< HEAD
  status: 'pending' | 'completed' | 'cancelled' | 'no_show' | 'refund_pending';
=======
  status:
    | 'pending'
    | 'in_service'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'refund_pending';
>>>>>>> c766386 (Big localization)
};

export const servicesMap: Record<string, { title: string; price: number }> = {
  '1': { title: 'Haircut & Style', price: 65 },
  '2': { title: 'Hair Color', price: 120 },
  '3': { title: 'Manicure', price: 35 },
  '4': { title: 'Pedicure', price: 50 },
};

export default function ReservationList() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      // TODO: remove timeout
      await new Promise(r => setTimeout(r, 300));
      const mock: Reservation[] = [
        {
          id: 'RES-301',
          customerName: 'Emma Wilson',
          customerPhone: '+1234567890',
          staffId: 'james',
          serviceId: '1',
          datetime: new Date('2025-11-28T10:00:00'),
          status: 'completed',
        },
        {
          id: 'RES-302',
          customerName: 'Liam Chen',
          customerPhone: '+1987654321',
          staffId: 'anyone',
          serviceId: '3',
          datetime: new Date('2025-11-30T14:30:00'),
          status: 'pending',
        },
        {
          id: 'RES-303',
          customerName: 'Sophia Kim',
          customerPhone: '+1555123456',
          staffId: 'sarah',
          serviceId: '4',
          datetime: new Date('2025-12-05T11:00:00'),
          status: 'pending',
        },
        {
          id: 'RES-304',
          customerName: 'Noah Park',
          customerPhone: '+1443123456',
          staffId: 'james',
          serviceId: '2',
          datetime: new Date('2025-12-18T16:00:00'),
          status: 'cancelled',
        },
        {
          id: 'RES-305',
          customerName: 'Ava Brown',
          customerPhone: '+1333444555',
          staffId: 'anyone',
          serviceId: '1',
          datetime: new Date('2025-11-20T09:30:00'),
          status: 'no_show',
        },
      ];
      setReservations(mock);
      setLoading(false);
    };
    load();
  }, []);

  const sortedAndFiltered = useMemo(() => {
    const from =
      dateFrom && timeFrom
        ? new Date(`${dateFrom}T${timeFrom}`)
        : dateFrom
          ? new Date(`${dateFrom}T00:00`)
          : null;
    const to =
      dateTo && timeTo
        ? new Date(`${dateTo}T${timeTo}`)
        : dateTo
          ? new Date(`${dateTo}T23:59:59`)
          : null;

    return reservations
      .filter(r => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;

        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const searchable =
<<<<<<< HEAD
            `${r.id} ${r.customerName} ${r.customerPhone} ${t(`reservations.services.${r.serviceId}`)} ${t(`reservations.staff.${r.staffId}`)}`.toLowerCase();
=======
            `${r.id} ${r.customerName} ${r.customerPhone} ${t(`services.${r.serviceId}`)} ${t(`staff.${r.staffId}`)}`.toLowerCase();
>>>>>>> c766386 (Big localization)
          if (!searchable.includes(q)) return false;
        }

        const time = r.datetime.getTime();
        if (from && time < from.getTime()) return false;
        if (to && time > to.getTime()) return false;

        return true;
      })
      .sort((a, b) => {
        const order: Record<Reservation['status'], number> = {
<<<<<<< HEAD
          pending: 0,
          refund_pending: 1,
          completed: 2,
          cancelled: 3,
          no_show: 4,
=======
          in_service: 0,
          pending: 1,
          refund_pending: 2,
          completed: 3,
          cancelled: 4,
          no_show: 5,
>>>>>>> c766386 (Big localization)
        };
        return (
          order[a.status] - order[b.status] ||
          parseInt(b.id.slice(4)) - parseInt(a.id.slice(4))
        );
      });
  }, [
    reservations,
    searchTerm,
    statusFilter,
    dateFrom,
    timeFrom,
    dateTo,
    timeTo,
    t,
  ]);

  const openModal = (type: typeof modalType, res: Reservation) => {
    setModalType(type);
    setSelectedReservation(res);
    setModalOpen(true);
  };

  const updateStatus = (id: string, newStatus: Reservation['status']) => {
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        {t('reservations.loading')}
      </div>
    );
  }

  const counts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    no_show: reservations.filter(r => r.status === 'no_show').length,
    refund_pending: reservations.filter(r => r.status === 'refund_pending')
      .length,
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
          counts={counts}
        />
      </div>

      <div className="mt-6 space-y-3">
        {sortedAndFiltered.length === 0 ? (
          <p className="py-12 text-center text-gray-400">
            {t('reservations.noReservations')}
          </p>
        ) : (
          sortedAndFiltered.map(res => (
            <ReservationListItem
              key={res.id}
              reservation={res}
              formatPrice={formatPrice}
              onAction={openModal}
            />
          ))
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
<<<<<<< HEAD
=======
            start: () => {
              updateStatus(selectedReservation.id, 'in_service');
              showToast('reservations.toast.started');
            },
>>>>>>> c766386 (Big localization)
            complete: () => {
              updateStatus(selectedReservation.id, 'completed');
              showToast('reservations.toast.completed');
            },
            cancel: () => {
              updateStatus(selectedReservation.id, 'cancelled');
              showToast('reservations.toast.cancelled');
            },
            noshow: () => {
              updateStatus(selectedReservation.id, 'no_show');
              showToast('reservations.toast.noShow');
            },
            refund: () => {
              updateStatus(selectedReservation.id, 'refund_pending');
              showToast('reservations.toast.refundRequested');
            },
            cancel_refund: () => {
              updateStatus(selectedReservation.id, 'completed');
              showToast('reservations.toast.refundCancelled');
            },
          };

          actions[modalType]();
        }}
      />

      <Toast toast={toast} />
    </div>
  );
}
