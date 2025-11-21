import { useState } from 'react';
import Topbar from '../components/topbar';
import SidebarStockClerk from '../components/sidebarStockClerk';

interface TransferRequest {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  fromBranch: string;
  toBranch: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED';
  requestedBy: string;
  date: string;
}

export default function TransferRequestsPage() {
  const [transfers] = useState<TransferRequest[]>([
    {
      id: 'TR-001',
      productName: 'Coffee Beans',
      quantity: 10,
      unit: 'kg',
      fromBranch: 'Westside Branch',
      toBranch: 'Downtown Branch',
      status: 'PENDING',
      requestedBy: 'You',
      date: 'Today, 10:30 AM',
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
      date: 'Today, 09:15 AM',
    },
    {
      id: 'TR-003',
      productName: 'Paper Cups',
      quantity: 200,
      unit: 'pcs',
      fromBranch: 'North Branch',
      toBranch: 'Downtown Branch',
      status: 'COMPLETED',
      requestedBy: 'You',
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
      date: 'Today, 08:45 AM',
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED'>('ALL');

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

  return (
    <div className="flex h-screen w-full">
      <SidebarStockClerk />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Transfer Requests</h1>
              <p className="text-gray-600">Manage inter-branch stock transfers</p>
            </div>
            <button
              onClick={handleNewTransfer}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 active:scale-95"
            >
              New Transfer Request
            </button>
          </div>

          {/* Filter Tabs */} {/*TODO: Make filtration combinable */}
          <div className="mb-6 flex gap-2 rounded-lg bg-white p-4 shadow-sm">
            {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg px-4 py-2 font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All Requests' : status}
              </button>
            ))}
          </div>

          {/* Transfer Requests List */} {/*TODO: Make filtration combinable */}
          <div className="space-y-4">
            {filteredTransfers.map(transfer => (
              <div
                key={transfer.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {transfer.productName}
                    </h3>
                    <p className="text-sm text-gray-600">Request ID: {transfer.id}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(transfer.status)}`}
                  >
                    {transfer.status}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600">FROM</p>
                    <p className="mt-1 text-sm text-gray-900">{transfer.fromBranch}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">TO</p>
                    <p className="mt-1 text-sm text-gray-900">{transfer.toBranch}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">QUANTITY</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {transfer.quantity} {transfer.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">REQUESTED BY</p>
                    <p className="mt-1 text-sm text-gray-900">{transfer.requestedBy}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">{transfer.date}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredTransfers.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No transfer requests found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
