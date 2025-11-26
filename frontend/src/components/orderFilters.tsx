import SearchIcon from './icons/searchIcon';

interface Props {
  filterStatus: string;
  setFilterStatus: (v: any) => void;
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
  counts: { all: number; open: number; closed: number; pending: number };
}

export default function OrderFilters({
  filterStatus,
  setFilterStatus,
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
  counts,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'open', 'closed', 'pending'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-4 py-2 text-xs font-medium whitespace-nowrap transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-gray-400 hover:bg-gray-100'
            }`}
          >
            {status === 'all' && `All (${counts.all})`}
            {status === 'open' && `Open (${counts.open})`}
            {status === 'closed' && `Closed (${counts.closed})`}
            {status === 'pending' && `Refund Pending (${counts.pending})`}
          </button>
        ))}
      </div>

      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search by #..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pr-10 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold hover:bg-gray-300"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 pr-4">
          <div className="flex items-center gap-2">
            <span className="min-w-8 font-semibold whitespace-nowrap text-gray-600">
              From:
            </span>

            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />

            <input
              type="time"
              value={timeFrom}
              onChange={e => setTimeFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="min-w-8 font-semibold whitespace-nowrap text-gray-600">
              To:
            </span>

            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />

            <input
              type="time"
              value={timeTo}
              onChange={e => setTimeTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />

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
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
