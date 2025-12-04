import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Topbar from '@/global/components/topbar';
import SidebarSupplier from '@/supplier/components/sidebarSupplier';
import InvoiceCard from '@/supplier/components/invoiceCard';
import { useCurrency } from '@/global/contexts/currencyContext';

type InvoiceItem = {
  productKey: string;
  quantity: number;
  unit: 'kg' | 'liters' | 'pcs' | 'bottles';
  unitPrice: number;
  totalPrice: number;
};

export type Invoice = {
  id: string;
  orderId: string;
  branch: string;
  status: 'PAID' | 'APPROVED' | 'PENDING' | 'OVERDUE';
  amount: number;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  note?: string;
};

export default function InvoiceStatusPage() {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  const tp = (key: string) =>
    t(`invoices.products.${key}`, { defaultValue: key });
  const tu = (unit: string) =>
    t(`invoices.units.${unit}`, { defaultValue: unit });
  const ts = (status: string) => t(`invoices.statuses.${status}`);

  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-2025-0847',
      orderId: 'PO-4521',
      branch: 'Downtown Branch',
      status: 'PAID',
      amount: 2450,
      invoiceDate: '2025-10-18',
      dueDate: '2025-11-02',
      items: [
        {
          productKey: 'Coffee Beans (Arabica)',
          quantity: 50,
          unit: 'kg',
          unitPrice: 35.0,
          totalPrice: 1750.0,
        },
        {
          productKey: 'Milk (Whole)',
          quantity: 40,
          unit: 'liters',
          unitPrice: 8.5,
          totalPrice: 340.0,
        },
        {
          productKey: 'Sugar',
          quantity: 25,
          unit: 'kg',
          unitPrice: 12.0,
          totalPrice: 300.0,
        },
      ],
      note: 'Paid on 2025-10-19 via bank transfer',
    },
    {
      id: 'INV-2025-0848',
      orderId: 'PO-4528',
      branch: 'Westside Branch',
      status: 'APPROVED',
      amount: 1890,
      invoiceDate: '2025-10-19',
      dueDate: '2025-11-03',
      items: [
        {
          productKey: 'Coffee Beans (Arabica)',
          quantity: 40,
          unit: 'kg',
          unitPrice: 35.0,
          totalPrice: 1400.0,
        },
        {
          productKey: 'Paper Cups (12oz)',
          quantity: 350,
          unit: 'pcs',
          unitPrice: 1.4,
          totalPrice: 490.0,
        },
      ],
    },
    {
      id: 'INV-2025-0849',
      orderId: 'PO-4530',
      branch: 'North Branch',
      status: 'PENDING',
      amount: 3200,
      invoiceDate: '2025-10-20',
      dueDate: '2025-11-04',
      items: [
        {
          productKey: 'Milk (Whole)',
          quantity: 100,
          unit: 'liters',
          unitPrice: 8.5,
          totalPrice: 850.0,
        },
        {
          productKey: 'Syrups (Assorted)',
          quantity: 50,
          unit: 'bottles',
          unitPrice: 47.0,
          totalPrice: 2350.0,
        },
      ],
    },
    {
      id: 'INV-2025-0850',
      orderId: 'PO-4525',
      branch: 'Downtown Branch',
      status: 'OVERDUE',
      amount: 1650,
      invoiceDate: '2025-10-10',
      dueDate: '2025-10-25',
      items: [
        {
          productKey: 'Sugar',
          quantity: 75,
          unit: 'kg',
          unitPrice: 12.0,
          totalPrice: 900.0,
        },
        {
          productKey: 'Paper Napkins',
          quantity: 500,
          unit: 'pcs',
          unitPrice: 1.5,
          totalPrice: 750.0,
        },
      ],
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'PAID' | 'APPROVED' | 'PENDING' | 'OVERDUE'
  >('ALL');

  const paidCount = invoices.filter(i => i.status === 'PAID').length;
  const approvedCount = invoices.filter(i => i.status === 'APPROVED').length;
  const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);

  const filteredInvoices = invoices.filter(i =>
    selectedStatus === 'ALL' ? true : i.status === selectedStatus,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800 border-green-300',
        };
      case 'APPROVED':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'PENDING':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };
      case 'OVERDUE':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-800 border-red-300',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
        };
    }
  };

  const handleViewDetails = (id: string) => {
    console.log(`View details for invoice ${id}`);
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
              {t('invoices.pageTitle')}
            </h1>
            <p className="text-gray-600">{t('invoices.pageSubtitle')}</p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-600">
                {t('invoices.summary.totalInvoices')}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {invoices.length}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {t('invoices.summary.thisMonth')}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-green-600">
                {t('invoices.summary.paid')}
              </p>
              <p className="mt-2 text-3xl font-bold text-green-900">
                {paidCount}
              </p>
              <p className="mt-1 text-sm text-green-700">
                {t('invoices.summary.paidDesc')}
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-600">
                {t('invoices.summary.approved')}
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-900">
                {approvedCount}
              </p>
              <p className="mt-1 text-sm text-blue-700">
                {t('invoices.summary.approvedDesc')}
              </p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-yellow-600">
                {t('invoices.summary.pending')}
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-900">
                {pendingCount}
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                {t('invoices.summary.pendingDesc')}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-red-600">
                {t('invoices.summary.overdue')}
              </p>
              <p className="mt-2 text-3xl font-bold text-red-900">
                {overdueCount}
              </p>
              <p className="mt-1 text-sm text-red-700">
                {t('invoices.summary.overdueDesc')}
              </p>
            </div>
          </div>

          {/* Total Value */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-600">
              {t('invoices.totalValue')}
            </p>
            <p className="mt-2 text-4xl font-bold text-gray-900">
              {formatPrice(totalAmount)}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 rounded-lg bg-white p-4 shadow-sm">
            {(['ALL', 'PAID', 'APPROVED', 'PENDING', 'OVERDUE'] as const).map(
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
                    ? t('invoices.filters.all')
                    : t(`invoices.filters.${status.toLowerCase()}`)}
                </button>
              ),
            )}
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.map(invoice => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                translateProduct={tp}
                translateUnit={tu}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">{t('invoices.noInvoices')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
