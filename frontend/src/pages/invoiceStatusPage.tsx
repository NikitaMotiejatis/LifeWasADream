import { useState } from 'react';
import Topbar from '../components/topbar';
import SidebarSupplier from '../components/sidebarSupplier';

interface InvoiceItem {
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: string;
  orderId: string;
  branch: string;
  status: 'PAID' | 'APPROVED' | 'PENDING' | 'OVERDUE';
  amount: number;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  note?: string;
}

export default function InvoiceStatusPage() {
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
          productName: 'Coffee Beans (Arabica)',
          quantity: 50,
          unit: 'kg',
          unitPrice: 35.0,
          totalPrice: 1750.0,
        },
        {
          productName: 'Milk (Whole)',
          quantity: 40,
          unit: 'liters',
          unitPrice: 8.5,
          totalPrice: 340.0,
        },
        {
          productName: 'Sugar',
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
          productName: 'Coffee Beans (Arabica)',
          quantity: 40,
          unit: 'kg',
          unitPrice: 35.0,
          totalPrice: 1400.0,
        },
        {
          productName: 'Paper Cups (12oz)',
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
          productName: 'Milk (Whole)',
          quantity: 100,
          unit: 'liters',
          unitPrice: 8.5,
          totalPrice: 850.0,
        },
        {
          productName: 'Syrups (Assorted)',
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
          productName: 'Sugar',
          quantity: 75,
          unit: 'kg',
          unitPrice: 12.0,
          totalPrice: 900.0,
        },
        {
          productName: 'Paper Napkins',
          quantity: 500,
          unit: 'pcs',
          unitPrice: 1.5,
          totalPrice: 750.0,
        },
      ],
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PAID' | 'APPROVED' | 'PENDING' | 'OVERDUE'>('ALL');

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
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Invoice Status</h1>
            <p className="text-gray-600">Track payment status for all deliveries</p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-gray-600">TOTAL INVOICES</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{invoices.length}</p>
              <p className="mt-1 text-sm text-gray-600">This month</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-green-600">PAID</p>
              <p className="mt-2 text-3xl font-bold text-green-900">{paidCount}</p>
              <p className="mt-1 text-sm text-green-700">Completed payments</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-600">APPROVED</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">{approvedCount}</p>
              <p className="mt-1 text-sm text-blue-700">Awaiting approval</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-yellow-600">PENDING</p>
              <p className="mt-2 text-3xl font-bold text-yellow-900">{pendingCount}</p>
              <p className="mt-1 text-sm text-yellow-700">Awaiting payment</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm font-semibold text-red-600">OVERDUE</p>
              <p className="mt-2 text-3xl font-bold text-red-900">{overdueCount}</p>
              <p className="mt-1 text-sm text-red-700">Requires attention</p>
            </div>
          </div>

          {/* Total Invoice Value */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-600">TOTAL INVOICE VALUE</p>
            <p className="mt-2 text-4xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 rounded-lg bg-white p-4 shadow-sm">
            {(['ALL', 'PAID', 'APPROVED', 'PENDING', 'OVERDUE'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg px-4 py-2 font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All Statuses' : status}
              </button>
            ))}
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.map(invoice => {
              const colors = getStatusColor(invoice.status);
              return (
                <div
                  key={invoice.id}
                  className={`rounded-lg border p-6 shadow-sm transition-all ${colors.bg} ${colors.border}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
                      <p className="text-sm text-gray-600">Order: {invoice.orderId} | {invoice.branch}</p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.badge}`}
                    >
                      {invoice.status}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">INVOICE AMOUNT</p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ${invoice.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">INVOICE DATE</p>
                      <p className="mt-1 text-sm text-gray-900">{invoice.invoiceDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">DUE DATE</p>
                      <p className="mt-1 text-sm text-gray-900">{invoice.dueDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">ITEMS</p>
                      <p className="mt-1 text-sm text-gray-900">{invoice.items.length} products</p>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div className="mb-4 rounded-lg bg-white/50 p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-700">INVOICE ITEMS</p>
                    <div className="space-y-2">
                      {invoice.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity} {item.unit} × {item.productName}
                          </span>
                          <span className="font-medium text-gray-900">
                            ${item.unitPrice.toFixed(2)} / {item.unit} = ${item.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {invoice.note && (
                    <div className="mb-4 rounded-lg bg-white/50 p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Note:</span> {invoice.note}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleViewDetails(invoice.id)}
                    className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-95"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No invoices found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
