import { useState } from 'react';
import Topbar from '../components/topbar';
import SidebarStockClerk from '../components/sidebarStockClerk';

interface StockAlert {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  severity: 'CRITICAL' | 'WARNING' | 'MONITOR';
  lastOrdered: string;
}

export default function StockAlertsPage() {
  const [alerts] = useState<StockAlert[]>([
    {
      id: '1',
      productName: 'Milk (Whole)',
      sku: 'ML-002',
      currentStock: 8,
      minimumStock: 25,
      unit: 'liters',
      severity: 'CRITICAL',
      lastOrdered: '3 days ago',
    },
    {
      id: '2',
      productName: 'Paper Napkins',
      sku: 'PN-007',
      currentStock: 50,
      minimumStock: 200,
      unit: 'pcs',
      severity: 'CRITICAL',
      lastOrdered: '5 days ago',
    },
    {
      id: '3',
      productName: 'Syrup - Vanilla',
      sku: 'SY-006',
      currentStock: 8,
      minimumStock: 15,
      unit: 'bottles',
      severity: 'WARNING',
      lastOrdered: '2 days ago',
    },
    {
      id: '4',
      productName: 'Coffee Beans (Arabica)',
      sku: 'CB-001',
      currentStock: 22,
      minimumStock: 20,
      unit: 'kg',
      severity: 'MONITOR',
      lastOrdered: '1 day ago',
    },
  ]);

  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'MONITOR'>('ALL');

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;
  const monitorCount = alerts.filter(a => a.severity === 'MONITOR').length;

  const filteredAlerts = alerts.filter(a =>
    selectedSeverity === 'ALL' ? true : a.severity === selectedSeverity,
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-800 border-red-300',
          text: 'text-red-600',
        };
      case 'WARNING':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          text: 'text-yellow-600',
        };
      case 'MONITOR':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800 border-blue-300',
          text: 'text-blue-600',
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

  const handleReorderNow = (id: string) => {
    console.log(`Reorder product ${id}`);
    // TODO: Implement reorder functionality
  };

  const handleAcknowledge = (id: string) => {
    console.log(`Acknowledge alert ${id}`);
    // TODO: Implement acknowledge functionality
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarStockClerk />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Stock Alerts</h1>
            <p className="text-gray-600">Low stock warnings and reorder notifications</p>
          </div>

          {/* Alert Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-semibold text-red-600">CRITICAL</p>
              <p className="mt-2 text-4xl font-bold text-red-900">{criticalCount}</p>
              <p className="mt-1 text-sm text-red-700">Immediate action needed</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
              <p className="text-sm font-semibold text-yellow-600">WARNING</p>
              <p className="mt-2 text-4xl font-bold text-yellow-900">{warningCount}</p>
              <p className="mt-1 text-sm text-yellow-700">Reorder soon</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <p className="text-sm font-semibold text-blue-600">MONITOR</p>
              <p className="mt-2 text-4xl font-bold text-blue-900">{monitorCount}</p>
              <p className="mt-1 text-sm text-blue-700">Monitor levels</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 rounded-lg bg-white p-4 shadow-sm">
            {(['ALL', 'CRITICAL', 'WARNING', 'MONITOR'] as const).map(severity => (
              <button
                key={severity}
                onClick={() => setSelectedSeverity(severity)}
                className={`rounded-lg px-4 py-2 font-medium transition-all ${
                  selectedSeverity === severity
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {severity === 'ALL' ? 'All Alerts' : severity}
              </button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map(alert => {
              const colors = getSeverityColor(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-6 shadow-sm transition-all ${colors.bg} ${colors.border}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alert.productName}
                      </h3>
                      <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.badge}`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">CURRENT</p>
                      <p className={`mt-1 text-lg font-bold ${colors.text}`}>
                        {alert.currentStock} {alert.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">MINIMUM</p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {alert.minimumStock} {alert.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">LAST ORDERED</p>
                      <p className="mt-1 text-sm text-gray-900">{alert.lastOrdered}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">SHORTAGE</p>
                      <p className="mt-1 text-lg font-bold text-red-600">
                        -{alert.minimumStock - alert.currentStock} {alert.unit}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 w-full rounded-full bg-gray-300">
                      <div
                        className={`h-full rounded-full transition-all ${colors.text.replace('text-', 'bg-')}`}
                        style={{
                          width: `${Math.min(
                            (alert.currentStock / alert.minimumStock) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReorderNow(alert.id)}
                      className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-all duration-200 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-600 hover:bg-red-700'
                          : alert.severity === 'WARNING'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                      } active:scale-95`}
                    >
                      Reorder Now
                    </button>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-95"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">No alerts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
