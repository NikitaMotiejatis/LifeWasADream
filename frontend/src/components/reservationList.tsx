import { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '../contexts/currencyContext';
import ReservationFilters from './reservationFilters';
import ReservationListItem from './reservationListItem';
import ReservationModal from './reservationModal';
import Toast from './toast';

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  serviceId: string;
  datetime: Date;
  status:
    | 'pending'
    | 'in_service'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'refund_pending';
}

const staffMap: Record<string, string> = {
  anyone: 'Any Staff',
  james: 'James Chen',
  sarah: 'Sarah Johnson',
};

export const servicesMap: Record<string, { title: string; price: number }> = {
  '1': { title: 'Haircut & Style', price: 65 },
  '2': { title: 'Hair Color', price: 120 },
  '3': { title: 'Manicure', price: 35 },
  '4': { title: 'Pedicure', price: 50 },
};

export default function ReservationList() {
  const { formatPrice } = useCurrency();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [timeFrom, setTimeFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    | 'all'
    | 'pending'
    | 'in_service'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'refund_pending'
  >('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    'start' | 'complete' | 'cancel' | 'noshow' | 'refund' | 'cancel_refund'
  >('start');
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      await new Promise(r => setTimeout(r, 500));
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
          status: 'in_service',
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
          status: 'pending',
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

  const sortedAndFiltered = useMemo(() => {
    const buildDateTime = (
      dateStr: string,
      timeStr: string,
      isEnd: boolean = false,
    ) => {
      if (!dateStr) return null;

      let time = timeStr;
      if (!time) {
        time = isEnd ? '23:59' : '00:00';
      }

      return new Date(`${dateStr}T${time}`);
    };

    const fromDateTime = buildDateTime(dateFrom, timeFrom, false);
    const toDateTime = buildDateTime(dateTo, timeTo, true);

    let filtered = reservations.filter(r => {
      if (statusFilter === 'pending' && r.status !== 'pending') return false;
      if (statusFilter === 'in_service' && r.status !== 'in_service')
        return false;
      if (statusFilter === 'completed' && r.status !== 'completed')
        return false;
      if (statusFilter === 'cancelled' && r.status !== 'cancelled')
        return false;
      if (statusFilter === 'no_show' && r.status !== 'no_show') return false;
      if (statusFilter === 'refund_pending' && r.status !== 'refund_pending')
        return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();

        const searchable = [
          r.id,
          r.customerName,
          r.customerPhone,
          servicesMap[r.serviceId]?.title || '',
          staffMap[r.staffId] ||
            (r.staffId === 'anyone' ? 'any staff' : r.staffId),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      const reservationTime = r.datetime.getTime();
      if (fromDateTime && reservationTime < fromDateTime.getTime())
        return false;
      if (toDateTime && reservationTime > toDateTime.getTime()) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const reservation = {
        in_service: 0,
        pending: 1,
        refund_pending: 2,
        completed: 3,
        cancelled: 4,
        no_show: 5,
      };
      const diff = reservation[a.status] - reservation[b.status];
      return diff !== 0 ? diff : parseInt(b.id) - parseInt(a.id);
    });
  }, [
    reservations,
    searchTerm,
    statusFilter,
    dateFrom,
    timeFrom,
    dateTo,
    timeTo,
  ]);

  const openModal = (
    type:
      | 'start'
      | 'complete'
      | 'cancel'
      | 'noshow'
      | 'refund'
      | 'cancel_refund',
    reservation: Reservation,
  ) => {
    setModalType(type);
    setSelectedReservation(reservation);
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
        Loading reservations...
      </div>
    );
  }

  const counts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    in_service: reservations.filter(r => r.status === 'in_service').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    no_show: reservations.filter(r => r.status === 'no_show').length,
    refund_pending: reservations.filter(r => r.status === 'refund_pending')
      .length,
  };

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5800);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-5 shadow">
        <h2 className="mb-5 text-xl font-bold text-gray-800">Reservations</h2>
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
            No reservations found
          </p>
        ) : (
          sortedAndFiltered.map(res => (
            <ReservationListItem
              key={res.id}
              reservation={res}
              formatPrice={formatPrice}
              staffMap={staffMap}
              servicesMap={servicesMap}
              onAction={openModal}
              formatDateTime={formatDateTime}
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
            start: () => {
              updateStatus(selectedReservation.id, 'in_service');
              showToast('Service marked as started.');
            },
            complete: () => {
              updateStatus(selectedReservation.id, 'completed');
            },
            cancel: () => {
              updateStatus(selectedReservation.id, 'cancelled');
              showToast('Reservation cancelled.');
            },
            noshow: () => {
              updateStatus(selectedReservation.id, 'no_show');
              showToast('Marked as No-Show.');
            },
            refund: () => {
              updateStatus(selectedReservation.id, 'refund_pending');
              showToast('Refund request sent successfully.');
            },
            cancel_refund: () => {
              updateStatus(selectedReservation.id, 'completed');
              showToast('Refund request cancelled.');
            },
          };

          actions[modalType]();
        }}
      />

      <Toast toast={toast} />
    </div>
  );
}
