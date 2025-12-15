import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import SearchIcon from '@/icons/searchIcon';

type Props = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  timeFrom: string;
  setTimeFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  timeTo: string;
  setTimeTo: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: any) => void;
};

export default function ReservationFilters({
  searchTerm,
  setSearchTerm,
  dateFrom,
  setDateFrom,
  timeFrom,
  setTimeFrom,
  dateTo,
  setDateTo,
  timeTo,
  setTimeTo,
  statusFilter,
  setStatusFilter,
}: Props) {
  const { t } = useTranslation();
  const lang = i18n.language;

  const formatDisplayTime = (time24: string): string => {
    if (!time24) return '';
    if (lang === 'en') {
      let hour = parseInt(time24.split(':')[0]);
      const minute = time24.split(':')[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
    }

    return time24;
  };

  const parseDisplayTime = (displayValue: string): string => {
    if (!displayValue) return '';

    if (lang === 'en') {
      const match = displayValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        let hour = parseInt(match[1], 10);
        const minute = match[2];
        const ampm = match[3].toUpperCase();
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, '0')}:${minute}`;
      }
    }

    return displayValue;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            'all',
            'pending',
            'completed',
            'cancelled',
            'no_show',
            'refund_pending',
          ] as const
        ).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {t(`reservations.filters.${status}`)}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={t('reservations.filters.searchPlaceholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 pr-10 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        <SearchIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold hover:bg-gray-300"
            aria-label={t('common.clear')}
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-600">
            {t('reservations.filters.from')}:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="time"
            value={formatDisplayTime(timeFrom)}
            onChange={e => setTimeFrom(parseDisplayTime(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-600">
            {t('reservations.filters.to')}:
          </span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <input
            type="time"
            value={formatDisplayTime(timeTo)}
            onChange={e => setTimeTo(parseDisplayTime(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {(dateFrom || dateTo || timeFrom || timeTo) && (
          <button
            onClick={() => {
              setDateFrom('');
              setTimeFrom('');
              setDateTo('');
              setTimeTo('');
            }}
            className="p-2 text-sm font-medium text-red-600"
          >
            {t('common.clear')}
          </button>
        )}
      </div>
    </div>
  );
}
