'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '../contexts/currencyContext';
import ReservationFilters from './reservationFilters';
import ReservationListItem from './reservationListItem';
import ReservationModal from './reservationModal';

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
  createdAt: Date;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

const staffMap: Record<string, string> = {
  anyone: 'Any Staff',
  james: 'James Chen',
  sarah: 'Sarah Johnson',
};

const servicesMap: Record<string, { title: string; price: number }> = {
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
  ('');
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
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // MOCK DUOMENYS SU TIKRU datetime
  useEffect(() => {
    const mock: Reservation[] = [
      {
        id: 'RES-301',
        customerName: 'Emma Wilson',
        customerPhone: '+1234567890',
        staffId: 'james',
        serviceId: '1',
        datetime: new Date('2025-04-05T10:00:00'),
        status: 'completed',
        createdAt: new Date(),
      },
      {
        id: 'RES-302',
        customerName: 'Liam Chen',
        customerPhone: '+1987654321',
        staffId: 'anyone',
        serviceId: '3',
        datetime: new Date('2025-04-06T14:30:00'),
        status: 'in_service',
        createdAt: new Date(),
      },
      {
        id: 'RES-303',
        customerName: 'Sophia Kim',
        customerPhone: '+1555123456',
        staffId: 'sarah',
        serviceId: '4',
        datetime: new Date('2025-04-06T11:00:00'),
        status: 'pending',
        createdAt: new Date(),
      },
      {
        id: 'RES-304',
        customerName: 'Noah Park',
        customerPhone: '+1443123456',
        staffId: 'james',
        serviceId: '2',
        datetime: new Date('2025-04-07T16:00:00'),
        status: 'pending',
        createdAt: new Date(),
      },
      {
        id: 'RES-305',
        customerName: 'Ava Brown',
        customerPhone: '+1333444555',
        staffId: 'anyone',
        serviceId: '1',
        datetime: new Date('2025-04-04T09:30:00'),
        status: 'no_show',
        createdAt: new Date(),
      },
    ];

    setTimeout(() => {
      setReservations(mock);
      setLoading(false);
    }, 400);
  }, []);

  // TOBULAS FILTRAVIMAS SU VIENU datetime LAUKU
  const filtered = useMemo(() => {
    const parseFilter = (
      date: string,
      time: string | undefined,
      isEnd: boolean,
    ): number | null => {
      if (!date) return null;
      const t = time ? `${time}:00` : isEnd ? '23:59:59' : '00:00:00';
      const d = new Date(`${date}T${t}`);
      return isNaN(d.getTime()) ? null : d.getTime();
    };

    const fromTs = parseFilter(dateFrom, timeFrom, false);
    const toTs = parseFilter(dateTo, timeTo, true);

    return reservations
      .filter(r => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;

        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const text =
            `${r.id} ${r.customerName} ${r.customerPhone}`.toLowerCase();
          if (!text.includes(q)) return false;
        }

        const resTs = r.datetime.getTime();

        if (fromTs !== null && resTs < fromTs) return false;
        if (toTs !== null && resTs > toTs) return false;

        return true;
      })
      .sort((a, b) => {
        const priority: Record<Reservation['status'], number> = {
          in_service: 1,
          pending: 2,
          completed: 3,
          refund_pending: 4,
          cancelled: 5,
          no_show: 6,
        };

        const pa = priority[a.status];
        const pb = priority[b.status];
        if (pa !== pb) return pa - pb;

        return b.datetime.getTime() - a.datetime.getTime(); // naujausios viršuje
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
    setSelectedRes(reservation);
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

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-gray-400">
            No reservations found
          </p>
        ) : (
          filtered.map(res => (
            <ReservationListItem
              key={res.id}
              reservation={res}
              formatPrice={formatPrice}
              staffMap={staffMap}
              servicesMap={servicesMap}
              onAction={openModal}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))
        )}
      </div>

      <ReservationModal
        open={modalOpen}
        type={modalType}
        reservation={selectedRes}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          if (!selectedRes) return;
          const map = {
            start: 'in_service',
            complete: 'completed',
            cancel: 'cancelled',
            noshow: 'no_show',
            refund: 'refund_pending',
            cancel_refund: 'completed',
          } as const;
          updateStatus(selectedRes.id, map[modalType]);
        }}
      />
    </div>
  );
}
