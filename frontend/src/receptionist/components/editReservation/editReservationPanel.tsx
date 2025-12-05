import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Reservation, Service, Staff, EditReservationPanelProps } from './types';

import { CustomerInfoSection } from './customerInfoSection';
import { ServiceSection } from './serviceSection';
import { StaffSection } from './staffSection';
import { DateTimeSection } from './dateTimeSection';
import { PriceSummarySection } from './priceSummarySection';
import { ActionButtons } from './actionButtons';

export function EditReservationPanel({
  reservationId,
  services = [],
  staffMembers = [],
  initialReservation,
  onSave,
  onCancel,
}: EditReservationPanelProps) {
  const { t } = useTranslation();

  // Use provided services/staff or defaults with Lithuanian translations
  const displayServices = services.length > 0 ? services : getDefaultServices(t);
  const displayStaff = staffMembers.length > 0 ? staffMembers : getDefaultStaff(t);

  const getDefaultReservation = (): Reservation => ({
    id: reservationId || '',
    service: '',
    staff: '',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    duration: 60,
    customerName: '',
    customerPhone: '',
    status: 'pending',
    notes: '',
    price: 0,
  });

  const [reservation, setReservation] = useState<Reservation>(getDefaultReservation());

  // Initialize with passed data
  useEffect(() => {
    if (initialReservation) {
      console.log('Setting initial reservation:', initialReservation);
      setReservation(initialReservation);
    }
  }, [initialReservation]);

  const handleSave = () => {
    if (onSave) {
      onSave(reservation);
    }
  };

  const updateReservation = (updates: Partial<Reservation>) => {
    setReservation(prev => {
      const updated = { ...prev, ...updates };
      
      // Auto-update duration and price when service changes
      if (updates.service !== undefined) {
        const selectedService = displayServices.find(s => s.id === updates.service);
        if (selectedService) {
          updated.duration = selectedService.duration;
          updated.price = selectedService.price;
        }
      }
      
      return updated;
    });
  };
const getAvailableTimes = (): string[] => {
  const times: string[] = [];
  for (let hour = 9; hour <= 19; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return times;
};

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('editReservation.title', 'Redaguoti rezervaciją')} #{reservation.id}
            </h2>
          </div>
          <div className={`rounded-lg px-4 py-2 ${
            reservation.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : reservation.status === 'pending' 
              ? 'bg-yellow-100 text-yellow-800'
              : reservation.status === 'refund_pending'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-red-100 text-red-800'
          }`}>
            <span className="text-sm font-medium capitalize">
              {t(`reservation.status.${reservation.status}`, reservation.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <CustomerInfoSection
        reservation={reservation}
        handleChange={(field, value) => {
          if (field === 'customerName' || field === 'customerPhone') {
            updateReservation({ [field]: value });
          }
        }}
      />

      {/* Service Selection */}
      <ServiceSection
        services={displayServices}
        reservation={reservation}
        handleChange={(field, value) => {
          if (field === 'service') {
            updateReservation({ service: value });
          }
        }}
      />

      {/* Staff Selection */}
      <StaffSection
        staffMembers={displayStaff}
        reservation={reservation}
        handleChange={(field, value) => {
          if (field === 'staff') {
            updateReservation({ staff: value });
          }
        }}
      />

      {/* Date & Time */}
      <DateTimeSection
        reservation={reservation}
        handleChange={(field, value) => {
          if (field === 'date') updateReservation({ date: value });
          if (field === 'time') updateReservation({ time: value });
        }}
        availableTimes={getAvailableTimes()}
      />

      {/* Price Summary */}
      <PriceSummarySection reservation={reservation} />

      {/* Action Buttons */}
      <ActionButtons
        onCancel={onCancel}
        onSave={handleSave}
      />
    </div>
  );
}

// Helper functions for default data with Lithuanian translations
function getDefaultServices(t: any): Service[] {
  return [
    {
      id: 'haircut',
      name: t('reservations.services.1', 'Kirpimas ir šukavimas'),
      nameKey: 'haircut',
      duration: 60,
      price: 65,
    },
    {
      id: 'color',
      name: t('reservations.services.2', 'Plaukų dažymas'),
      nameKey: 'color',
      duration: 120,
      price: 120,
    },
    {
      id: 'manicure',
      name: t('reservations.services.3', 'Manikiūras'),
      nameKey: 'manicure',
      duration: 45,
      price: 35,
    },
    {
      id: 'pedicure',
      name: t('reservations.services.4', 'Pedikiūras'),
      nameKey: 'pedicure',
      duration: 60,
      price: 50,
    },
  ];
}

function getDefaultStaff(t: any): Staff[] {
  return [
    {
      id: 'james',
      name: t('reservations.staff.james', 'Jonas Petraitis'),
      nameKey: 'james',
      role: t('reservation.staff.Stylist', 'Kirpėjas'),
      services: ['haircut', 'color'],
    },
    {
      id: 'sarah',
      name: t('reservations.staff.sarah', 'Ona Jonaitienė'),
      nameKey: 'sarah',
      role: t('reservation.staff.Colorist', 'Dažytoja'),
      services: ['color'],
    },
    {
      id: 'anyone',
      name: t('reservations.staff.anyone', 'Bet kuris darbuotojas'),
      nameKey: 'anyone',
      role: t('reservation.staff.Anyone', 'Bet kas'),
      services: ['haircut', 'color', 'manicure', 'pedicure'],
    },
  ];
}