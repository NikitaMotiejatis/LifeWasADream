import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Topbar from '@/global/components/topbar';
import SidebarStockClerk from '@/stock/components/sidebarStockClerk';
import ActionFilterSelector, {
  ActionFilterValue,
} from '../components/actionFilterSelector';
import TimePeriodFilterSelector, {
  TimePeriodValue,
} from '../components/timePeriodFilterSelector';

type AuditRecord = {
  id: string;
  productKey: string;
  sku: string;
  action: 'Update' | 'Correction' | 'Remove' | 'Add';
  previousQty: number;
  newQty: number;
  change: number;
  reasonKey: string;
  user: string;
  userId: string;
  branch: string;
  timestamp: string;
  unit: string;
};

export default function AuditHistoryPage() {
  const { t } = useTranslation();
  const tu = (unit: string) =>
    t(`auditHistory.units.${unit}`, { defaultValue: unit });

  const [records] = useState<AuditRecord[]>([
    {
      id: 'AUD-001',
      productKey: 'Coffee Beans (Arabica)',
      sku: 'CB-001',
      action: 'Update',
      previousQty: 35,
      newQty: 45,
      change: 10,
      reasonKey: 'Delivery Received',
      user: 'John Davis',
      userId: 'CLK-003',
      branch: 'Downtown Branch',
      timestamp: '2025-10-20 14:30:15',
      unit: 'kg',
    },
    {
      id: 'AUD-002',
      productKey: 'Milk (Whole)',
      sku: 'ML-002',
      action: 'Correction',
      previousQty: 20,
      newQty: 15,
      change: -5,
      reasonKey: 'Stock Recount',
      user: 'Sarah Kim',
      userId: 'CLK-004',
      branch: 'Downtown Branch',
      timestamp: '2025-10-20 13:15:42',
      unit: 'liters',
    },
    {
      id: 'AUD-003',
      productKey: 'Croissants',
      sku: 'CR-005',
      action: 'Remove',
      previousQty: 30,
      newQty: 25,
      change: -5,
      reasonKey: 'Waste/Spoilage',
      user: 'John Davis',
      userId: 'CLK-003',
      branch: 'Downtown Branch',
      timestamp: '2025-10-20 11:45:30',
      unit: 'pcs',
    },
    {
      id: 'AUD-004',
      productKey: 'Sugar',
      sku: 'SG-003',
      action: 'Update',
      previousQty: 25,
      newQty: 30,
      change: 5,
      reasonKey: 'Delivery Received',
      user: 'Mike Johnson',
      userId: 'CLK-001',
      branch: 'Downtown Branch',
      timestamp: '2025-10-20 10:20:15',
      unit: 'kg',
    },
    {
      id: 'AUD-005',
      productKey: 'Paper Cups12oz',
      sku: 'PC-004',
      action: 'Add',
      previousQty: 450,
      newQty: 500,
      change: 50,
      reasonKey: 'Transfer In',
      user: 'Sarah Kim',
      userId: 'CLK-004',
      branch: 'Downtown Branch',
      timestamp: '2025-10-20 09:15:00',
      unit: 'pcs',
    },
  ]);

<<<<<<< HEAD
  const [filterAction, setFilterAction] = useState<ActionFilterValue>('ALL');
  const [filterTimePeriod, setFilterTimePeriod] =
    useState<TimePeriodValue>('Today');
=======
  const [filterAction, setFilterAction] = useState<
    'ALL' | 'Update' | 'Correction' | 'Remove' | 'Add'
  >('ALL');
  const [filterTimePeriod, setFilterTimePeriod] = useState('Today');
>>>>>>> c766386 (Big localization)
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(record => {
    const productName = t(`auditHistory.products.${record.productKey}`);
    const matchesAction =
      filterAction === 'ALL' || record.action === filterAction;
    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Update':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Correction':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Remove':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Add':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleExportReport = () => {
    console.log('Export audit report');
    // TODO: Implement export functionality
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
                {t('auditHistory.pageTitle')}
              </h1>
              <p className="text-gray-600">{t('auditHistory.pageSubtitle')}</p>
            </div>
            <button className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white shadow-md transition-all duration-200 hover:bg-green-700 active:scale-95">
              {t('auditHistory.exportReport')}
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {t('auditHistory.filters.actionLabel')}
                </label>
<<<<<<< HEAD
                <ActionFilterSelector
                  selected={filterAction}
                  onChange={setFilterAction}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  {t('auditHistory.filters.timePeriodLabel')}
                </label>
                <TimePeriodFilterSelector
                  selected={filterTimePeriod}
                  onChange={setFilterTimePeriod}
                />
=======
                <select
                  value={filterAction}
                  onChange={e => setFilterAction(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="ALL">
                    {t('auditHistory.filters.allActions')}
                  </option>
                  <option value="Update">
                    {t('auditHistory.filters.update')}
                  </option>
                  <option value="Correction">
                    {t('auditHistory.filters.correction')}
                  </option>
                  <option value="Remove">
                    {t('auditHistory.filters.remove')}
                  </option>
                  <option value="Add">{t('auditHistory.filters.add')}</option>
                </select>
>>>>>>> c766386 (Big localization)
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
<<<<<<< HEAD
                  {t('auditHistory.filters.search')}
=======
                  {t('auditHistory.filters.timePeriodLabel')}
                </label>
                <select
                  value={filterTimePeriod}
                  onChange={e => setFilterTimePeriod(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  <option value="Today">
                    {t('auditHistory.filters.today')}
                  </option>
                  <option value="This Week">
                    {t('auditHistory.filters.thisWeek')}
                  </option>
                  <option value="This Month">
                    {t('auditHistory.filters.thisMonth')}
                  </option>
                  <option value="All Time">
                    {t('auditHistory.filters.allTime')}
                  </option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Search
>>>>>>> c766386 (Big localization)
                </label>
                <input
                  type="text"
                  placeholder={t('auditHistory.filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-1.5 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Audit Records Table */}
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    'product',
                    'action',
                    'previousQty',
                    'newQty',
                    'change',
                    'reason',
                    'user',
                    'timestamp',
                  ].map(key => (
                    <th
                      key={key}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
                    >
                      {t(`auditHistory.table.${key}`)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map(record => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-200 transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {t(`auditHistory.products.${record.productKey}`)}
                        </p>
                        <p className="text-sm text-gray-600">
<<<<<<< HEAD
                          {t(`auditHistory.sku`)} {record.sku}
=======
                          SKU: {record.sku}
>>>>>>> c766386 (Big localization)
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getActionColor(record.action)}`}
                      >
                        {t(`auditHistory.actions.${record.action}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.previousQty} {tu(record.unit)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.newQty} {tu(record.unit)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-semibold ${getChangeColor(record.change)}`}
                    >
                      {record.change > 0 ? '+' : ''}
                      {record.change} {tu(record.unit)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {t(`auditHistory.reasons.${record.reasonKey}`)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {record.user}
                        </p>
                        <p className="text-xs text-gray-600">{record.userId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">{t('auditHistory.noRecords')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
