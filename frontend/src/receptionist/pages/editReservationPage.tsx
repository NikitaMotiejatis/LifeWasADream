import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SidebarCashier from '@/receptionist/components/sidebarCashier';
import Topbar from '@/global/components/topbar';
import { EditReservationPanel } from '@/receptionist/components/editReservation/editReservationPanel';
import { type Reservation } from '@/receptionist/components/editReservation/types'; 

function EditReservationContent() {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [reservationData, setReservationData] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        console.warn('API endpoint not implemented. Using mock data.');
        
        // Mock data
        setReservationData({
          id: reservationId || '',
          service: 'Haircut & Style',
          staff: 'James Chen',
          date: new Date('2025-11-28'),
          time: '14:30',
          duration: 60,
          customerName: 'John Doe',
          customerPhone: '+37060000000',
          status: 'confirmed',
          notes: 'Customer prefers side part styling'
        });
      } catch (error) {
        console.error('Failed to fetch reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      fetchReservation();
    }
  }, [reservationId]);

  const handleSave = async (reservation: Reservation) => {
    try {
      // TODO: Replace with actual API call
      console.log('Saving reservation changes...', reservation);
      
      navigate('/reservations');
    } catch (error) {
      console.error('Failed to save reservation:', error);
    }
  };

  const handleCancel = () => {
    navigate('/reservations');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading reservation #{reservationId}...</p>
        </div>
      </div>
    );
  }

  if (!reservationData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-500">Reservation #{reservationId} not found</p>
          <button
            onClick={() => navigate('/reservations')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Reservation #{reservationData.id}</h1>
            <p className="text-sm text-gray-600">
              {reservationData.customerName} • {reservationData.service} • {reservationData.date.toLocaleString()} {reservationData.time}
            </p>
          </div>
          <div className="ml-auto rounded-lg bg-gray-100 px-3 py-1">
            <span className="text-sm font-medium text-gray-700">
              Status: {reservationData.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <EditReservationPanel
            mode="edit"
            reservationId={reservationData.id}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </main>
  );
}

export default function EditReservationPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 hidden w-64 md:block">
        <SidebarCashier />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Topbar */}
        <Topbar />
        
        {/* Content Area */}
        <EditReservationContent />
      </div>
    </div>
  );
}