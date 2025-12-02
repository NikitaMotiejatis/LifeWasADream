import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Topbar from '@/global/components/topbar';
import SidebarStockClerk from '@/stock/components/sidebarStockClerk';

type TransferRequest = {
  id: string;
  productName: 'Coffee Beans' | 'Milk' | 'Paper Cups' | 'Sugar';
  quantity: number;
  unit: 'kg' | 'liters' | 'pcs';
  fromBranch: string;
  toBranch: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
  requestedBy: string;
  date: string;
  time?: string;
};

export default function TransferRequestsPage() {
  const { t } = useTranslation();

  const [transfers] = useState<TransferRequest[]>([
    {
      id: 'TR-001',
      productName: 'Coffee Beans',
      quantity: 10,
      unit: 'kg',
      fromBranch: 'Westside Branch',
      toBranch: 'Downtown Branch',
      status: 'PENDING',
      requestedBy: 'James B.',
      date: 'Today',
      time: '10:30',
    },
    {
      id: 'TR-002',
      productName: 'Milk',
      quantity: 15,
      unit: 'liters',
      fromBranch: 'Downtown Branch',
      toBranch: 'Eastside Branch',
      status: 'APPROVED',
      requestedBy: 'Sarah K.',
      date: 'Today',
      time: '09:15',
    },
    {
      id: 'TR-003',
      productName: 'Paper Cups',
      quantity: 200,
      unit: 'pcs',
      fromBranch: 'North Branch',
      toBranch: 'Downtown Branch',
      status: 'COMPLETED',
      requestedBy: 'James B.',
      date: 'Yesterday',
    },
    {
      id: 'TR-004',
      productName: 'Sugar',
      quantity: 25,
      unit: 'kg',
      fromBranch: 'Downtown Branch',
      toBranch: 'Westside Branch',
      status: 'PENDING',
      requestedBy: 'Mike J.',
      date: 'Today',
      time: '08:45',
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED'
  >('ALL');

  const filteredTransfers = transfers.filter(t =>
    selectedStatus === 'ALL' ? true : t.status === selectedStatus,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleNewTransfer = () => {
    console.log('Create new transfer request');
    // TODO: Implement new transfer modal/form
  };

  const tUnit = (unit: string, count: number) => {
    return t(`transferRequests.units.${unit}`, { count });
  };

  const formatDate = (date: string, time?: string) => {
    if (date === 'Today' && time) {
      return t('transferRequests.date.today', { time });
    }
    if (date === 'Yesterday') {
      return t('transferRequests.date.yesterday');
    }
    return date;
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarStockClerk />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {t('transferRequests.pageTitle')}
              </h1>
              <p className="text-gray-600">
                {t('transferRequests.pageSubtitle')}
              </p>
            </div>
            <button
              onClick={handleNewTransfer}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 active:scale-95"
            >
              {t('transferRequests.newButton')}
            </button>
          </div>
          {/* Filter Tabs */} {/*TODO: Make filtration combinable */}
          <div className="mb-6 flex flex-wrap gap-2 rounded-lg bg-white p-4 shadow-sm">
            {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED'] as const).map(
              status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-lg px-4 py-2 font-medium transition-all ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`transferRequests.filters.${status}`)}
                </button>
              ),
            )}
          </div>
          {/* Transfer Requests List */}
          {/*TODO: Make filtration combinable */}
          <div className="space-y-4">
            {filteredTransfers.map(transfer => (
              <div
                key={transfer.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t(`transferRequests.products.${transfer.productName}`)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('transferRequests.labels.requestId')}: {transfer.id}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(transfer.status)}`}
                  >
                    {t(`transferRequests.status.${transfer.status}`)}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.from')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {t(`transferRequests.branches.${transfer.fromBranch}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.to')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {t(`transferRequests.branches.${transfer.toBranch}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.quantity')}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {tUnit(transfer.unit, transfer.quantity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">
                      {t('transferRequests.labels.requestedBy')}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {transfer.requestedBy}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">
                    {formatDate(transfer.date, transfer.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {filteredTransfers.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">
                {t('transferRequests.noRequests')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
