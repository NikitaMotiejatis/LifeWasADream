import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import ReservationFilters from '@/receptionist/components/reservationFilters';
import ReservationListItem from '@/receptionist/components/reservationListItem';
import ReservationModal from '@/receptionist/components/reservationModal';
import { EditReservationPanel } from '@/receptionist/components/editReservation/editReservationPanel';
import Toast from '@/global/components/toast';

export type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  serviceId: string;
  datetime: Date;
  status: 'pending' | 'completed' | 'cancelled' | 'no_show' | 'refund_pending';
};

export const servicesMap: Record<string, { title: string; price: number }> = {
  '1': { title: 'Haircut & Style', price: 65 },
  '2': { title: 'Hair Color', price: 120 },
  '3': { title: 'Manicure', price: 35 },
  '4': { title: 'Pedicure', price: 50 },
};

// Map EditReservationPanel service IDs to your service IDs
const serviceIdMapping: Record<string, string> = {
  haircut: '1',
  color: '2',
  manicure: '3',
  pedicure: '4',
};

// Map EditReservationPanel staff IDs to your staff IDs
const staffIdMapping: Record<string, string> = {
  james: 'james',
  sarah: 'sarah',
  any: 'anyone',
};

// ADD THIS FUNCTION HERE - It formats reservation for EditReservationPanel
const formatReservationForEdit = (res: Reservation): any => {
  // Create reverse service mapping
  const reverseServiceMap: Record<string, string> = {};
  Object.entries(serviceIdMapping).forEach(([key, value]) => {
    reverseServiceMap[value] = key;
  });
  
  // Staff mapping (same in both)
  const staffMap: Record<string, string> = {
    'james': 'james',
    'sarah': 'sarah',
    'anyone': 'anyone'
  };

  // Extract date and time from datetime object
  const date = res.datetime.toISOString().split('T')[0];
  const time = res.datetime.toTimeString().slice(0, 5); // HH:MM format

  // Get service details
  const serviceInfo = servicesMap[res.serviceId];
  const price = serviceInfo?.price || 0;

  // Service durations
  const serviceDurations: Record<string, number> = {
    'haircut': 60,
    'color': 120,
    'manicure': 45,
    'pedicure': 60
  };

  const serviceId = reverseServiceMap[res.serviceId] || 'haircut';
  const duration = serviceDurations[serviceId] || 60;

  return {
    id: res.id,
    service: serviceId,
    staff: staffMap[res.staffId] || 'anyone',
    date,
    time,
    duration,
    customerName: res.customerName,
    customerPhone: res.customerPhone,
    status: res.status,
    notes: '',
    price
  };
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

  // States for edit functionality
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [reservationIdToEdit, setReservationIdToEdit] = useState<string | null>(
    null,
  );

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const load = async () => {
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
            `${r.id} ${r.customerName} ${r.customerPhone} ${t(`reservations.services.${r.serviceId}`)} ${t(`reservations.staff.${r.staffId}`)}`.toLowerCase();
          if (!searchable.includes(q)) return false;
        }

        const time = r.datetime.getTime();
        if (from && time < from.getTime()) return false;
        if (to && time > to.getTime()) return false;

        return true;
      })
      .sort((a, b) => {
        const order: Record<Reservation['status'], number> = {
          pending: 0,
          refund_pending: 1,
          completed: 2,
          cancelled: 3,
          no_show: 4,
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

  // Handle edit click
const handleEditClick = (reservation: Reservation) => {
  
  const formattedReservation = formatReservationForEdit(reservation);
  
  setReservationIdToEdit(reservation.id);
  setSelectedReservation(formattedReservation as any);
  setEditModalOpen(true);
};

  const updateStatus = (id: string, newStatus: Reservation['status']) => {
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    setModalOpen(false);
  };

  // Handle saving edits - with better error handling
  const handleSaveEdit = (reservationData: any) => {
    try {
      if (!reservationData) {
        throw new Error('No reservation data received');
      }

      // Find original reservation to preserve its status
      const originalReservation = reservations.find(
        r => r.id === reservationData.id,
      );

      if (!originalReservation) {
        throw new Error(`Reservation with ID ${reservationData.id} not found`);
      }

      // Create datetime safely
      let datetime: Date;
      if (reservationData.date && reservationData.time) {
        datetime = new Date(`${reservationData.date}T${reservationData.time}`);
        if (isNaN(datetime.getTime())) {
          // If date is invalid, use original datetime
          datetime = originalReservation.datetime;
        }
      } else {
        datetime = originalReservation.datetime;
      }

      // Map service and staff IDs using mapping objects
      const serviceId =
        serviceIdMapping[reservationData.service] ||
        originalReservation.serviceId;
      const staffId =
        staffIdMapping[reservationData.staff] || originalReservation.staffId;

      const updatedReservation: Reservation = {
        id: reservationData.id,
        customerName:
          reservationData.customerName || originalReservation.customerName,
        customerPhone:
          reservationData.customerPhone || originalReservation.customerPhone,
        staffId: staffId,
        serviceId: serviceId,
        datetime: datetime,
        status: originalReservation.status, // Keep original status
      };

      setReservations(prev =>
        prev.map(r =>
          r.id === updatedReservation.id ? updatedReservation : r,
        ),
      );
      setEditModalOpen(false);
      setToast({
        message: t('reservations.toast.updated'),
        type: 'success',
      });
    } catch (error: any) {
      console.error('Error saving reservation:', error);
      setToast({
        message: `Error: ${error.message}`,
        type: 'error',
      });
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
              onEdit={handleEditClick}
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

      {/* Edit Reservation Modal */}
      {editModalOpen && reservationIdToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCancelEdit}
          />

          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">

              <button
                onClick={handleCancelEdit}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Pass the selectedReservation as initialReservation */}
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
