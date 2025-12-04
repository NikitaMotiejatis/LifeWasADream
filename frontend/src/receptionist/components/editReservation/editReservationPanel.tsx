import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type EditReservationPanelProps = {
  mode: 'edit';
  reservationId: string;
  onSave?: (reservation: any) => void;
  onCancel?: () => void;
};

// Mock services data
const services = [
  { id: 'haircut', name: 'Haircut & Style', duration: 60, price: 35 },
  { id: 'color', name: 'Hair Color', duration: 120, price: 80 },
  { id: 'manicure', name: 'Manicure', duration: 45, price: 25 },
  { id: 'pedicure', name: 'Pedicure', duration: 60, price: 35 },
];

// Mock staff data
const staffMembers = [
  { id: 'james', name: 'James Chen', role: 'Stylist' },
  { id: 'sarah', name: 'Sarah Johnson', role: 'Colorist' },
  { id: 'anyone', name: 'Any Staff', role: 'Anyone' },
];

export function EditReservationPanel({
  reservationId,
  onSave,
  onCancel,
}: EditReservationPanelProps) {
  const { t } = useTranslation();
  
  // Mock reservation data
  const [reservation, setReservation] = useState({
    id: reservationId,
    service: 'haircut',
    staff: 'james',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    time: '14:30',
    duration: 60,
    customerName: 'John Doe',
    customerPhone: '+37060000000',
    status: 'confirmed',
    notes: 'Customer prefers side part',
    price: 35,
  });

  const handleSave = () => {
    onSave?.(reservation);
  };

  const handleChange = (field: string, value: any) => {
    setReservation(prev => ({ ...prev, [field]: value }));
    
    // Update duration and price when service changes
    if (field === 'service') {
      const selectedService = services.find(s => s.id === value);
      if (selectedService) {
        setReservation(prev => ({
          ...prev,
          service: value,
          duration: selectedService.duration,
          price: selectedService.price,
        }));
      }
    }
  };

  const selectedService = services.find(s => s.id === reservation.service);
  const selectedStaff = staffMembers.find(s => s.id === reservation.staff);

  return (
    <div className="flex-1 flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-xl">


      {/* Reservation Details */}
      <div className="space-y-6">
        {/* Customer Information */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-lg font-semibold">
            {t('reservation.customerInfo', 'Customer Information')}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('reservation.customerName', 'Customer Name')}
              </label>
              <input
                type="text"
                value={reservation.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder={t('reservation.customerNamePlaceholder', 'Customer name')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('reservation.customerPhone', 'Phone Number')}
              </label>
              <input
                type="tel"
                value={reservation.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder={t('reservation.customerPhonePlaceholder', 'Phone number')}
              />
            </div>
          </div>
        </div>
        {/* Service Details */}
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
            {t('reservation.service', 'Service')}
          </h3>
          <div className="space-y-2">
            {services.map(service => (
              <div
                key={service.id}
                onClick={() => handleChange('service', service.id)}
                className={`flex cursor-pointer justify-between rounded-lg border p-4 transition ${
                  reservation.service === service.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="font-medium">
                    {t(`reservation.services.${service.name}`, service.name)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {service.duration} min
                  </div>
                </div>
                <div className="font-semibold text-blue-600">
                  ${service.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Details */}
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
            {t('reservation.staffMember', 'Staff Member')}
          </h3>
          <div className="space-y-2">
            {staffMembers.map(staff => (
              <div
                key={staff.id}
                onClick={() => handleChange('staff', staff.id)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                  reservation.staff === staff.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="font-medium">
                    {t(`reservation.staff.${staff.name}`, staff.name)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {staff.role}
                  </div>
                </div>
                {reservation.staff === staff.id && (
                  <span className="text-xl text-blue-600">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
            {t('reservation.dateTime', 'Date & Time')}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reservation.date', 'Date')}
              </label>
              <input
                type="date"
                value={reservation.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('reservation.time', 'Time')}
              </label>
              <input
                type="time"
                value={reservation.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Duration:
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {reservation.duration} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-lg font-semibold">
            {t('reservation.bookingSummary', 'Reservation Summary')}
          </h3>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('reservation.total', 'Total')}</span>
            <span className="text-xl font-bold">${reservation.price || 0}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-3 border-t border-gray-300 pt-6">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50"
        >
          {t('common.cancel', 'Cancel')}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          {t('editReservation.saveChanges', 'Save Changes')}
        </button>
      </div>
    </div>
  );
}