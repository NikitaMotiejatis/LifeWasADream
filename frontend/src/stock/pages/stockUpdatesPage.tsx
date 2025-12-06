import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Topbar from '@/global/components/topbar';
import SidebarStockClerk from '@/stock/components/sidebarStockClerk';
import SearchIcon from '@/icons/searchIcon';
import CategoryDropdown, {
  CategoryValue,
} from '@/stock/components/categorySelector';
import { saveStockAdjustment } from '@/stock/utils/mockInventoryApi';

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

const initialStocks: StockItem[] = [
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
];

export default function StockUpdatesPage() {
  const { t } = useTranslation();

  const [stocks, setStocks] = useState<StockItem[]>(initialStocks);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryValue>('All Categories');
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [formStatus, setFormStatus] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedStock = selectedStockId
    ? stocks.find(stock => stock.id === selectedStockId) ?? null
    : null;

  useEffect(() => {
    if (selectedStockId && !selectedStock) {
      setSelectedStockId(null);
      setUpdateQuantity('');
      setUpdateNote('');
      setFormStatus(null);
    }
  }, [selectedStockId, selectedStock]);

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

  const handleUpdateStock = (item: StockItem) => {
    if (selectedStockId === item.id) {
      setSelectedStockId(null);
      setUpdateQuantity('');
      setUpdateNote('');
      setFormStatus(null);
      return;
    }

    setSelectedStockId(item.id);
    setUpdateQuantity(String(item.currentStock));
    setUpdateNote('');
    setFormStatus(null);
  };

  const handleApplyUpdate = async () => {
    if (!selectedStock) return;

    if (updateQuantity.trim() === '') {
      setFormStatus({
        type: 'error',
        message: t('stockUpdates.form.errors.requiredQuantity'),
      });
      return;
    }

    const parsedQuantity = Number(updateQuantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
      setFormStatus({
        type: 'error',
        message: t('stockUpdates.form.errors.invalidQuantity'),
      });
      return;
    }

    if (parsedQuantity === selectedStock.currentStock) {
      setFormStatus({
        type: 'error',
        message: t('stockUpdates.form.errors.sameQuantity'),
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveStockAdjustment({
        id: selectedStock.id,
        nextQuantity: parsedQuantity,
        note: updateNote.trim(),
      });

      setStocks(prev =>
        prev.map(stock =>
          stock.id === selectedStock.id
            ? {
                ...stock,
                currentStock: parsedQuantity,
                lastUpdatedHours: 0,
                lastUpdatedDays: undefined,
              }
            : stock,
        ),
      );
      setUpdateQuantity(String(parsedQuantity));
      setUpdateNote('');
      setFormStatus({
        type: 'success',
        message: t('stockUpdates.form.successMessage'),
      });
    } catch (e) {
      setFormStatus({
        type: 'error',
        message: t('stockUpdates.form.errors.generic'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    if (!selectedStock) return;
    setUpdateQuantity(String(selectedStock.currentStock));
    setUpdateNote('');
    setFormStatus(null);
  };

  const formatLastUpdated = (item: StockItem) => {
    if (item.lastUpdatedDays !== undefined) {
      return t('stockUpdates.daysAgo', { count: item.lastUpdatedDays });
    }
    if (item.lastUpdatedHours !== undefined) {
      if (item.lastUpdatedHours === 0) {
        return t('stockUpdates.justNow');
      }
      return t('stockUpdates.hoursAgo', { count: item.lastUpdatedHours });
    }
    return t('stockUpdates.lastUpdated');
  };

  const tUnit = (unit: string, count: number) => {
    if (unit === 'kg') return count + ' ' + t(`stockUpdates.units.${unit}`);
    return t(`stockUpdates.units.${unit}`, { count });
  };

  const unitStep = (unit: string) => (unit === 'kg' || unit === 'liters' ? '0.1' : '1');

  // TODO: adjust precision when integrating real units API

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

          {selectedStock && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {t('stockUpdates.detailPanel.pendingTag')}
                  </p>
                  <p className="text-xl font-semibold text-blue-950">
                    {t(`stockUpdates.products.${selectedStock.name}`)}
                  </p>
                  <p className="text-sm text-blue-800">
                    {t('stockUpdates.detailPanel.subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateStock(selectedStock)}
                  className="self-start rounded-full px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-white"
                >
                  {t('stockUpdates.clearSelection')}
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    {t('stockUpdates.detailPanel.currentStockLabel')}
                  </p>
                  <p className="text-lg font-semibold text-blue-900">
                    {tUnit(selectedStock.unit, selectedStock.currentStock)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    {t('stockUpdates.detailPanel.minimumStockLabel')}
                  </p>
                  <p className="text-lg font-semibold text-blue-900">
                    {tUnit(selectedStock.unit, selectedStock.minimumLevel)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    {t('stockUpdates.detailPanel.skuLabel')}
                  </p>
                  <p className="text-lg font-semibold text-blue-900">
                    {selectedStock.sku}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-blue-700">
                    {t('stockUpdates.detailPanel.lastUpdatedLabel')}
                  </p>
                  <p className="text-sm text-blue-900">
                    {formatLastUpdated(selectedStock)}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-semibold text-blue-900">
                  {t('stockUpdates.form.quantityLabel')}
                  <input
                    type="number"
                    min="0"
                    step={unitStep(selectedStock.unit)}
                    inputMode="decimal"
                    value={updateQuantity}
                    onChange={e => setUpdateQuantity(e.target.value)}
                    className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-xs font-normal text-blue-700">
                    {t('stockUpdates.form.quantityHelper')}
                  </span>
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold text-blue-900">
                  {t('stockUpdates.form.noteLabel')}
                  <textarea
                    rows={3}
                    maxLength={160}
                    placeholder={t('stockUpdates.form.notePlaceholder')}
                    value={updateNote}
                    onChange={e => setUpdateNote(e.target.value)}
                    className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
              </div>
              {formStatus && (
                <div
                  className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                    formStatus.type === 'success'
                      ? 'border-green-200 bg-green-50 text-green-900'
                      : 'border-red-200 bg-red-50 text-red-900'
                  }`}
                >
                  {formStatus.message}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleApplyUpdate}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving
                    ? t('stockUpdates.form.savingLabel')
                    : t('stockUpdates.form.applyButton')}
                </button>
                <button
                  type="button"
                  disabled={!selectedStock || isSaving}
                  onClick={handleResetForm}
                  className="rounded-lg border border-blue-200 px-4 py-2 font-semibold text-blue-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('stockUpdates.form.resetButton')}
                </button>
              </div>
              <p className="mt-4 text-xs text-blue-800">
                {t('stockUpdates.form.hint')}
              </p>
            </div>
          )}

          {/* Stock Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStocks.map(stock => {
              const isSelected = selectedStockId === stock.id;
              return (
                <div
                  key={stock.id}
                  className={`rounded-lg border p-6 shadow-sm transition-all ${
                    isSelected
                      ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                      : isLowStock(stock.currentStock, stock.minimumLevel)
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
                        className={`font-semibold ${
                          isLowStock(stock.currentStock, stock.minimumLevel)
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
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
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleUpdateStock(stock)}
                    className={`w-full rounded-lg py-2 font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                      isSelected
                        ? 'bg-blue-900 hover:bg-blue-900'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSelected
                      ? t('stockUpdates.selectedButtonLabel')
                      : t('stockUpdates.updateStockButton')}
                  </button>
                </div>
              );
            })}
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
