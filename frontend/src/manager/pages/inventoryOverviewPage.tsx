import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import ManagerLayout from '../components/managerLayout';
import { Filter, Package, AlertTriangle } from 'lucide-react';
import { mockInventory, InventoryItem } from '../mockData';
import DropdownSelector from '@/global/components/dropdownSelector';

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

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  isLoading,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  isLoading: boolean;
}) => (
  <div className="flex h-full flex-col justify-between rounded-lg bg-white p-6 shadow-md">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    {isLoading ? (
      <div className="mt-2 h-10 w-3/4 animate-pulse rounded bg-gray-200" />
    ) : (
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    )}
    <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
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

  const availableBranches = Array.from(
    new Set(mockInventory.map(item => item.branch)),
  );
  const availableStatuses = ['ok', 'low', 'critical'];

  const filteredInventory = inventory.filter(item => {
    const branchMatch = filterBranch === 'all' || item.branch === filterBranch;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    return branchMatch && statusMatch;
  });

  // Mock stats for the cards
  const totalItems = mockInventory.length;
  const lowStockCount = mockInventory.filter(
    item => item.status === 'low' || item.status === 'critical',
  ).length;

  return (
    <ManagerLayout>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('manager.inventory.pageTitle')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('manager.inventory.pageSubtitle')}
        </p>
      </header>

      {/* Stat Cards */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('manager.inventory.detailsTitle')}
          </h2>
          <div className="flex space-x-4">
            <Filter className="mt-2 h-5 w-5 text-gray-400" />
            {/* Branch Filter */}
            <DropdownSelector
              options={[
                { value: 'all', label: t('manager.inventory.allBranches') },
                ...availableBranches.map(b => ({ value: b, label: t(b) })),
              ]}
              selected={filterBranch}
              onChange={value => {
                setFilterBranch(value);
              }}
              buttonClassName="w-36 px-3 py-2 text-sm"
            />

            {/* Status Filter */}
            <DropdownSelector
              options={[
                { value: 'all', label: t('manager.inventory.allStatuses') },
                ...availableStatuses.map(s => ({
                  value: s,
                  label: t(`manager.inventory.${s}`),
                })),
              ]}
              selected={filterStatus}
              onChange={value => {
                setFilterStatus(value as 'ok' | 'low' | 'critical' | 'all');
              }}
              buttonClassName="w-36 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['sku', 'product', 'branch', 'inStock', 'unit', 'status'].map(
                  key => (
                    <th
                      key={key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                    >
                      {t(`manager.inventory.table.${key}`)}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredInventory.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-500">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {t(item.product)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {t(item.branch)}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    {item.inStock}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(item.status)}`}
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
