import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManagerLayout from '../components/managerLayout';
import {
  Package,
  Percent,
  Search,
  Filter,
  Edit2,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react';

interface ItemVatRate {
  id: number;
  itemId: string;
  itemName: string;
  category: string;
  vatRate: number;
  sku: string;
  price: number;
}

const ItemVatPage: React.FC = () => {
  const { t } = useTranslation();

  const [items, setItems] = useState<ItemVatRate[]>([
    {
      id: 1,
      itemId: 'PROD-001',
      itemName: t('products.Espresso Shot'),
      category: t('menu.categories.hot drinks'),
      vatRate: 21,
      sku: 'ESP001',
      price: 3.5,
    },
    {
      id: 2,
      itemId: 'PROD-002',
      itemName: t('products.croissant'),
      category: t('menu.categories.pastries'),
      vatRate: 9,
      sku: 'CRS002',
      price: 2.5,
    },
    {
      id: 3,
      itemId: 'PROD-003',
      itemName: t('products.House Blend Coffee'),
      category: t('stockUpdates.categories.Raw Materials'),
      vatRate: 5,
      sku: 'BEAN003',
      price: 15.99,
    },
    {
      id: 4,
      itemId: 'PROD-004',
      itemName: t('products.Iced Latte'),
      category: t('menu.categories.cold drinks'),
      vatRate: 15,
      sku: 'ICED004',
      price: 4.5,
    },
    {
      id: 5,
      itemId: 'PROD-005',
      itemName: t('products.orangeJuice'),
      category: t('menu.categories.cold drinks'),
      vatRate: 9,
      sku: 'WTR005',
      price: 1.5,
    },
    {
      id: 6,
      itemId: 'PROD-006',
      itemName: t('products.Blueberry Muffin'),
      category: t('menu.categories.pastries'),
      vatRate: 12,
      sku: 'CAKE006',
      price: 6.99,
    },
  ]);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [vatRateInput, setVatRateInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);
  const [bulkVatRate, setBulkVatRate] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const categories = [
    'all',
    ...Array.from(new Set(items.map(item => item.category))),
  ];

  const filteredItems = items.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const stats = {
    totalItems: items.length,
    averageVatRate: (
      items.reduce((sum, item) => sum + item.vatRate, 0) / items.length
    ).toFixed(1),
    itemsWithZeroVat: items.filter(item => item.vatRate === 0).length,
  };

  // Start editing
  const handleEdit = (item: ItemVatRate) => {
    setEditingItemId(item.id);
    setVatRateInput(item.vatRate.toString());
    setValidationError(null);
  };

  const validateRate = (
    rateStr: string,
  ): { valid: boolean; error?: string } => {
    if (rateStr.trim() === '') {
      return {
        valid: false,
        error: t('itemVat.validation.required'),
      };
    }

    const rate = parseFloat(rateStr);
    if (isNaN(rate)) {
      return {
        valid: false,
        error: t('itemVat.validation.nan'),
      };
    }

    if (rate < 0) {
      return {
        valid: false,
        error: t('itemVat.validation.negative'),
      };
    }

    if (rate > 100) {
      return {
        valid: false,
        error: t('itemVat.validation.exceeds'),
      };
    }

    return { valid: true };
  };

  // Save changes
  const handleSave = () => {
    if (editingItemId === null) return;

    const validation = validateRate(vatRateInput);
    if (!validation.valid && validation.error) {
      setValidationError(validation.error);
      return;
    }

    setItems(prev =>
      prev.map(item => {
        if (item.id === editingItemId) {
          return {
            ...item,
            vatRate: parseFloat(vatRateInput),
          };
        }
        return item;
      }),
    );

    handleCancel();
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingItemId(null);
    setVatRateInput('');
    setValidationError(null);
  };

  // Bulk selection
  const handleBulkSelectAll = () => {
    if (bulkSelection.length === filteredItems.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(filteredItems.map(item => item.id));
    }
  };

  const handleBulkSelect = (itemId: number) => {
    setBulkSelection(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  };

  // Apply bulk VAT rate
  const handleBulkApply = () => {
    if (bulkSelection.length === 0) return;

    const validation = validateRate(bulkVatRate);
    if (!validation.valid && validation.error) {
      alert(validation.error);
      return;
    }

    const newRate = parseFloat(bulkVatRate);

    setItems(prev =>
      prev.map(item => {
        if (bulkSelection.includes(item.id)) {
          return {
            ...item,
            vatRate: newRate,
          };
        }
        return item;
      }),
    );

    setBulkSelection([]);
    setBulkVatRate('');
  };

  return (
    <ManagerLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('itemVat.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t('itemVat.subtitle')}</p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t('itemVat.stats.totalItems')}
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.totalItems}
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('itemVat.stats.zeroVat')}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.itemsWithZeroVat}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkSelection.length > 0 && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    {t('itemVat.bulkActions.selected', {
                      count: bulkSelection.length,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={bulkVatRate}
                    onChange={e =>
                      setBulkVatRate(e.target.value.replace(/[^0-9.]/g, ''))
                    }
                    placeholder={t('itemVat.ratePlaceholder')}
                    className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <span className="text-gray-600">%</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApply}
                    className="rounded bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                  >
                    {t('itemVat.bulkActions.apply')}
                  </button>
                  <button
                    onClick={() => setBulkSelection([])}
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 rounded-lg border bg-white p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder={t('itemVat.searchPlaceholder')}
                  className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500 md:w-64"
                />
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all'
                        ? t('itemVat.allCategories')
                        : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        bulkSelection.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={handleBulkSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.item')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.category')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.vatRate')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    {t('itemVat.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={bulkSelection.includes(item.id)}
                        onChange={() => handleBulkSelect(item.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.itemName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.sku} • ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingItemId === item.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={vatRateInput}
                                onChange={e =>
                                  setVatRateInput(
                                    e.target.value.replace(/[^0-9.]/g, ''),
                                  )
                                }
                                placeholder={t('itemVat.ratePlaceholder')}
                                className="w-24 rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm"
                              />
                              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
                                %
                              </span>
                            </div>
                          </div>
                          {validationError && (
                            <p className="text-xs text-red-600">
                              {validationError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {item.vatRate}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingItemId === item.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                          >
                            {t('common.save')}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          {t('common.edit')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">{t('itemVat.noItemsFound')}</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('itemVat.clearSearch')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ItemVatPage;
