import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  Reservation,
  Service,
  Staff,
  EditReservationPanelProps,
} from './types';

import { CustomerInfoSection } from './customerInfoSection';
import { ServiceSection } from './serviceSection';
import { StaffSection } from './staffSection';
import { DateTimeSection } from './dateTimeSection';
import { PriceSummarySection } from './priceSummarySection';
import { ActionButtons } from './actionButtons';
import { formatPhone } from '@/utils/useInputValidation';
import {
  getDefaultServices,
  getDefaultStaff,
  DEFAULT_AVAILABLE_TIMES,
} from '@/utils/reservationMappings';

export function EditReservationPanel({
  reservationId,
  services = [],
  staffMembers = [],
  initialReservation,
  onSave,
  onCancel,
}: EditReservationPanelProps) {
  const { t } = useTranslation();

  const displayServices =
    services.length > 0 ? services : getDefaultServices(t);
  const displayStaff =
    staffMembers.length > 0 ? staffMembers : getDefaultStaff(t);

  const [reservation, setReservation] = useState<Reservation>(() => {
    if (initialReservation) {
      const datetime = new Date(initialReservation.datetime);

      return {
        ...initialReservation,
        datetime: isNaN(datetime.getTime()) ? new Date() : datetime,
      };
    }

    return {
      id: reservationId || '',
      service: '',
      staff: '',
      datetime: new Date(),
      duration: 60,
      customerName: '',
      customerPhone: '',
      status: 'pending',
      notes: '',
      price: 0,
    };
  });

  const [validationErrors, setValidationErrors] = useState<{
    customerName?: string;
    customerPhone?: string;
  }>({});

  useEffect(() => {
    if (initialReservation && initialReservation.id !== reservation.id) {
      console.log('Updating with new initial reservation:', initialReservation);
      setReservation(initialReservation);
    }
  }, [initialReservation, reservation.id]);

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return false;

    const formattedPhone = formatPhone(phone);

    if (formattedPhone !== phone) {
      return false;
    }

    if (!phone.startsWith('+') && !/^\d/.test(phone)) {
      return false;
    }

    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  const validateForm = (): boolean => {
    const errors: { customerName?: string; customerPhone?: string } = {};

    if (!reservation.customerName?.trim()) {
      errors.customerName = t('reservation.nameRequired');
    }

    if (!reservation.customerPhone?.trim()) {
      errors.customerPhone = t('reservation.phoneRequired');
    } else if (!validatePhoneNumber(reservation.customerPhone)) {
      errors.customerPhone = t('reservation.invalidPhone');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    if (onSave) {
      onSave(reservation);
    }
  };

  const updateReservation = (updates: Partial<Reservation>) => {
    setReservation(prev => {
      const updated = { ...prev, ...updates };

      if (updates.service !== undefined) {
        const selectedService = displayServices.find(
          s => s.id === updates.service,
        );
        if (selectedService) {
          updated.duration = selectedService.duration;
          updated.price = selectedService.price;
        }
      }

      return updated;
    });
  };

  const handleDateTimeChange = (newDateTime: Date) => {
    updateReservation({ datetime: newDateTime });
  };

  return (
    <div className="space-y-2 p-6">
      {/* Header */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('editReservation.title')} #{reservation.id}
            </h2>
          </div>
          <div
            className={`rounded-lg px-4 py-2 ${
              reservation.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : reservation.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : reservation.status === 'refund_pending'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-red-100 text-red-800'
            }`}
          >
            <span className="text-sm font-medium capitalize">
              {t(`reservation.status.${reservation.status}`)}
            </span>
          </div>
        </div>
      </div>

      {/* Validation summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4">
          <h4 className="mb-2 font-medium text-red-800">
            {t('reservation.validationErrors')}
          </h4>
          <ul className="list-disc pl-5 text-sm text-red-700">
            {validationErrors.customerName && (
              <li>{validationErrors.customerName}</li>
            )}
            {validationErrors.customerPhone && (
              <li>{validationErrors.customerPhone}</li>
            )}
          </ul>
        </div>
      )}

      {/* Customer Information */}
      <CustomerInfoSection
        reservation={reservation}
        handleChange={(field, value) => {
          updateReservation({ [field]: value });
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
        datetime={reservation.datetime}
        onDateTimeChange={handleDateTimeChange}
        availableTimes={DEFAULT_AVAILABLE_TIMES} 
      />

      {/* Price Summary */}
      <PriceSummarySection reservation={reservation} />

      {/* Action Buttons */}
      <ActionButtons onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
