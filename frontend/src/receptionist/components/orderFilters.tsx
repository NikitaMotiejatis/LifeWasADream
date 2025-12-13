import { useTranslation } from 'react-i18next';
import SearchIcon from '@/icons/searchIcon';
import { Counts, OrderFilter } from './orderList';

type Props = {
  orderFilter: OrderFilter;
  setOrderFilter: (v: OrderFilter) => void;
  counts?: Counts;
};

export default function OrderFilters({
  orderFilter,
  setOrderFilter,
  counts,
}: Props) {
  const { t } = useTranslation();

  const countString = (count?: number) => (count != undefined) ? ` (${count})` : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'open', 'closed', 'refund_pending', 'refunded'] as const).map(status => (
          <button
            key={status}
            onClick={() => setOrderFilter({ ...orderFilter, orderStatus: status })}
            className={`rounded-lg px-4 py-2 text-xs font-medium whitespace-nowrap transition ${
              orderFilter.orderStatus === status
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-gray-400 hover:bg-gray-100'
            }`}
          >
            {status === 'all'             && (t('orders.filters.all')             + countString(counts?.all))}
            {status === 'open'            && (t('orders.filters.open')            + countString(counts?.open))}
            {status === 'closed'          && (t('orders.filters.closed')          + countString(counts?.closed))}
            {status === 'refund_pending'  && (t('orders.filters.refund_pending')  + countString(counts?.refund_pending))}
            {status === 'refunded'        && (t('orders.filters.refunded')        + countString(counts?.refunded))}
          </button>
        ))}
      </div>

      <div className="relative flex-1">
        <input
          type="text"
          placeholder={t('orders.filters.searchPlaceholder')}
          value={orderFilter.searchTerm ?? ''}
          onChange={e => setOrderFilter({ ...orderFilter, searchTerm: e.target.value })}
          className="w-full rounded-lg border border-gray-300 py-2 pr-10 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        {orderFilter.searchTerm && (
          <button
            onClick={() => setOrderFilter({ ...orderFilter, searchTerm: undefined })}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold hover:bg-gray-300"
            aria-label={t('common.clear')}
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 pr-4">
          <div className="flex items-center gap-2">
            <span className="min-w-8 font-semibold whitespace-nowrap text-gray-600">
              {t('orders.filters.from')}:
            </span>
            <input
              type="date"
              value={orderFilter.from ?? ''}
              onChange={e => setOrderFilter({ ...orderFilter, from: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              aria-label={t('orders.filters.fromDate')}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="min-w-8 font-semibold whitespace-nowrap text-gray-600">
              {t('orders.filters.to')}:
            </span>
            <input
              type="date"
              value={orderFilter.to ?? ''}
              onChange={e => setOrderFilter({ ...orderFilter, to: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              aria-label={t('orders.filters.toDate')}
            />
            {(orderFilter.from || orderFilter.to) && (
              <button
                onClick={() => setOrderFilter({ ...orderFilter, from: undefined, to: undefined })}
                className="p-2 text-sm font-medium text-red-600"
                aria-label={t('common.clear')}
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
