import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Topbar from '@/global/components/topbar';
import SidebarStockClerk from '@/stock/components/sidebarStockClerk';
import SearchIcon from '@/icons/searchIcon';
import CategoryDropdown, {
  CategoryValue,
} from '@/stock/components/categorySelector';

type StockItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumLevel: number;
  unit: string;
  lastUpdatedHours?: number;
  lastUpdatedDays?: number;
};

export default function StockUpdatesPage() {
  const { t } = useTranslation();

  const [stocks] = useState<StockItem[]>([
    {
      id: '1',
      name: 'Coffee Beans (Arabica)',
      sku: 'CB-001',
      category: 'Raw Materials',
      currentStock: 45,
      minimumLevel: 20,
      unit: 'kg',
      lastUpdatedHours: 2,
    },
    {
      id: '2',
      name: 'Milk (Whole)',
      sku: 'ML-002',
      category: 'Dairy',
      currentStock: 15,
      minimumLevel: 25,
      unit: 'liters',
      lastUpdatedHours: 3,
    },
    {
      id: '3',
      name: 'Sugar',
      sku: 'SG-003',
      category: 'Raw Materials',
      currentStock: 30,
      minimumLevel: 15,
      unit: 'kg',
      lastUpdatedDays: 1,
    },
    {
      id: '4',
      name: 'Paper Cups (12oz)',
      sku: 'PC-004',
      category: 'Packaging',
      currentStock: 500,
      minimumLevel: 200,
      unit: 'pcs',
      lastUpdatedHours: 5,
    },
    {
      id: '5',
      name: 'Croissants',
      sku: 'CR-005',
      category: 'Bakery',
      currentStock: 25,
      minimumLevel: 10,
      unit: 'pcs',
      lastUpdatedHours: 4,
    },
    {
      id: '6',
      name: 'Syrup - Vanilla',
      sku: 'SY-006',
      category: 'Ingredients',
      currentStock: 8,
      minimumLevel: 5,
      unit: 'bottles',
      lastUpdatedHours: 6,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryValue>('All Categories');

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch =
      t(`stockUpdates.products.${stock.name}`)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All Categories' ||
      stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isLowStock = (current: number, minimum: number) => current < minimum;

  const handleUpdateStock = (id: string) => {
    console.log(`Update stock for item ${id}`);
    // TODO: Implement stock update modal/form
  };

  const formatLastUpdated = (item: StockItem) => {
    if (item.lastUpdatedDays !== undefined) {
      return t('stockUpdates.daysAgo', { count: item.lastUpdatedDays });
    }
    if (item.lastUpdatedHours !== undefined) {
      return t('stockUpdates.hoursAgo', { count: item.lastUpdatedHours });
    }
    return t('stockUpdates.lastUpdated');
  };

  const tUnit = (unit: string, count: number) => {
    if (unit === 'kg') return count + ' ' + t(`stockUpdates.units.${unit}`);
    return t(`stockUpdates.units.${unit}`, { count });
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarStockClerk />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {t('stockUpdates.pageTitle')}
            </h1>
            <p className="text-gray-600">{t('stockUpdates.pageSubtitle')}</p>
          </div>

          <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="relative max-w-xl min-w-0 flex-1">
                <input
                  type="text"
                  placeholder={t('stockUpdates.searchPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 pr-9 pl-3 text-sm placeholder-gray-500 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
                <SearchIcon className="pointer-events-none absolute top-1/2 right-2.5 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>

              <CategoryDropdown
                selected={selectedCategory}
                onChange={value => setSelectedCategory(value)}
              />
            </div>
          </div>

          {/* Stock Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStocks.map(stock => (
              <div
                key={stock.id}
                className={`rounded-lg border p-6 shadow-sm transition-all ${
                  isLowStock(stock.currentStock, stock.minimumLevel)
                    ? 'border-red-200 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {t(`stockUpdates.products.${stock.name}`)}
                  </h3>
                  <p className="text-sm text-gray-600">SKU: {stock.sku}</p>
                  <p className="text-xs text-gray-500">
                    {t(`stockUpdates.categories.${stock.category}`)}
                  </p>
                </div>

                <div className="mb-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {t('stockUpdates.currentStock')}:
                    </span>
                    <span
                      className={`font-semibold ${isLowStock(stock.currentStock, stock.minimumLevel) ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {tUnit(stock.unit, stock.currentStock)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {t('stockUpdates.minimumLevel')}:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {tUnit(stock.unit, stock.minimumLevel)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {t('stockUpdates.lastUpdated')}:
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatLastUpdated(stock)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${isLowStock(stock.currentStock, stock.minimumLevel) ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{
                        width: `${Math.min((stock.currentStock / (stock.minimumLevel * 2)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleUpdateStock(stock.id)}
                  className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-95"
                >
                  {t('stockUpdates.updateStockButton')}
                </button>
              </div>
            ))}
          </div>

          {filteredStocks.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">{t('stockUpdates.noItems')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
