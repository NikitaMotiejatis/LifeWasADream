import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import DropdownSelector from '@/global/components/dropdownSelector';

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
  const [timeStr, setTimeStr] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<Date>(datetime);

  useEffect(() => {
    const hours = String(datetime.getHours()).padStart(2, '0');
    const minutes = String(datetime.getMinutes()).padStart(2, '0');
    setTimeStr(`${hours}:${minutes}`);
  }, [datetime]);

  const handleTimeChange = (newTimeStr: string) => {
    setTimeStr(newTimeStr);
    const [hours, minutes] = newTimeStr.split(':').map(Number);
    const newDate = new Date(
      datetime.getFullYear(),
      datetime.getMonth(),
      datetime.getDate(),
      hours,
      minutes
    );
    onDateTimeChange(newDate);
  };

  // Calendar logic from New Reservations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOriginal = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Language-specific calendar adjustments
  const isLT = i18n.language.startsWith('lt');
  let weekdayKeys: string[] = isLT
    ? ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
    : ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

  let firstDay = firstDayOriginal;
  if (isLT) firstDay = (firstDay + 6) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handleDateClick = (day: number) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(year, month, day, hours, minutes);
    onDateTimeChange(newDate);
  };

  const timeOptions = availableTimes.map(time => ({
    value: time,
    label: time,
  }));

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">
        {t('reservation.dateTime')}
      </h3>
      
      {/* Two-column layout: Calendar on left, Time on right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar - Left side */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="rounded p-2 hover:bg-gray-100"
              aria-label={t('common.previousMonth')}
            >
              ←
            </button>
            <span className="font-semibold text-sm md:text-base">
              {t(`reservation.months.${month}`)} {year}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="rounded p-2 hover:bg-gray-100"
              aria-label={t('common.nextMonth')}
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-600">
            {weekdayKeys.map(key => (
              <div key={key} className="text-xs">{t(`reservation.weekdays.${key}`)}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
            {days.map((day, index) => {
              const isSelected = day !== null && 
                datetime.getDate() === day &&
                datetime.getMonth() === month &&
                datetime.getFullYear() === year;
              
              const isToday = day !== null && 
                new Date().getDate() === day && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;
              
              const isPast = day !== null && 
                new Date(year, month, day) < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={index}
                  disabled={!day || isPast}
                  onClick={() => day && handleDateClick(day)}
                  className={`h-8 w-8 text-xs rounded-lg transition ${
                    day
                      ? isSelected
                        ? 'bg-blue-600 text-white'
                        : isToday
                        ? 'border border-blue-300 hover:bg-blue-50'
                        : 'hover:bg-gray-100'
                      : ''
                  } ${isPast ? 'text-gray-400 cursor-not-allowed' : ''}`}
                >
                  {day || ''}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4"> {/* Changed from justify-center to gap-4 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('reservation.time')}
            </label>
            <DropdownSelector
              options={timeOptions}
              selected={timeStr}
              onChange={handleTimeChange}
              buttonClassName="w-full px-3 py-2"
              menuClassName="w-full max-h-32 overflow-y-auto"
            />
          </div>

          {/* Selected date/time summary */}
          <div className="mt-auto rounded-lg bg-gray-50 p-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('reservation.date')}:</span>
                <span className="font-medium">
                  {datetime.toLocaleDateString(i18n.language, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('reservation.time')}:</span>
                <span className="font-medium">{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}