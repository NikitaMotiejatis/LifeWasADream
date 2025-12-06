import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Topbar from '@/global/components/topbar';
import SidebarSupplier from '@/supplier/components/sidebarSupplier';

type DeliveryItem = {
  productKey: string;
  quantity: number;
  unit: 'kg' | 'liters' | 'pcs' | 'bottles';
};

type Delivery = {
  id: string;
  orderId: string;
  destination: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED';
  deliveryDate: string;
  items: DeliveryItem[];
  note?: string;
  receivedBy?: string;
  receivedTime?: string;
};

export default function DeliveriesPage() {
  const { t } = useTranslation();

  const tp = (key: string) =>
    t(`deliveries.products.${key}`, { defaultValue: key });
  const tu = (unit: string) =>
    t(`deliveries.units.${unit}`, { defaultValue: unit });
  const ts = (status: string) => t(`deliveries.statuses.${status}`);

  const [deliveries] = useState<Delivery[]>([
    {
      id: 'DEL-001',
      orderId: 'PO-4535',
      destination: 'Downtown Branch',
      status: 'DELIVERED',
      deliveryDate: '2025-10-20',
      items: [
        { productKey: 'Coffee Beans (Arabica)', quantity: 60, unit: 'kg' },
        { productKey: 'Milk (Whole)', quantity: 50, unit: 'liters' },
        { productKey: 'Syrups (Assorted)', quantity: 24, unit: 'bottles' },
      ],
      note: 'Delivered at 09:30 AM, received by John Davis',
      receivedBy: 'John Davis',
      receivedTime: '09:30 AM',
    },
    {
      id: 'DEL-002',
      orderId: 'PO-4536',
      destination: 'Westside Branch',
      status: 'SCHEDULED',
      deliveryDate: '2025-10-21',
      items: [
        { productKey: 'Sugar', quantity: 100, unit: 'kg' },
        { productKey: 'Paper Cups (12oz)', quantity: 1000, unit: 'pcs' },
      ],
    },
    {
      id: 'DEL-003',
      orderId: 'PO-4537',
      destination: 'North Branch',
      status: 'IN_TRANSIT',
      deliveryDate: '2025-10-20',
      items: [
        { productKey: 'Croissants', quantity: 200, unit: 'pcs' },
        { productKey: 'Milk (Whole)', quantity: 30, unit: 'liters' },
      ],
      note: 'Expected arrival: 2:00 PM',
    },
    {
      id: 'DEL-004',
      orderId: 'PO-4538',
      destination: 'Downtown Branch',
      status: 'DELIVERED',
      deliveryDate: '2025-10-19',
      items: [
        { productKey: 'Coffee Beans (Arabica)', quantity: 40, unit: 'kg' },
        { productKey: 'Paper Napkins', quantity: 500, unit: 'pcs' },
      ],
      note: 'Delivered at 10:15 AM, received by Sarah Kim',
      receivedBy: 'Sarah Kim',
      receivedTime: '10:15 AM',
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED'
  >('ALL');

  const scheduledCount = deliveries.filter(
    d => d.status === 'SCHEDULED',
  ).length;
  const inTransitCount = deliveries.filter(
    d => d.status === 'IN_TRANSIT',
  ).length;
  const deliveredCount = deliveries.filter(
    d => d.status === 'DELIVERED',
  ).length;

  const filteredDeliveries = deliveries.filter(d =>
    selectedStatus === 'ALL' ? true : d.status === selectedStatus,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          text: 'text-blue-600',
        };
      case 'IN_TRANSIT':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          text: 'text-yellow-600',
        };
      case 'DELIVERED':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800 border-green-300',
          text: 'text-green-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
          text: 'text-gray-600',
        };
    }
  };

  const handleConfirmReceipt = (id: string) => {
    console.log(`Confirm receipt for delivery ${id}`);
    // TODO: Implement confirm receipt functionality
  };

  const handleViewDetails = (id: string) => {
    console.log(`View details for delivery ${id}`);
    // TODO: Implement view details functionality
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarSupplier />
      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {t('deliveries.pageTitle')}
            </h1>
            <p className="text-gray-600">{t('deliveries.pageSubtitle')}</p>
          </div>
          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-600">
                {t('deliveries.summary.total')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {deliveries.length}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {t('deliveries.summary.totalThisWeek')}
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-600">
                {t('deliveries.summary.scheduled')}
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-900">
                {scheduledCount}
              </p>
              <p className="mt-1 text-sm text-blue-700">
                {t('deliveries.summary.scheduledDesc')}
              </p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-yellow-600">
                {t('deliveries.summary.inTransit')}
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-900">
                {inTransitCount}
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                {t('deliveries.summary.inTransitDesc')}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-green-600">
                {t('deliveries.summary.delivered')}
              </p>
              <p className="mt-2 text-3xl font-bold text-green-900">
                {deliveredCount}
              </p>
              <p className="mt-1 text-sm text-green-700">
                {t('deliveries.summary.deliveredDesc')}
              </p>
            </div>
          </div>
          {/* Filter Tabs */} {/*TODO: Make filtration combinable */}
          <div className="mb-6 flex gap-2 rounded-lg bg-white p-4 shadow-sm">
            {(['ALL', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED'] as const).map(
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
                  {status === 'ALL'
                    ? t('deliveries.filters.all')
                    : t(`deliveries.filters.${status.toLowerCase()}`)}
                </button>
              ),
            )}
          </div>
          {/* Deliveries List */}
          <div className="space-y-4">
            {filteredDeliveries.map(delivery => {
              const colors = getStatusColor(delivery.status);
              return (
                <div
                  key={delivery.id}
                  className={`rounded-lg border p-6 shadow-sm ${colors.bg} ${colors.border}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {delivery.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('deliveries.card.order')}: {delivery.orderId}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.badge}`}
                    >
                      {ts(delivery.status)}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">
                        {t('deliveries.card.destination')}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {delivery.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">
                        {t('deliveries.card.deliveryDate')}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {delivery.deliveryDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">
                        {t('deliveries.card.items')}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {delivery.items.length}{' '}
                        {t('deliveries.card.itemsCount')}
                      </p>
                    </div>
                    {delivery.receivedBy && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600">
                          {t('deliveries.card.receivedBy')}
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {delivery.receivedBy} {t('deliveries.card.at')}{' '}
                          {delivery.receivedTime}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delivery Items */}
                  <div className="mb-4 rounded-lg bg-white/50 p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      {t('deliveries.card.deliveryItems')}
                    </p>
                    <div className="space-y-2">
                      {delivery.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {tp(item.productKey)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {item.quantity} {tu(item.unit)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {delivery.note && (
                    <div className="mb-4 rounded-lg bg-white/50 p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">
                          {t('deliveries.card.note')}:
                        </span>{' '}
                        {delivery.note}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {delivery.status === 'DELIVERED' && (
                      <button
                        onClick={() => handleConfirmReceipt(delivery.id)}
                        className="flex-1 rounded-lg bg-green-600 py-2 font-medium text-white transition-all duration-200 hover:bg-green-700 active:scale-95"
                      >
                        {t('deliveries.buttons.confirmReceipt')}
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(delivery.id)}
                      className={`flex-1 rounded-lg py-2 font-medium transition-all duration-200 active:scale-95 ${
                        delivery.status === 'DELIVERED'
                          ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {t('deliveries.buttons.viewDetails')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {filteredDeliveries.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">{t('deliveries.noDeliveries')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
