import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DateTimeSectionProps {
  datetime: Date; 
  onDateTimeChange: (newDateTime: Date) => void;
  availableTimes: string[];
}

export function DateTimeSection({
  datetime,
  onDateTimeChange,
  availableTimes,
}: DateTimeSectionProps) {
  const { t } = useTranslation();

  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const year = datetime.getFullYear();
    const month = String(datetime.getMonth() + 1).padStart(2, '0');
    const day = String(datetime.getDate()).padStart(2, '0');
    setDateStr(`${year}-${month}-${day}`);
    
    const hours = String(datetime.getHours()).padStart(2, '0');
    const minutes = String(datetime.getMinutes()).padStart(2, '0');
    setTimeStr(`${hours}:${minutes}`);
  }, [datetime]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateStr = e.target.value;
    setDateStr(newDateStr);
    
    const [year, month, day] = newDateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    onDateTimeChange(newDateTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeStr = e.target.value;
    setTimeStr(newTimeStr);
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = newTimeStr.split(':').map(Number);
    const newDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    onDateTimeChange(newDateTime);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">
        {t('reservation.dateTime', 'Date & Time')}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.date', 'Date')}
          </label>
          <input
            type="date"
            value={dateStr}
            onChange={handleDateChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.time', 'Time')}
          </label>
          <select
            value={timeStr}
            onChange={handleTimeChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}