import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import ManagerLayout from '../components/managerLayout';
import { Filter, Package, AlertTriangle } from 'lucide-react';
import { mockInventory, InventoryItem } from '../mockData';

const getStatusColor = (status: InventoryItem['status']) => {
  switch (status) {
    case 'ok':
      return 'bg-green-100 text-green-800';
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StatCard = ({ title, value, subtitle, icon: Icon, iconColor, isLoading }: { title: string; value: string | number; subtitle: string; icon: React.ElementType; iconColor: string; isLoading: boolean }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    {isLoading ? (
      <div className="h-10 w-3/4 bg-gray-200 animate-pulse mt-2 rounded" />
    ) : (
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    )}
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);

export default function InventoryOverviewPage() {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setInventory(mockInventory);
      setIsLoading(false);
    }, 200);
  }, []);

  const availableBranches = Array.from(new Set(mockInventory.map(item => item.branch)));
  const availableStatuses = ['ok', 'low', 'critical'];

  const filteredInventory = inventory.filter(item => {
    const branchMatch = filterBranch === 'all' || item.branch === filterBranch;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    return branchMatch && statusMatch;
  });

  // Mock stats for the cards
  const totalItems = mockInventory.length;
  const lowStockCount = mockInventory.filter(item => item.status === 'low' || item.status === 'critical').length;

  return (
    <ManagerLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t('manager.inventory.pageTitle')}</h1>
        <p className="text-sm text-gray-500">{t('manager.inventory.pageSubtitle')}</p>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <StatCard
          title={t('manager.inventory.stats.totalItems.title')}
          value={totalItems}
          subtitle={t('manager.inventory.stats.totalItems.subtitle')}
          icon={Package}
          iconColor="text-blue-500"
          isLoading={isLoading}
        />
        <StatCard
          title={t('manager.inventory.stats.lowStock.title')}
          value={lowStockCount}
          subtitle={t('manager.inventory.stats.lowStock.subtitle')}
          icon={AlertTriangle}
          iconColor="text-red-500"
          isLoading={isLoading}
        />
      </section>

      {/* Filters and Table */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('manager.inventory.detailsTitle')}</h2>
          <div className="flex space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            {/* Branch Filter */}
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="block pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
            >
              <option value="all">{t('manager.inventory.allBranches')}</option>
              {availableBranches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
            >
              <option value="all">{t('manager.inventory.allStatuses')}</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{t(`manager.inventory.${status}`)}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['sku', 'product', 'branch', 'inStock', 'unit', 'status'].map(key => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {t(`manager.inventory.table.${key}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.inStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}
                    >
                      {t(`manager.inventory.${item.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ManagerLayout>
  );
}
