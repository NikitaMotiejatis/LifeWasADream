import { useTranslation } from 'react-i18next';
import type { Reservation } from './types';
import { TimePickerDropdown } from './timePickerDropdown';

interface DateTimeSectionProps {
  reservation: Reservation;
  handleChange: (field: keyof Reservation, value: any) => void;
  availableTimes?: string[];
}

export function DateTimeSection({ 
  reservation, 
  handleChange,
  availableTimes 
}: DateTimeSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h3 className="mb-3 text-sm font-medium text-gray-600 uppercase">
        {t('reservation.dateTime', 'Data ir laikas')}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('reservation.date', 'Data')}
          </label>
          <input
            type="date"
            value={typeof reservation.date === 'string' 
              ? reservation.date 
              : new Date(reservation.date).toISOString().split('T')[0]}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('reservation.time', 'Laikas')}
          </label>
          
          <TimePickerDropdown
            value={reservation.time}
            onChange={(time) => handleChange('time', time)}
            availableHours={availableTimes}
          />
          
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {t('reservation.duration', 'Trukmė')}:
            </span>
            <span className="text-sm font-medium text-gray-700">
              {reservation.duration} {t('reservation.durations.min', 'min')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}